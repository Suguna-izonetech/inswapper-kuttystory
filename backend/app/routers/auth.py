import datetime
import hashlib
import secrets
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models import User
from app.schemas import UserRegister, UserLogin, ForgotPasswordRequest, ResetPasswordRequest, Token, UserOut
from app.services.email_service import EmailService

router = APIRouter(prefix="/auth", tags=["Authentication"])

def hash_password(password: str, salt: Optional[str] = None) -> str:
    """NIST standard PBKDF2 HMAC SHA-256 with secure random salt."""
    if salt is None:
        salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"{salt}${key.hex()}"

def verify_password(password: str, hashed_password: str) -> bool:
    """Constant-time verification of password against salt-hashed string."""
    try:
        salt, key_hex = hashed_password.split("$", 1)
        new_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
        return secrets.compare_digest(new_key.hex(), key_hex)
    except Exception:
        return False

def generate_access_token(user_id: str) -> str:
    return f"kutty_sec_{user_id}_{secrets.token_urlsafe(32)}"


@router.post("/register", response_model=Token)
def register_admin(payload: UserRegister, db: Session = Depends(get_db)):
    """Create a new admin account with name, phone, email, password, and confirm password."""
    # 1. Validation
    if payload.password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )

    if len(payload.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    clean_email = payload.email.lower().strip()
    if "@" not in clean_email or "." not in clean_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid email address."
        )

    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # 2. Create User
    new_user = User(
        name=payload.name.strip(),
        phone=payload.phone.strip() if payload.phone else None,
        email=clean_email,
        hashed_password=hash_password(payload.password),
        role="admin"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = generate_access_token(new_user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }


@router.post("/login", response_model=Token)
def login_admin(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticate admin user using username/email and password."""
    login_id = payload.username.lower().strip()
    user = db.query(User).filter(
        (User.email == login_id) | (User.name.ilike(login_id))
    ).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password. Please try again."
        )

    token = generate_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Request password reset code sent via SMTP to the registered email.
    """
    clean_email = payload.email.lower().strip()
    user = db.query(User).filter(
        (User.email == clean_email) | (User.name.ilike(clean_email))
    ).first()

    if not user:
        # For security we can say code sent if email exists, but for clarity let user know
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email or username."
        )

    # Generate 6-digit OTP code
    reset_code = f"{secrets.randbelow(900000) + 100000}"
    user.reset_token = reset_code
    user.reset_token_expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    db.commit()

    # Send reset code via SMTP service
    result = EmailService.send_password_reset_email(
        to_email=user.email,
        reset_code=reset_code,
        user_name=user.name
    )

    if not result.get("smtp_sent"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message") or "Failed to deliver email via SMTP. Please verify SMTP credentials."
        )

    return {
        "status": "success",
        "message": f"Verification code sent to {user.email}. Please check your email inbox.",
        "email": user.email,
        "smtp_sent": True
    }


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Verify reset code and set new password.
    """
    if payload.new_password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )

    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long."
        )

    clean_email = payload.email.lower().strip()
    user = db.query(User).filter(
        (User.email == clean_email) | (User.name.ilike(clean_email))
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found."
        )

    if not user.reset_token or user.reset_token != payload.code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code. Please check and try again."
        )

    if not user.reset_token_expires or user.reset_token_expires < datetime.datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please request a new code."
        )

    # Update password and clear token
    user.hashed_password = hash_password(payload.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()

    return {
        "status": "success",
        "message": "Password reset successfully. You can now login with your new password."
    }


@router.get("/me", response_model=UserOut)
def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Get currently logged-in user profile."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    token = authorization.replace("Bearer ", "").strip()
    # Token format: kutty_sec_<user_id>_<random>
    parts = token.split("_")
    if len(parts) < 3 or parts[0] != "kutty" or parts[1] != "sec":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token format")

    user_id = parts[2]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user
