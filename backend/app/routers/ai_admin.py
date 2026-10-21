from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path
import os
import shutil

from app.database import get_db
from app.models import AISettings
from app.schemas import AISettingsOut, AISettingsUpdate
from app.config import settings
from app.services.ai.diffusers_provider import diffusers_provider

router = APIRouter(prefix="/admin/ai", tags=["AI Admin"])

def get_or_create_ai_settings(db: Session) -> AISettings:
    ai_conf = db.query(AISettings).filter(AISettings.id == "default").first()
    if not ai_conf:
        ai_conf = AISettings(
            id="default",
            active_story_provider=settings.ACTIVE_STORY_PROVIDER,
            active_image_provider=settings.ACTIVE_IMAGE_PROVIDER,
            active_model=settings.HF_MODEL_NAME,
            preview_page_limit=settings.PREVIEW_PAGE_LIMIT,
            max_retries=settings.MAX_GENERATION_RETRIES,
            concurrency_limit=2,
            per_book_budget=settings.PER_BOOK_BUDGET_USD,
            is_paid_enabled=settings.PAID_FALLBACK_ENABLED
        )
        db.add(ai_conf)
        db.commit()
        db.refresh(ai_conf)
    return ai_conf

@router.get("/settings", response_model=AISettingsOut)
def get_ai_settings(db: Session = Depends(get_db)):
    ai_conf = get_or_create_ai_settings(db)
    diag = diffusers_provider.check_hardware()
    hw_str = f"{'CUDA GPU: ' + diag.gpu_name if diag.has_gpu else 'CPU (No dedicated CUDA GPU)'} — Recommended mode: {diag.recommended_mode}"
    
    return {
        "active_story_provider": ai_conf.active_story_provider,
        "active_image_provider": ai_conf.active_image_provider,
        "active_model": ai_conf.active_model,
        "preview_page_limit": ai_conf.preview_page_limit,
        "max_retries": ai_conf.max_retries,
        "concurrency_limit": ai_conf.concurrency_limit,
        "per_book_budget": ai_conf.per_book_budget,
        "is_paid_enabled": ai_conf.is_paid_enabled,
        "hardware_acceleration": hw_str
    }

@router.put("/settings", response_model=AISettingsOut)
def update_ai_settings(payload: AISettingsUpdate, db: Session = Depends(get_db)):
    ai_conf = get_or_create_ai_settings(db)
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(ai_conf, k, v)
    db.commit()
    db.refresh(ai_conf)
    
    diag = diffusers_provider.check_hardware()
    hw_str = f"{'CUDA GPU: ' + diag.gpu_name if diag.has_gpu else 'CPU (No dedicated CUDA GPU)'} — Recommended mode: {diag.recommended_mode}"
    
    return {
        "active_story_provider": ai_conf.active_story_provider,
        "active_image_provider": ai_conf.active_image_provider,
        "active_model": ai_conf.active_model,
        "preview_page_limit": ai_conf.preview_page_limit,
        "max_retries": ai_conf.max_retries,
        "concurrency_limit": ai_conf.concurrency_limit,
        "per_book_budget": ai_conf.per_book_budget,
        "is_paid_enabled": ai_conf.is_paid_enabled,
        "hardware_acceleration": hw_str
    }
