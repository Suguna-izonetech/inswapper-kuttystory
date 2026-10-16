from app.database import SessionLocal
from app.models import StoryTemplate, StoryPage
import uuid

def seed():
    db = SessionLocal()

    # Update unicorn story if exists
    unicorn = db.query(StoryTemplate).filter(StoryTemplate.slug.like("%unicorn%")).first()
    if unicorn:
        unicorn.price_digital = 799.0
        unicorn.price_print = 1399.0
        unicorn.currency = "INR"
        unicorn.age_range = "Ages 3-8"
        unicorn.category = "FANTASY"
        db.commit()

    books_data = [
        {
            "title": "Baking Story",
            "slug": "baking-story",
            "category": "LEARNING",
            "age_range": "Ages 3-6",
            "price_digital": 799.0,
            "price_print": 1399.0,
            "page_count": 28,
            "status": "published",
            "description": "A delightful sweet tale of baking colorful cupcakes with mom and little puppy.",
            "cover_image_path": "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Cricket",
            "slug": "cricket",
            "category": "ADVENTURE",
            "age_range": "Ages 3-7",
            "price_digital": 799.0,
            "price_print": 1399.0,
            "page_count": 28,
            "status": "draft",
            "description": "Aarav loved cricket and dreams of stepping onto the stadium pitch under roaring crowds.",
            "cover_image_path": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Space Journey",
            "slug": "space-journey",
            "category": "ADVENTURE",
            "age_range": "Ages 4-8",
            "price_digital": 799.0,
            "price_print": 1399.0,
            "page_count": 28,
            "status": "published",
            "description": "Blast off into asteroid belts and neon nebulas on a cosmic mission across the galaxy.",
            "cover_image_path": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "A Day at the Beach",
            "slug": "a-day-at-the-beach",
            "category": "ADVENTURE",
            "age_range": "Ages 3-7",
            "price_digital": 799.0,
            "price_print": 1399.0,
            "page_count": 28,
            "status": "published",
            "description": "Sunny waves, seashell treasures, and towering sandcastles along the warm shore.",
            "cover_image_path": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Little Dinosaur Safari",
            "slug": "little-dinosaur-safari",
            "category": "LEARNING",
            "age_range": "Ages 3-6",
            "price_digital": 799.0,
            "price_print": 1399.0,
            "page_count": 24,
            "status": "published",
            "description": "Roar and explore ancient jungle trails discovering friendly baby herbivores.",
            "cover_image_path": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "The Secret Forest Sanctuary",
            "slug": "the-secret-forest-sanctuary",
            "category": "BEDTIME",
            "age_range": "Ages 2-5",
            "price_digital": 699.0,
            "price_print": 1299.0,
            "page_count": 26,
            "status": "published",
            "description": "Soft lullabies and whispering leaves as enchanted forest animals gather to rest.",
            "cover_image_path": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80"
        }
    ]

    for b in books_data:
        existing = db.query(StoryTemplate).filter(StoryTemplate.slug == b["slug"]).first()
        if not existing:
            st = StoryTemplate(
                id=str(uuid.uuid4()),
                title=b["title"],
                slug=b["slug"],
                description=b["description"],
                category=b["category"],
                age_range=b["age_range"],
                language="English",
                source_pdf_path="",
                page_count=b["page_count"],
                status=b["status"],
                cover_image_path=b["cover_image_path"],
                price_digital=b["price_digital"],
                price_print=b["price_print"],
                currency="INR"
            )
            db.add(st)
            db.flush()
            for idx in range(b["page_count"]):
                p_type = "cover" if idx == 0 else ("ending" if idx == b["page_count"] - 1 else "story")
                p = StoryPage(
                    id=str(uuid.uuid4()),
                    story_id=st.id,
                    page_index=idx,
                    page_number=idx + 1,
                    page_type=p_type,
                    original_image_path=b["cover_image_path"] if idx == 0 else "",
                    story_text=f"Front Cover: {b['title']}" if idx == 0 else ("The End" if idx == b["page_count"] - 1 else f"Story narrative for page {idx + 1}"),
                    extracted_text="",
                    scene_description=f"Scene illustration for page {idx + 1}",
                    character_guidance="",
                    prompt_template="",
                    personalization_required=True,
                    allow_illustration_generation=True
                )
                db.add(p)
    db.commit()
    total = db.query(StoryTemplate).count()
    live = db.query(StoryTemplate).filter(StoryTemplate.status == "published").count()
    print(f"Seed completed successfully! Total books: {total}, Live books: {live}")

if __name__ == "__main__":
    seed()
