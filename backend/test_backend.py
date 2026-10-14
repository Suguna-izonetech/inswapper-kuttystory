import os
import sys
import unittest
import asyncio

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import StoryTemplate, StoryPage, PersonalizationJob, GeneratedAsset, Book, AISettings
from app.services.pdf_importer import PDFImporterService
from app.services.pdf_composer import PDFComposerService
from app.services.ai.diffusers_provider import diffusers_provider
from app.services.ai.gemini_provider import gemini_provider
from app.services.ai.mock_provider import mock_provider
from app.services.ai.consistency_engine import consistency_engine

class TestBackendEngine(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Create tables
        Base.metadata.create_all(bind=engine)
        cls.db = SessionLocal()

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_pdf_import_and_verification(self):
        """Test importing the actual unicorn Story.pdf and verifying 26 pages."""
        pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sample-assets", "unicorn Story.pdf"))
        self.assertTrue(os.path.exists(pdf_path), "unicorn Story.pdf should exist")

        story = PDFImporterService.import_story_from_pdf(
            pdf_path=pdf_path,
            db=self.db,
            title="The Girl and the Magical Unicorn",
            slug="unicorn-story",
            force_reimport=True
        )

        self.assertEqual(story.page_count, 26, "Source PDF must have exactly 26 pages")
        pages = self.db.query(StoryPage).filter(StoryPage.story_id == story.id).all()
        self.assertEqual(len(pages), 26, "Database should have 26 pages stored")
        
        # Verify cover page
        p1 = [p for p in pages if p.page_number == 1][0]
        self.assertEqual(p1.page_type, "cover")
        self.assertTrue(os.path.exists(p1.original_image_path), "Rendered page image must exist on disk")

        # Verify back cover
        p26 = [p for p in pages if p.page_number == 26][0]
        self.assertEqual(p26.page_type, "ending")

        print("Test 1 Passed: PDF successfully verified and imported into database with 26 rendered pages.")

    def test_02_deterministic_pdf_composer(self):
        """Test ReportLab composition for 210x210 mm square layout and preflight checks."""
        pages = self.db.query(StoryPage).filter(StoryPage.story_id.isnot(None)).limit(5).all()
        pages_data = [
            {
                "page_number": p.page_number,
                "page_type": p.page_type,
                "image_path": p.original_image_path,
                "story_text": p.story_text
            }
            for p in pages
        ]

        pdf_path, validation = PDFComposerService.compose_storybook_pdf(
            pages_data=pages_data,
            output_filename="unit_test_preview.pdf",
            book_type="preview",
            child_name="Emily"
        )

        self.assertTrue(os.path.exists(pdf_path), "Generated PDF file must exist")
        self.assertTrue(validation["validation_passed"], "Preflight validation should pass")
        self.assertEqual(validation["page_count"], 5)
        self.assertEqual(validation["trim_size_mm"], "210 x 210")
        print(f"Test 2 Passed: Deterministic PDF created successfully at {pdf_path} (Trim: {validation['trim_size_mm']})")

    def test_03_hardware_diagnostic_and_ai_providers(self):
        """Test hardware detection, AI diagnostic reporting, and prompt expansion."""
        diag = diffusers_provider.check_hardware()
        self.assertIsNotNone(diag.recommended_mode)
        # Verify machine has no CUDA
        print(f"Hardware Diagnostic Result: Has GPU={diag.has_gpu}, Mode={diag.recommended_mode}, Notes={diag.notes}")

        # Test prompt expansion with Gemini / rule-based fallback
        loop = asyncio.new_event_loop()
        expanded = loop.run_until_complete(
            gemini_provider.expand_prompt("standing near the fairy tree", "Emily")
        )
        self.assertIn("Emily", expanded)
        print(f"Expanded Prompt sample: {expanded}")
        loop.close()
        print("Test 3 Passed: Hardware diagnostics and prompt expansion verified.")

    def test_04_three_image_poc_consistency_test(self):
        """Test executing the 3-representative-page Character Consistency POC."""
        # Create a sample test child photo
        test_photo_path = str(settings.CHILD_PHOTOS_DIR / "unit_test_child.png")
        from PIL import Image, ImageDraw
        img = Image.new("RGB", (400, 400), color=(255, 235, 230))
        d = ImageDraw.Draw(img)
        d.ellipse([100, 80, 300, 280], fill=(240, 210, 195))
        d.text((120, 180), "Test Child", fill=(50, 40, 40))
        img.save(test_photo_path)

        loop = asyncio.new_event_loop()
        poc_result = loop.run_until_complete(
            consistency_engine.run_three_image_poc(
                child_name="Aria",
                child_reference_path=test_photo_path,
                provider_name="mock_poc"
            )
        )
        loop.close()

        self.assertEqual(len(poc_result["pages"]), 3, "POC must test exactly 3 representative pages")
        page_nums = [p["page_number"] for p in poc_result["pages"]]
        self.assertEqual(page_nums, [7, 10, 13], "POC should test Page 7 (portrait), Page 10 (action), and Page 13 (interaction)")
        for p in poc_result["pages"]:
            self.assertTrue(os.path.exists(p["saved_path"]), f"Image for page {p['page_number']} must exist")
            self.assertEqual(p["review_status"], "pending_review")

        print("Test 4 Passed: 3-Image Character Consistency POC executed and validated.")

if __name__ == "__main__":
    unittest.main()
