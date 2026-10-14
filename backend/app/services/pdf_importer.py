import os
import shutil
import fitz  # PyMuPDF
from pathlib import Path
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.config import settings
from app.models import StoryTemplate, StoryPage
from app.services.storage import storage

UNICORN_DEFAULT_BEATS = [
    {
        "page": 1,
        "type": "cover",
        "personalize": True,
        "text": "The Girl and the Magical Unicorn",
        "scene": "Front cover: young girl in pink gown standing beside white unicorn with castle in background.",
        "prompt": "Children's storybook cover, front view portrait of a young child in a pink gown next to a gentle white unicorn with a magical horn, fairytale castle in background, soft warm lighting, digital painting illustration"
    },
    {
        "page": 2,
        "type": "story",
        "personalize": False,
        "text": "Deep inside the sunlit castle grounds, where blooming roses whispered to the breeze, lay a secret path paved with ancient cobblestones.",
        "scene": "Castle courtyard garden establishing shot with stone fountain and colorful flowers.",
        "prompt": "Enchanted castle garden courtyard, stone fountain, cobblestone path lined with flowers, fairytale castle in background, warm sunny day, soft editorial illustration"
    },
    {
        "page": 3,
        "type": "story",
        "personalize": True,
        "text": "Every morning, young {child_name} would wander through the garden, gathering blossoms in her little woven basket.",
        "scene": "Young girl in pink gown walking through flower garden carrying a woven basket of flowers.",
        "prompt": "Full body illustration of a young child in an elegant pink ruffled dress walking along a cobblestone garden path carrying a basket of colorful flowers, butterflies fluttering, fairytale castle behind, whimsical children's book art"
    },
    {
        "page": 4,
        "type": "story",
        "personalize": True,
        "text": "Suddenly, a soft rustle stirred the flowering bushes. {child_name} turned, her heart dancing with curious wonder.",
        "scene": "Young girl looking back over her shoulder with curiosity, holding flower basket.",
        "prompt": "Close-up portrait of a young child in a pink dress looking back over shoulder with an expression of curious wonder and surprise, holding a woven basket of blossoms, lush floral background, soft dreamy lighting"
    },
    {
        "page": 5,
        "type": "story",
        "personalize": False,
        "text": "Stepping gracefully onto the path was a creature of legend—a magnificent white unicorn with a shimmering spiral horn.",
        "scene": "Gentle white unicorn on flower path looking ahead with fairytale castle behind.",
        "prompt": "Majestic gentle white unicorn with flowing mane and spiral golden horn standing on a cobblestone garden path surrounded by colorful flowers, sunlit fairytale castle in distance"
    },
    {
        "page": 6,
        "type": "story",
        "personalize": True,
        "text": "{child_name} approached softly, offering a gentle, loving hand. The unicorn bowed its head with tranquil trust.",
        "scene": "Close-up of child gently extending hand to unicorn's muzzle in garden.",
        "prompt": "Intimate close-up of a child's gentle hand feeding and petting the muzzle of a friendly white unicorn, pink halter, soft floral garden setting, tender emotional moment"
    },
    {
        "page": 7,
        "type": "story",
        "personalize": True,
        "text": "In that quiet touch, an unbreakable bond was born. Two kindred spirits finding friendship in a world of wonder.",
        "scene": "Portrait: Child smiling warmly with hand caressing unicorn's face beside castle path.",
        "prompt": "Heartwarming portrait of a smiling young child in a pink gown with one hand resting lovingly on the cheek of a white unicorn, wind blowing unicorn's mane, soft golden lighting, storybook illustration"
    },
    {
        "page": 8,
        "type": "story",
        "personalize": True,
        "text": "Side by side, {child_name} and her magical companion set out along the path to explore the enchanted kingdom.",
        "scene": "Child and unicorn walking forward side by side together along sunlit garden trail.",
        "prompt": "Full body illustration of a young child walking forward alongside a beautiful white unicorn down a garden path lined with purple and pink blossoms, castle backdrop, companion adventure"
    },
    {
        "page": 9,
        "type": "story",
        "personalize": False,
        "text": "They reached the crest of the hill as golden sunlight painted the rolling valleys and glistening mountain lakes.",
        "scene": "Scenic sunset vista framed by blooming trees, glowing lanterns, overlooking rolling mountains and lake.",
        "prompt": "Breathtaking panoramic sunset landscape overlooking a tranquil lake and mountains, blooming floral archways with hanging lanterns, floating sparkles, fairytale nature painting"
    },
    {
        "page": 10,
        "type": "story",
        "personalize": True,
        "text": "Across fields of blooming wildflowers, {child_name} and the unicorn raced with untamed joy and laughter.",
        "scene": "Action scene: Child and unicorn running joyfully through meadow filled with wildflowers and butterflies.",
        "prompt": "Dynamic joyful action illustration of a young child running happily alongside a galloping white unicorn through a sunlit field of wildflowers, butterflies, laughing expression, energetic motion"
    },
    {
        "page": 11,
        "type": "story",
        "personalize": True,
        "text": "A radiant rainbow arched across the evening sky, bathing the entire world in ribbons of dreamlike color.",
        "scene": "Child and unicorn gazing up in awe at brilliant rainbow spanning the sky.",
        "prompt": "Young child in pink dress and white unicorn standing together gazing upward in wonder at a vibrant double rainbow arching over a magical castle at sunset, whimsical storybook art"
    },
    {
        "page": 12,
        "type": "story",
        "personalize": False,
        "text": "Beside the trail, a tiny fledgling bird sat trembling, separated from its nest among the glowing blossom lanterns.",
        "scene": "Little brown fledgling bird sitting alone on path among glowing flower lanterns.",
        "prompt": "Close-up of a sweet little brown fledgling baby bird sitting on a woodland path among glowing blossoms and fairy lanterns, warm evening light, delicate nature illustration"
    },
    {
        "page": 13,
        "type": "story",
        "personalize": True,
        "text": "With gentle kindness, {child_name} cradled the tiny bird, warming its feathers as the unicorn watched over them.",
        "scene": "Child cradling baby bird in hands on branch with unicorn looking on affectionately.",
        "prompt": "Tender scene of a young child in pink gown gently holding a baby bird in cupped hands on a tree branch, white unicorn watching closely with gentle eyes, lantern glow, compassionate storybook illustration"
    },
    {
        "page": 14,
        "type": "story",
        "personalize": True,
        "text": "With renewed courage, the bird took flight, its joyful song echoing gratitude into the sunset sky.",
        "scene": "Child opening hands as bird takes flight joyfully into the sky.",
        "prompt": "Joyful moment of a young child with open uplifted hands releasing a little bird taking flight into a golden sunset sky, white unicorn standing beside, flying butterflies, hopeful children's book art"
    },
    {
        "page": 15,
        "type": "story",
        "personalize": True,
        "text": "Carefully stepping across the mossy river stones, the two friends helped each other cross the rushing stream.",
        "scene": "Child and unicorn carefully crossing stepping stones over river stream.",
        "prompt": "Full body illustration of a young child holding the unicorn's lead as they carefully step across flat river stones over a clear stream, lush forest banks, teamwork and courage"
    },
    {
        "page": 16,
        "type": "story",
        "personalize": False,
        "text": "A winding stairway of ancient stone beckoned them upward into the heart of the enchanted forest.",
        "scene": "Stone stairs ascending a floral hillside towards a warm golden sunset with hanging lanterns.",
        "prompt": "Ancient stone staircase ascending between flowering hillsides towards a brilliant golden sunset, hanging lanterns glowing in branches, fairytale journey aesthetic"
    },
    {
        "page": 17,
        "type": "story",
        "personalize": True,
        "text": "At the summit stood a grand lantern tree, where secret fairy doorways glowed with welcoming warmth.",
        "scene": "Child and unicorn arrive at enchanted treehouse doorway with warm lanterns.",
        "prompt": "Child and white unicorn discovering a magical hollow tree sanctuary with carved wooden doors and warmly glowing lantern windows, blooming pink flowers, cozy fairytale mystery"
    },
    {
        "page": 18,
        "type": "story",
        "personalize": True,
        "text": "Deep inside, {child_name} found a luminous star-flower, a treasure given only to those with pure and brave hearts.",
        "scene": "Child holding glowing magical star-flower beside unicorn beneath illuminated tree canopy.",
        "prompt": "Magical scene of a young child holding a luminous glowing star flower in her hand, warm golden light illuminating child and white unicorn, enchanted tree canopy with fairy lights, awe-inspired expression"
    },
    {
        "page": 19,
        "type": "story",
        "personalize": False,
        "text": "Fireflies and glowing lanterns illuminated their journey back, guiding their footsteps along the forest trail.",
        "scene": "Enchanted glowing stone pathway illuminated with fairy lights and blooming flora.",
        "prompt": "Fairytale illuminated stone pathway meandering through an enchanted forest canopy, glowing blossoms, hanging lanterns, floating golden motes of light, peaceful evening mood"
    },
    {
        "page": 20,
        "type": "story",
        "personalize": True,
        "text": "As dusk settled softly over the hills, {child_name} led her faithful unicorn toward the cozy cottage lights.",
        "scene": "Child holding basket and leading unicorn along trail toward cozy village cottage at dusk.",
        "prompt": "Young child in pink gown holding flower basket and leading white unicorn along a stone path toward a warm cottage with lit windows at sunset, peaceful homecoming scene"
    },
    {
        "page": 21,
        "type": "story",
        "personalize": True,
        "text": "A playful swirl of twilight petals danced through the air, catching the basket in a flurry of floral magic.",
        "scene": "Child reaching out in surprise as flower petals blow around the path.",
        "prompt": "Dynamic whimsical illustration of a young child reaching out with wide surprised eyes as swirling flower petals blow through the sunset air, unicorn beside her, playful magical breeze"
    },
    {
        "page": 22,
        "type": "story",
        "personalize": True,
        "text": "{child_name} wrapped her arms around her friend, whispering words of gratitude for an unforgettable journey.",
        "scene": "Child tenderly embracing unicorn with flower basket held close.",
        "prompt": "Close-up tender embrace between a young child and a white unicorn, child hugging unicorn's neck, warm cottage in background, deep affectionate friendship, storybook art"
    },
    {
        "page": 23,
        "type": "story",
        "personalize": False,
        "text": "The cottage windows glowed amber against the falling night, while first stars twinkled over the tranquil valley.",
        "scene": "Cottage garden under starry dusk with warm window glow and fence gate.",
        "prompt": "Peaceful nighttime garden outside a stone fairytale cottage, glowing lantern on wooden gate post, starry purple-blue sky, blooming roses in moonlight, tranquil bedtime atmosphere"
    },
    {
        "page": 24,
        "type": "story",
        "personalize": True,
        "text": "With tender affection, {child_name} held the unicorn's hoof, promising that true friendship knows no distance.",
        "scene": "Child holding unicorn's hoof tenderly in farewell and gratitude.",
        "prompt": "Touching moment of a young child holding the unicorn's silver hoof in both hands, heartfelt farewell under starry sky, lanterns glowing, emotional and respectful children's book art"
    },
    {
        "page": 25,
        "type": "story",
        "personalize": True,
        "text": "As the magical unicorn vaulted gracefully into the starlit heavens, {child_name} smiled, knowing true magic would always live within her heart.",
        "scene": "Child smiling as golden spirit unicorn constellation leaps into starry sky.",
        "prompt": "Magical finale: young child smiling warmly at viewer as a magnificent golden shimmering constellation unicorn leaps across the starry night sky above a fairytale castle, glowing fountain, unforgettable wonder"
    },
    {
        "page": 26,
        "type": "ending",
        "personalize": False,
        "text": "Sometimes the most magical adventures begin with friendship. Join {child_name} and the Magical Unicorn as they discover a secret meadow, help a tiny bird, and learn that kindness and courage can make every adventure special.",
        "scene": "Back cover: synopsis text, tagline, rainbow and Kutty Story branding.",
        "prompt": "Children's storybook back cover layout with soft floral border, rainbow arch, warm ivory background, gentle unicorn and child illustration watermark"
    }
]

class PDFImporterService:
    @staticmethod
    def import_story_from_pdf(
        pdf_path: str,
        db: Session,
        title: str = "The Girl and the Magical Unicorn",
        slug: str = "unicorn-story",
        description: str = "A heartwarming personalized tale of a brave young child and a magical unicorn on an enchanted quest through secret meadows and starlit skies.",
        category: str = "Fairytale & Adventure",
        age_range: str = "3-8 years",
        force_reimport: bool = False
    ) -> StoryTemplate:
        """
        Idempotently import a storybook from a PDF file.
        Renders every page into high-resolution PNGs and extracts selectable text.
        """
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"Source PDF not found at: {pdf_path}")
            
        # Check if story already exists
        existing_story = db.query(StoryTemplate).filter(StoryTemplate.slug == slug).first()
        if existing_story and not force_reimport:
            # Check if pages are already rendered
            if len(existing_story.pages) > 0:
                print(f"Story '{slug}' already imported with {len(existing_story.pages)} pages. Skipping reimport.")
                return existing_story

        # Copy original PDF safely into private storage
        stored_pdf_name = f"{slug}-original.pdf"
        dest_pdf_path = settings.ORIGINAL_PDFS_DIR / stored_pdf_name
        shutil.copy2(pdf_path, dest_pdf_path)

        doc = fitz.open(str(dest_pdf_path))
        page_count = len(doc)

        if existing_story:
            story = existing_story
            story.page_count = page_count
            story.source_pdf_path = str(dest_pdf_path)
            # Remove old pages if reimporting
            db.query(StoryPage).filter(StoryPage.story_id == story.id).delete()
        else:
            story = StoryTemplate(
                slug=slug,
                title=title,
                description=description,
                category=category,
                age_range=age_range,
                source_pdf_path=str(dest_pdf_path),
                page_count=page_count,
                status="published",  # Prototype story is published by default for the demo
                price_digital=14.99,
                price_print=29.99
            )
            db.add(story)
            db.commit()
            db.refresh(story)

        # Render pages and save page records
        story_pages_dir = settings.SOURCE_PAGES_DIR / slug
        story_pages_dir.mkdir(parents=True, exist_ok=True)

        for idx in range(page_count):
            page_num = idx + 1
            page = doc[idx]
            
            # Render at 150 DPI (crisp high quality web & print preview: ~1240x1240 px)
            pix = page.get_pixmap(dpi=150)
            page_filename = f"page_{page_num:02d}.png"
            page_dest = story_pages_dir / page_filename
            pix.save(str(page_dest))

            # Selectable text
            extracted = page.get_text().strip()

            # Beat matching
            beat_info = UNICORN_DEFAULT_BEATS[idx] if idx < len(UNICORN_DEFAULT_BEATS) else {
                "page": page_num,
                "type": "story",
                "personalize": True,
                "text": f"Page {page_num} of {title}.",
                "scene": f"Illustration for page {page_num}",
                "prompt": f"Children's book illustration for page {page_num}"
            }

            story_page = StoryPage(
                story_id=story.id,
                page_index=idx,
                page_number=page_num,
                page_type=beat_info.get("type", "story"),
                original_image_path=str(page_dest),
                story_text=beat_info.get("text", ""),
                extracted_text=extracted,
                scene_description=beat_info.get("scene", ""),
                character_guidance="Preserve child's face likeness, hair style, skin tone, wearing sparkling pink dress",
                prompt_template=beat_info.get("prompt", ""),
                personalization_required=beat_info.get("personalize", True),
                allow_illustration_generation=True
            )
            db.add(story_page)

            if page_num == 1:
                story.cover_image_path = str(page_dest)

        db.commit()
        db.refresh(story)
        doc.close()
        print(f"Successfully imported '{story.title}' with {page_count} pages.")
        return story
