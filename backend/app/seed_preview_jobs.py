import datetime
import uuid
from app.database import SessionLocal
from app.models import StoryTemplate, StoryPage, PersonalizationJob, GeneratedAsset, ChildProfile

db = SessionLocal()

# 1. Ensure Moonstone Academy exists
moonstone = db.query(StoryTemplate).filter(StoryTemplate.title.ilike("%moonstone%")).first()
if not moonstone:
    moonstone = StoryTemplate(
        id=str(uuid.uuid4()),
        title="Moonstone Academy",
        slug="moonstone-academy",
        description="A mystical boarding school where magical stars and enchantments await brave young wizards.",
        category="FANTASY",
        age_range="Ages 4-10",
        language="English",
        price_digital=799.0,
        price_print=1399.0,
        currency="INR",
        status="published",
        page_count=28,
        cover_image_path="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
        target_gender="both",
        min_age=4,
        max_age=10
    )
    db.add(moonstone)
    db.flush()
    # Add dummy pages
    for i in range(28):
        db.add(StoryPage(
            id=str(uuid.uuid4()),
            story_id=moonstone.id,
            page_index=i,
            page_number=i+1,
            page_type="cover" if i == 0 else "story",
            story_text=f"Welcome to Moonstone Academy, page {i+1}."
        ))
    db.commit()

unicorn = db.query(StoryTemplate).filter(StoryTemplate.title.ilike("%unicorn%")).first()
if not unicorn:
    unicorn = db.query(StoryTemplate).first()

# Reference rows from the user's uploaded screenshot
# Timestamp: Oct 13, 2026
base_date = datetime.datetime(2026, 10, 13, 16, 49, 0)

preview_data = [
    {"child": "Siyaansh", "story": moonstone, "status": "generating", "pages": 2, "time": datetime.datetime(2026, 10, 13, 16, 49, 0), "purchased": False},
    {"child": "Narmadha", "story": unicorn, "status": "completed", "pages": 4, "time": datetime.datetime(2026, 10, 13, 16, 12, 0), "purchased": True},
    {"child": "Narmadha", "story": unicorn, "status": "completed", "pages": 4, "time": datetime.datetime(2026, 10, 13, 16, 8, 0), "purchased": False},
    {"child": "Siyaansh", "story": moonstone, "status": "completed", "pages": 4, "time": datetime.datetime(2026, 10, 13, 16, 7, 0), "purchased": True},
    {"child": "Ananya", "story": unicorn, "status": "completed", "pages": 4, "time": datetime.datetime(2026, 10, 13, 16, 1, 0), "purchased": False},
    {"child": "Suguna", "story": moonstone, "status": "completed", "pages": 4, "time": datetime.datetime(2026, 10, 13, 15, 58, 0), "purchased": True},
    {"child": "Suguna", "story": unicorn, "status": "completed", "pages": 4, "time": datetime.datetime(2026, 10, 13, 15, 53, 0), "purchased": False},
    {"child": "Nirmal", "story": moonstone, "status": "completed", "pages": 4, "time": datetime.datetime(2026, 10, 13, 15, 48, 0), "purchased": True},
    {"child": "Siyaansh", "story": moonstone, "status": "completed", "pages": 4, "time": datetime.datetime(2026, 10, 13, 15, 30, 0), "purchased": False},
    {"child": "Rahaa", "story": unicorn, "status": "completed", "pages": 4, "time": datetime.datetime(2026, 10, 13, 15, 21, 0), "purchased": True},
    {"child": "Rahaa", "story": unicorn, "status": "completed", "pages": 4, "time": datetime.datetime(2026, 10, 13, 15, 15, 0), "purchased": False},
]

# Check existing jobs for these names
for item in preview_data:
    existing = db.query(PersonalizationJob).filter(
        PersonalizationJob.child_name == item["child"],
        PersonalizationJob.created_at == item["time"]
    ).first()
    if not existing:
        photo_url = "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80"
        job = PersonalizationJob(
            id=str(uuid.uuid4()),
            user_id="purchased" if item["purchased"] else None,
            story_id=item["story"].id,
            child_name=item["child"],
            photo_path=photo_url,
            status=item["status"],
            current_stage="Free preview plates generated" if item["status"] == "completed" else "Generating page 2 of 4",
            total_pages=4,
            completed_pages=item["pages"],
            created_at=item["time"],
            updated_at=item["time"]
        )
        db.add(job)
        db.flush()

        # Add sample generated asset plates
        for p in range(1, item["pages"] + 1):
            asset = GeneratedAsset(
                id=str(uuid.uuid4()),
                job_id=job.id,
                story_page_id=item["story"].pages[p-1].id if item["story"].pages else str(uuid.uuid4()),
                page_number=p,
                storage_path=item["story"].cover_image_path or photo_url,
                provider="fal_ai",
                model="flux-pulid",
                prompt_used=f"Child {item['child']} in {item['story'].title} illustration",
                generation_status="completed",
                review_status="approved",
                cost_estimate=0.04,
                created_at=item["time"]
            )
            db.add(asset)

db.commit()
print("Seeded reference preview jobs matching screenshot!")
