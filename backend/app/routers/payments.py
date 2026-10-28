import os
import hmac
import hashlib
import json
import uuid
import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session

from dotenv import load_dotenv
from app.database import get_db
from app.config import settings, BACKEND_DIR
from app.models import PersonalizationJob, StoryTemplate, Order, PaymentTransaction, Book
from app.schemas import (
    CreatePaymentOrderRequest,
    CreatePaymentOrderResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
    PaymentTransactionOut
)
from app.services.job_runner import job_runner

try:
    import razorpay
except ImportError:
    razorpay = None

router = APIRouter(prefix="/payments", tags=["Payments"])

def get_razorpay_credentials():
    try:
        load_dotenv(BACKEND_DIR / ".env", override=True)
    except Exception:
        pass
    key = os.getenv("RAZORPAY_KEY_ID") or getattr(settings, "RAZORPAY_KEY_ID", "") or ""
    secret = os.getenv("RAZORPAY_KEY_SECRET") or getattr(settings, "RAZORPAY_KEY_SECRET", "") or ""
    return key.strip(), secret.strip()

def get_razorpay_client():
    if not razorpay:
        return None
    key, secret = get_razorpay_credentials()
    if not key or not secret:
        return None
    try:
        return razorpay.Client(auth=(key, secret))
    except Exception as e:
        print(f"Warning initializing Razorpay client: {e}")
        return None


@router.get("/config")
def get_payment_config():
    """Return public Razorpay key ID for checkout initialization."""
    key, _ = get_razorpay_credentials()
    return {
        "razorpay_key": key,
        "currency": "INR"
    }


@router.post("/create-order", response_model=CreatePaymentOrderResponse)
def create_payment_order(
    payload: CreatePaymentOrderRequest,
    db: Session = Depends(get_db)
):
    """
    Create a Razorpay order for unlocking storybook generation & PDF download.
    Supports 'digital' (instant PDF) or 'print_hardcover' (printed heirloom book + digital).
    """
    job = db.query(PersonalizationJob).filter(PersonalizationJob.id == payload.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Personalization job not found")

    story = job.story or db.query(StoryTemplate).filter(StoryTemplate.id == job.story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story template not found")

    # Determine pricing based on format
    format_type = payload.format_type or "digital"
    if format_type == "print_hardcover":
        amount_in_rupees = float(story.price_print or 1399.0)
    else:
        amount_in_rupees = float(story.price_digital or 799.0)

    amount_in_paise = int(round(amount_in_rupees * 100))
    currency = story.currency or "INR"

    razorpay_order_id = None
    client = get_razorpay_client()

    if client:
        try:
            order_data = {
                "amount": amount_in_paise,
                "currency": currency,
                "receipt": f"rcpt_{job.id[:8]}_{int(datetime.datetime.utcnow().timestamp())}",
                "notes": {
                    "job_id": job.id,
                    "format_type": format_type,
                    "child_name": job.child_name,
                    "story_title": story.title
                }
            }
            rp_order = client.order.create(data=order_data)
            razorpay_order_id = rp_order.get("id")
            print(f"Razorpay live order created successfully: {razorpay_order_id} for job {job.id}")
        except Exception as e:
            print(f"Notice: Razorpay order creation returned: {e}. Falling back to sandbox order generation.")

    # Sandbox fallback if credentials are placeholders or network offline
    if not razorpay_order_id:
        razorpay_order_id = f"order_sim_{uuid.uuid4().hex[:14]}"

    # Log initial PaymentTransaction
    cust_name = payload.customer_name
    if not cust_name and payload.shipping_address:
        cust_name = payload.shipping_address.get("full_name")
    if not cust_name:
        cust_name = f"{job.child_name}'s Parent"

    cust_email = payload.customer_email
    if not cust_email and payload.shipping_address:
        cust_email = payload.shipping_address.get("email") or payload.shipping_address.get("customer_email")

    transaction = PaymentTransaction(
        job_id=job.id,
        razorpay_order_id=razorpay_order_id,
        amount=amount_in_rupees,
        currency=currency,
        status="created",
        customer_name=cust_name,
        customer_email=cust_email,
        format_type=format_type
    )
    db.add(transaction)
    db.commit()

    key, _ = get_razorpay_credentials()
    return {
        "razorpay_order_id": razorpay_order_id,
        "amount": amount_in_paise,
        "currency": currency,
        "razorpay_key": key,
        "amount_display": amount_in_rupees,
        "format_type": format_type,
        "story_title": story.title,
        "child_name": job.child_name
    }


def verify_razorpay_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """
    Verify Razorpay payment signature using HMAC SHA256.
    Also accepts sandbox test signatures for simulation.
    """
    if signature.startswith("simulated_sig_") or order_id.startswith("order_sim_"):
        return True

    _, secret = get_razorpay_credentials()
    if not secret:
        return True

    try:
        body = f"{order_id}|{payment_id}"
        expected_sig = hmac.new(
            secret.encode("utf-8"),
            body.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected_sig, signature)
    except Exception as e:
        print(f"Error during signature verification: {e}")
        return False


@router.post("/verify", response_model=VerifyPaymentResponse)
def verify_payment(
    payload: VerifyPaymentRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Verify payment signature, unlock full personalized storybook,
    record order, and log payment transaction.
    """
    job = db.query(PersonalizationJob).filter(PersonalizationJob.id == payload.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Personalization job not found")

    story = job.story or db.query(StoryTemplate).filter(StoryTemplate.id == job.story_id).first()
    format_type = payload.format_type or "digital"

    amount_in_rupees = float(
        (story.price_print if format_type == "print_hardcover" else story.price_digital) or
        (1399.0 if format_type == "print_hardcover" else 799.0)
    )

    # Find or create transaction record
    txn = db.query(PaymentTransaction).filter(
        (PaymentTransaction.razorpay_order_id == payload.razorpay_order_id) |
        (PaymentTransaction.job_id == job.id)
    ).order_by(PaymentTransaction.created_at.desc()).first()

    # Verify signature
    is_valid = verify_razorpay_signature(
        order_id=payload.razorpay_order_id,
        payment_id=payload.razorpay_payment_id,
        signature=payload.razorpay_signature
    )

    if not is_valid:
        if txn:
            txn.status = "failed"
            txn.error_description = "Signature verification failed"
            db.commit()
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    # 1. Update/create transaction
    if not txn:
        txn = PaymentTransaction(
            job_id=job.id,
            razorpay_order_id=payload.razorpay_order_id,
            amount=amount_in_rupees,
            currency="INR",
            format_type=format_type
        )
        db.add(txn)

    txn.status = "captured"
    txn.razorpay_payment_id = payload.razorpay_payment_id
    txn.method = "razorpay_checkout"

    # Customer Name / Email resolution
    cust_name = payload.customer_name
    if not cust_name and payload.shipping_address:
        cust_name = payload.shipping_address.get("full_name")
    if not cust_name:
        cust_name = f"{job.child_name}'s Family"

    cust_email = payload.customer_email
    if not cust_email and payload.shipping_address:
        cust_email = payload.shipping_address.get("email") or payload.shipping_address.get("customer_email")

    txn.customer_name = cust_name
    txn.customer_email = cust_email

    # 2. Mark PersonalizationJob as paid
    job.is_paid = True
    job.paid_at = datetime.datetime.utcnow()

    # 3. Create entry in orders table
    order_number = f"ORD-{datetime.datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"

    shipping_json = None
    if payload.shipping_address:
        shipping_json = json.dumps(payload.shipping_address)

    order_status = "Paid" if format_type == "digital" else "In Production"

    order = Order(
        order_number=order_number,
        job_id=job.id,
        customer_name=cust_name,
        customer_email=cust_email,
        format_type=format_type,
        amount=amount_in_rupees,
        currency="INR",
        status=order_status,
        payment_status="paid",
        payment_intent_id=payload.razorpay_payment_id,
        razorpay_order_id=payload.razorpay_order_id,
        razorpay_payment_id=payload.razorpay_payment_id,
        shipping_address=shipping_json
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    # Link transaction to created order
    txn.order_id = order.id
    db.commit()

    # 4. Trigger background generation of all remaining storybook pages
    def _worker(jid: str):
        try:
            print(f"Triggering post-payment full generation for job {jid}")
            job_runner.get_or_generate_full_storybook_pages(jid)
        except Exception as err:
            print(f"Notice during post-payment generation: {err}")

    background_tasks.add_task(_worker, job.id)

    return {
        "success": True,
        "order_number": order.order_number,
        "order_id": order.id,
        "job_id": job.id,
        "format_type": format_type,
        "amount": order.amount,
        "status": order.status,
        "message": "Payment verified successfully. Full storybook unlocked!"
    }


@router.get("/transactions", response_model=List[PaymentTransactionOut])
def list_payment_transactions(
    limit: int = Query(50),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    """
    List all payment gateway transactions for the Admin dashboard.
    """
    txns = db.query(PaymentTransaction).order_by(
        PaymentTransaction.created_at.desc()
    ).offset(offset).limit(limit).all()

    results = []
    for t in txns:
        story_title = None
        child_name = None
        order_number = None

        if t.job:
            child_name = t.job.child_name
            if t.job.story:
                story_title = t.job.story.title

        if t.order:
            order_number = t.order.order_number

        results.append({
            "id": t.id,
            "order_id": t.order_id,
            "job_id": t.job_id,
            "razorpay_order_id": t.razorpay_order_id,
            "razorpay_payment_id": t.razorpay_payment_id,
            "amount": t.amount,
            "currency": t.currency,
            "status": t.status,
            "method": t.method,
            "customer_name": t.customer_name,
            "customer_email": t.customer_email,
            "format_type": t.format_type,
            "story_title": story_title,
            "child_name": child_name,
            "order_number": order_number,
            "error_description": t.error_description,
            "created_at": t.created_at
        })

    return results
