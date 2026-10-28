import datetime
import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="admin")  # "admin", "customer"
    reset_token = Column(String(100), nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    child_profiles = relationship("ChildProfile", back_populates="parent")
    personalization_jobs = relationship("PersonalizationJob", back_populates="user")
    orders = relationship("Order", back_populates="user")


class ChildProfile(Base):
    __tablename__ = "child_profiles"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    parent_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    child_display_name = Column(String(100), nullable=False)
    photo_storage_path = Column(String(500), nullable=False)
    consent_status = Column(Boolean, default=False)
    consent_timestamp = Column(DateTime, nullable=True)
    retention_status = Column(String(50), default="active")  # "active", "scheduled_deletion", "deleted"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    parent = relationship("User", back_populates="child_profiles")
    personalization_jobs = relationship("PersonalizationJob", back_populates="child_profile")


class StoryTemplate(Base):
    __tablename__ = "story_templates"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), default="Fairytale & Adventure")
    age_range = Column(String(50), default="3-8 years")
    language = Column(String(20), default="English")
    source_pdf_path = Column(String(500), nullable=True, default="")
    page_count = Column(Integer, default=26)
    status = Column(String(30), default="draft")  # "draft", "published", "archived"
    cover_image_path = Column(String(500), nullable=True)
    price_digital = Column(Float, default=799.0)
    price_print = Column(Float, default=1399.0)
    currency = Column(String(10), default="INR")
    target_gender = Column(String(20), default="both")  # "both", "boy", "girl"
    min_age = Column(Integer, default=2)
    max_age = Column(Integer, default=13)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    pages = relationship("StoryPage", back_populates="story", cascade="all, delete-orphan", order_by="StoryPage.page_index")
    personalization_jobs = relationship("PersonalizationJob", back_populates="story")


class StoryPage(Base):
    __tablename__ = "story_pages"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    story_id = Column(String(36), ForeignKey("story_templates.id"), nullable=False)
    page_index = Column(Integer, nullable=False)  # 0 to 25
    page_number = Column(Integer, nullable=False)  # 1 to 26
    page_type = Column(String(30), default="story")  # "cover", "story", "ending", "dedication", "other"
    original_image_path = Column(String(500), nullable=True, default="")
    story_text = Column(Text, default="")
    extracted_text = Column(Text, default="")
    scene_description = Column(Text, default="")
    character_guidance = Column(Text, default="")
    prompt_template = Column(Text, default="")
    personalization_required = Column(Boolean, default=True)
    allow_illustration_generation = Column(Boolean, default=True)
    
    # Page Editor CMS: Face tracing, positioning & typography settings
    face_outline_points = Column(Text, default="")
    text_x = Column(Float, default=50.0)
    text_y = Column(Float, default=89.5)
    font_size = Column(Integer, default=20)
    font_family = Column(String(100), default="Sans (DejaVu Bold)")
    font_color = Column(String(30), default="#000000")
    letter_spacing = Column(Integer, default=0)
    stroke_color = Column(String(30), default="#FFFFFF")
    stroke_width = Column(Integer, default=0)
    has_shadow = Column(Boolean, default=True)
    soft_line_break = Column(Boolean, default=True)
    has_background_box = Column(Boolean, default=False)
    warp_style = Column(String(50), default="None")
    gender_variant = Column(String(20), default="boy")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    story = relationship("StoryTemplate", back_populates="pages")
    assets = relationship("GeneratedAsset", back_populates="story_page")


class PersonalizationJob(Base):
    __tablename__ = "personalization_jobs"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    story_id = Column(String(36), ForeignKey("story_templates.id"), nullable=False)
    child_profile_id = Column(String(36), ForeignKey("child_profiles.id"), nullable=True)
    child_name = Column(String(100), nullable=False)
    photo_path = Column(String(500), nullable=False)
    
    status = Column(String(40), default="queued")  # "queued", "analyzing", "generating", "assembling_preview", "completed", "failed"
    current_stage = Column(String(100), default="Job initiated")
    total_pages = Column(Integer, default=5)
    completed_pages = Column(Integer, default=0)
    failed_pages = Column(Integer, default=0)
    retry_count = Column(Integer, default=0)
    error_details = Column(Text, nullable=True)
    is_paid = Column(Boolean, default=False)
    paid_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="personalization_jobs")
    story = relationship("StoryTemplate", back_populates="personalization_jobs")
    child_profile = relationship("ChildProfile", back_populates="personalization_jobs")
    assets = relationship("GeneratedAsset", back_populates="job", cascade="all, delete-orphan")
    books = relationship("Book", back_populates="job", cascade="all, delete-orphan")


class GeneratedAsset(Base):
    __tablename__ = "generated_assets"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    job_id = Column(String(36), ForeignKey("personalization_jobs.id"), nullable=False)
    story_page_id = Column(String(36), ForeignKey("story_pages.id"), nullable=False)
    page_number = Column(Integer, nullable=False)
    asset_version = Column(Integer, default=1)
    storage_path = Column(String(500), nullable=False)
    provider = Column(String(255), default="huggingface")
    model = Column(String(255), default="")
    prompt_used = Column(Text, default="")
    generation_status = Column(String(30), default="completed")  # "pending", "completed", "failed"
    review_status = Column(String(30), default="pending_review")  # "pending_review", "approved", "rejected"
    cost_estimate = Column(Float, default=0.0)
    generation_time_sec = Column(Float, default=0.0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    job = relationship("PersonalizationJob", back_populates="assets")
    story_page = relationship("StoryPage", back_populates="assets")


class Book(Base):
    __tablename__ = "books"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    job_id = Column(String(36), ForeignKey("personalization_jobs.id"), nullable=False)
    book_type = Column(String(20), default="preview")  # "preview", "final"
    version = Column(Integer, default=1)
    pdf_storage_path = Column(String(500), nullable=False)
    page_count = Column(Integer, default=0)
    validation_status = Column(String(30), default="valid")  # "valid", "flagged", "failed"
    validation_details = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    job = relationship("PersonalizationJob", back_populates="books")
    orders = relationship("Order", back_populates="book")


class Order(Base):
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    order_number = Column(String(50), nullable=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    customer_name = Column(String(100), default="Valued Customer")
    customer_email = Column(String(150), nullable=True)
    book_id = Column(String(36), ForeignKey("books.id"), nullable=True)
    job_id = Column(String(36), ForeignKey("personalization_jobs.id"), nullable=True)
    format_type = Column(String(30), default="print_hardcover")  # "digital", "print_hardcover", "print_softcover"
    amount = Column(Float, default=1299.0)
    currency = Column(String(10), default="INR")
    status = Column(String(50), default="Pending")  # "In Production", "Paid", "Delivered", "Shipped", "Pending"
    payment_status = Column(String(30), default="paid")  # "unpaid", "authorized", "captured", "failed", "paid"
    payment_intent_id = Column(String(100), nullable=True)
    razorpay_order_id = Column(String(100), nullable=True)
    razorpay_payment_id = Column(String(100), nullable=True)
    shipping_address = Column(Text, nullable=True)
    tracking_id = Column(String(100), nullable=True)
    shipping_carrier = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="orders")
    book = relationship("Book", back_populates="orders")


class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=True)
    job_id = Column(String(36), ForeignKey("personalization_jobs.id"), nullable=True)
    razorpay_order_id = Column(String(100), nullable=True, index=True)
    razorpay_payment_id = Column(String(100), nullable=True, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(String(30), default="created")  # "created", "captured", "failed"
    method = Column(String(50), nullable=True)      # "upi", "card", "netbanking", etc.
    customer_name = Column(String(100), nullable=True)
    customer_email = Column(String(150), nullable=True)
    format_type = Column(String(30), default="digital")  # "digital", "print_hardcover"
    error_description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    order = relationship("Order", backref="transactions")
    job = relationship("PersonalizationJob", backref="transactions")


class AISettings(Base):
    __tablename__ = "ai_settings"

    id = Column(String(36), primary_key=True, default="default")
    active_story_provider = Column(String(50), default="gemini")
    active_image_provider = Column(String(50), default="huggingface")
    active_model = Column(String(100), default="")
    preview_page_limit = Column(Integer, default=3)
    max_retries = Column(Integer, default=3)
    concurrency_limit = Column(Integer, default=2)
    per_book_budget = Column(Float, default=2.50)
    is_paid_enabled = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    event_type = Column(String(100), nullable=False)
    actor = Column(String(100), default="system")
    details = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ChildWrittenStory(Base):
    __tablename__ = "child_written_stories"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    child_name = Column(String(100), nullable=False)
    standard = Column(String(50), nullable=False)        # e.g. "3rd Standard", "Grade 4"
    place = Column(String(100), nullable=False)          # e.g. "Chennai", "Coimbatore"
    title = Column(String(200), nullable=False)
    story_text = Column(Text, nullable=False)
    category = Column(String(50), default="Adventure")   # "Adventure", "Fantasy & Magic", "Animal Tales", "Space & Sci-Fi", "Bedtime", "Everyday Hero"
    cover_color = Column(String(30), default="#C98A84")  # Accent badge / theme color
    parent_email = Column(String(150), nullable=True)
    status = Column(String(30), default="approved")      # "approved", "pending", "featured", "rejected"
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(100), nullable=False)
    place = Column(String(100), nullable=False)
    rating = Column(Integer, nullable=False, default=5)  # 1 to 5 stars
    review_text = Column(Text, nullable=True, default="")
    media_url = Column(String(500), nullable=True)  # File path or URL
    media_type = Column(String(20), nullable=True)  # "image" or "video"
    status = Column(String(30), default="pending")  # "pending", "approved", "rejected"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


