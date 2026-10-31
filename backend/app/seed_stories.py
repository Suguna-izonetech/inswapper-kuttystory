from app.database import SessionLocal
from app.models import StoryTemplate, StoryPage
from app.config import settings
from app.services.pdf_importer import PDFImporterService

def seed():
    db = SessionLocal()
    try:
        # 1. Ensure Unicorn story exists and is properly configured
        unicorn = db.query(StoryTemplate).filter(StoryTemplate.slug.like("%unicorn%")).first()
        if unicorn:
            unicorn.title = "The Girl and the Magical Unicorn"
            unicorn.slug = "unicorn-story"
            unicorn.price_digital = 799.0
            unicorn.price_print = 1399.0
            unicorn.currency = "INR"
            unicorn.age_range = "Ages 3-8"
            unicorn.category = "Fairytale & Adventure"
            unicorn.status = "published"
            unicorn.target_gender = "both"
            unicorn.min_age = 3
            unicorn.max_age = 8
            db.commit()
            print(f"Unicorn story '{unicorn.title}' verified and updated successfully!")
        else:
            sample_pdf = settings.BASE_DIR / "sample-assets" / "unicorn Story.pdf"
            if sample_pdf.exists():
                PDFImporterService.import_story_from_pdf(
                    pdf_path=str(sample_pdf),
                    db=db,
                    title="The Girl and the Magical Unicorn",
                    slug="unicorn-story",
                    description="Join an enchanting personalized adventure with a gentle white unicorn, exploring secret meadows, helping a fledgling bird, and discovering the courage of true friendship.",
                    category="Fairytale & Adventure",
                    age_range="Ages 3-8",
                    price_digital=799.0,
                    price_print=1399.0,
                    currency="INR",
                    force_reimport=False
                )
                print("Unicorn story imported from PDF successfully!")
            else:
                print(f"Sample PDF not found at: {sample_pdf}")

        # 2. Verified story catalog status
        print("Seed verified: keeping all admin-uploaded and existing stories intact.")

        total = db.query(StoryTemplate).count()
        live = db.query(StoryTemplate).filter(StoryTemplate.status == "published").count()
        print(f"Seed completed! Total stories: {total}, Live: {live}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()

