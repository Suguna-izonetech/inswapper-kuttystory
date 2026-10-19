from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    role: str = "admin"

class UserRegister(BaseModel):
    name: str
    phone: Optional[str] = None
    email: str
    password: str
    confirm_password: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str  # Can be username or email
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str
    confirm_password: str

class UserOut(UserBase):
    id: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# Story Page Schemas
class StoryPageBase(BaseModel):
    page_index: int
    page_number: int
    page_type: str = "story"
    story_text: str = ""
    scene_description: str = ""
    character_guidance: str = ""
    prompt_template: str = ""
    personalization_required: bool = True
    allow_illustration_generation: bool = True
    face_outline_points: Optional[str] = ""
    text_x: Optional[float] = 50.0
    text_y: Optional[float] = 89.5
    font_size: Optional[int] = 20
    font_family: Optional[str] = "Sans (DejaVu Bold)"
    font_color: Optional[str] = "#000000"
    letter_spacing: Optional[int] = 0
    stroke_color: Optional[str] = "#FFFFFF"
    stroke_width: Optional[int] = 0
    has_shadow: Optional[bool] = True
    soft_line_break: Optional[bool] = True
    has_background_box: Optional[bool] = False
    warp_style: Optional[str] = "None"
    gender_variant: Optional[str] = "boy"

class StoryPageUpdate(BaseModel):
    story_text: Optional[str] = None
    page_type: Optional[str] = None
    scene_description: Optional[str] = None
    character_guidance: Optional[str] = None
    prompt_template: Optional[str] = None
    personalization_required: Optional[bool] = None
    allow_illustration_generation: Optional[bool] = None
    original_image_path: Optional[str] = None
    face_outline_points: Optional[str] = None
    text_x: Optional[float] = None
    text_y: Optional[float] = None
    font_size: Optional[int] = None
    font_family: Optional[str] = None
    font_color: Optional[str] = None
    letter_spacing: Optional[int] = None
    stroke_color: Optional[str] = None
    stroke_width: Optional[int] = None
    has_shadow: Optional[bool] = None
    soft_line_break: Optional[bool] = None
    has_background_box: Optional[bool] = None
    warp_style: Optional[str] = None
    gender_variant: Optional[str] = None

class StoryPageOut(StoryPageBase):
    id: str
    story_id: str
    original_image_path: str
    original_image_url: Optional[str] = None
    extracted_text: str = ""
    class Config:
        from_attributes = True

# Story Template Schemas
class StoryTemplateBase(BaseModel):
    title: str
    slug: str
    description: Optional[str] = None
    category: str = "Fairytale & Adventure"
    age_range: str = "3-8 years"
    language: str = "English"
    price_digital: float = 14.99
    price_print: float = 29.99
    currency: str = "USD"
    status: str = "draft"
    target_gender: Optional[str] = "both"
    min_age: Optional[int] = 2
    max_age: Optional[int] = 13

class StoryTemplateCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    category: str = "ADVENTURE"
    min_age: Optional[int] = 3
    max_age: Optional[int] = 7
    age_range: Optional[str] = None
    price_digital: float = 799.0
    price_print: float = 1399.0
    currency: str = "INR"
    page_count: int = 28
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    cover_image_path: Optional[str] = None
    status: str = "published"
    target_gender: Optional[str] = "both"

class StoryTemplateUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    age_range: Optional[str] = None
    language: Optional[str] = None
    price_digital: Optional[float] = None
    price_print: Optional[float] = None
    currency: Optional[str] = None
    status: Optional[str] = None
    cover_image_url: Optional[str] = None
    cover_image_path: Optional[str] = None
    page_count: Optional[int] = None
    target_gender: Optional[str] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    cover_image_url: Optional[str] = None
    cover_image_path: Optional[str] = None
    page_count: Optional[int] = None

class StoryTemplateOut(StoryTemplateBase):
    id: str
    page_count: int
    cover_image_path: Optional[str] = None
    cover_image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    pages: Optional[List[StoryPageOut]] = []
    class Config:
        from_attributes = True

# Generated Asset Schemas
class GeneratedAssetOut(BaseModel):
    id: str
    job_id: str
    story_page_id: str
    page_number: int
    asset_version: int
    storage_path: str
    image_url: Optional[str] = None
    provider: str
    model: str
    prompt_used: str
    story_text: Optional[str] = ""
    generation_status: str
    review_status: str
    cost_estimate: float
    generation_time_sec: float
    error_message: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class AssetReviewUpdate(BaseModel):
    review_status: str  # "approved", "rejected"
    comment: Optional[str] = None

# Personalization Job Schemas
class PersonalizationCreate(BaseModel):
    story_id: str
    child_name: str
    guardian_consent: bool

class PersonalizationOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    story_id: str
    story_title: Optional[str] = "Storybook"
    story_slug: Optional[str] = ""
    child_name: str
    photo_path: str
    photo_url: Optional[str] = None
    status: str
    current_stage: str
    total_pages: int
    completed_pages: int
    failed_pages: int
    retry_count: int
    error_details: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    pages_label: Optional[str] = "4 free"
    is_purchased: Optional[bool] = False
    created_formatted: Optional[str] = None
    pdf_download_url: Optional[str] = None
    print_pdf_url: Optional[str] = None
    assets: Optional[List[GeneratedAssetOut]] = []
    class Config:
        from_attributes = True

# Book Schemas
class BookOut(BaseModel):
    id: str
    job_id: str
    book_type: str
    version: int
    pdf_storage_path: str
    pdf_download_url: Optional[str] = None
    page_count: int
    validation_status: str
    validation_details: str
    created_at: datetime
    class Config:
        from_attributes = True

# AI Settings & POC Schemas
class AISettingsOut(BaseModel):
    active_story_provider: str
    active_image_provider: str
    active_model: str
    preview_page_limit: int
    max_retries: int
    concurrency_limit: int
    per_book_budget: float
    is_paid_enabled: bool
    hardware_acceleration: str = "CPU (No dedicated CUDA GPU detected)"
    class Config:
        from_attributes = True

class AISettingsUpdate(BaseModel):
    active_story_provider: Optional[str] = None
    active_image_provider: Optional[str] = None
    active_model: Optional[str] = None
    preview_page_limit: Optional[int] = None
    max_retries: Optional[int] = None
    concurrency_limit: Optional[int] = None
    per_book_budget: Optional[float] = None
    is_paid_enabled: Optional[bool] = None

class POCTestRequest(BaseModel):
    child_name: str = "Mia"
    provider: Optional[str] = None
    model: Optional[str] = None
    test_page_numbers: List[int] = [7, 10, 13]  # 1. Close-up portrait, 2. Action/full-body, 3. Different scene/pose

class POCTestPageResult(BaseModel):
    page_number: int
    scene_type: str
    source_description: str
    prompt: str
    image_url: str
    provider: str
    model: str
    generation_time_sec: float
    cost_estimate: float
    review_status: str

class POCTestResult(BaseModel):
    test_id: str
    child_name: str
    child_reference_url: str
    pages: List[POCTestPageResult]
    summary: str
    status: str

# Order & Admin Dashboard Schemas
class OrderBase(BaseModel):
    order_number: Optional[str] = None
    customer_name: str
    customer_email: Optional[str] = None
    book_id: Optional[str] = None
    job_id: Optional[str] = None
    format_type: str = "print_hardcover"
    amount: float = 1299.0
    currency: str = "INR"
    status: str = "Pending"
    payment_status: str = "paid"
    shipping_address: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class OrderStatusUpdate(BaseModel):
    status: str

class OrderOut(OrderBase):
    id: str
    created_at: datetime
    class Config:
        from_attributes = True

class DashboardStatsOut(BaseModel):
    revenue: float
    revenue_formatted: str
    currency_symbol: str
    currency: str
    paid_orders: int
    previews_created: int
    live_stories: int
    recent_orders: List[OrderOut]
    status_counts: Dict[str, int]
