import os
import time
from pathlib import Path
from typing import Dict, Any, List, Optional
from PIL import Image, ImageOps

from app.config import settings
from app.services.storage import storage
from app.services.ai.base import GenerationResult
from app.services.ai.gemini_provider import gemini_provider
from app.services.ai.diffusers_provider import diffusers_provider
from app.services.ai.mock_provider import mock_provider

class CharacterConsistencyEngine:
    """
    Manages the Character Reference Package and runs the 3-Page Character Consistency POC.
    """

    @staticmethod
    def normalize_child_reference(image_path: str, output_path: Optional[str] = None) -> str:
        """
        Normalize parent-authorized photograph:
        - Auto-orient based on EXIF
        - Crop to square face/bust focus
        - Resize to 512x512
        - Normalize RGB colors
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Reference image not found: {image_path}")

        dest = output_path or str(settings.CHILD_PHOTOS_DIR / f"norm_{Path(image_path).name}")
        with Image.open(image_path) as img:
            img = ImageOps.exif_transpose(img)
            img = img.convert("RGB")
            
            # Center square crop
            w, h = img.size
            min_dim = min(w, h)
            left = (w - min_dim) // 2
            top = (h - min_dim) // 4  # bias slightly toward upper third for headshots
            if top + min_dim > h:
                top = (h - min_dim) // 2
            right = left + min_dim
            bottom = top + min_dim

            cropped = img.crop((left, top, right, bottom))
            resized = cropped.resize((512, 512), Image.Resampling.LANCZOS)

            # Composite over plain solid studio backdrop (#FAF7F2 Warm Ivory)
            # Isolates child portrait and eliminates peripheral room/outdoor clutter for AI consistency
            from PIL import ImageDraw, ImageFilter
            studio_bg = Image.new("RGB", (512, 512), (250, 247, 242))
            mask = Image.new("L", (512, 512), 0)
            draw = ImageDraw.Draw(mask)
            draw.ellipse((40, 25, 472, 490), fill=255)
            feathered_mask = mask.filter(ImageFilter.GaussianBlur(radius=28))

            composite = Image.composite(resized, studio_bg, feathered_mask)
            composite.save(dest, format="JPEG", quality=94)

        return dest

    @staticmethod
    async def run_three_image_poc(
        child_name: str,
        child_reference_path: str,
        provider_name: str = "mock_poc",
        model_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Execute the 3-Representative-Page Proof of Concept.
        Pages:
        1. Page 07: Close-up portrait (child smiling with hand on unicorn cheek)
        2. Page 10: Dynamic action/full-body (child running with unicorn through wildflower field)
        3. Page 13: Distinct pose & setting (child gently cradling baby fledgling bird)
        """
        norm_ref_path = CharacterConsistencyEngine.normalize_child_reference(child_reference_path)
        
        test_scenes = [
            {
                "page_number": 7,
                "scene_type": "Close-up Portrait",
                "source_description": "Child smiling warmly with hand resting affectionately on unicorn's face beside castle path.",
                "base_prompt": f"Heartwarming close-up portrait of {child_name} smiling warmly with her hand caressing the gentle cheek of a white unicorn, soft wind blowing hair and unicorn's mane, golden hour sunset, storybook illustration"
            },
            {
                "page_number": 10,
                "scene_type": "Full-body Action Scene",
                "source_description": "Child and unicorn running joyfully through meadow filled with wildflowers and fluttering butterflies.",
                "base_prompt": f"Full body dynamic illustration of {child_name} in an elegant pink ruffled dress running happily alongside a galloping white unicorn through a field of lavender and pink blossoms, laughing expression, energetic motion"
            },
            {
                "page_number": 13,
                "scene_type": "Emotional Interaction / Different Pose",
                "source_description": "Child gently cradling baby bird in hands on branch with unicorn looking on affectionately.",
                "base_prompt": f"Tender scene of {child_name} with cupped hands gently holding a tiny fledgling baby bird on a floral branch, white unicorn with glowing horn looking on compassionately, lantern glow, storytelling atmosphere"
            }
        ]

        from app.services.ai.cartoon_fusion import cartoon_fusion_engine

        results = []
        poc_dir = settings.GENERATED_ASSETS_DIR / "poc_test"
        poc_dir.mkdir(parents=True, exist_ok=True)

        for sc in test_scenes:
            # Expand prompt with Gemini if available
            expanded_prompt = await gemini_provider.expand_prompt(sc["base_prompt"], child_name)
            
            gen_result = None
            if provider_name == "huggingface" and settings.HF_TOKEN:
                try:
                    gen_result = await diffusers_provider.generate_illustration(
                        prompt=expanded_prompt,
                        reference_image_path=norm_ref_path,
                        width=1024,
                        height=1024
                    )
                except Exception as ex:
                    print(f"Notice: Diffusers hosted call failed ({ex}), falling back to Realistic Face Consistency Engine.")

            if not gen_result:
                gen_result = cartoon_fusion_engine.fuse_page(
                    page_number=sc["page_number"],
                    child_reference_path=norm_ref_path,
                    story_slug="unicorn-story"
                )

            # Save generated illustration
            img_filename = f"poc_page_{sc['page_number']:02d}_{int(time.time())}.{gen_result.format}"
            saved_path = str(poc_dir / img_filename)
            with open(saved_path, "wb") as f:
                f.write(gen_result.image_bytes)

            public_url = storage.get_public_url(saved_path)

            results.append({
                "page_number": sc["page_number"],
                "scene_type": sc["scene_type"],
                "source_description": sc["source_description"],
                "prompt": expanded_prompt,
                "saved_path": saved_path,
                "image_url": public_url,
                "provider": gen_result.provider,
                "model": gen_result.model,
                "generation_time_sec": gen_result.generation_time_sec,
                "cost_estimate": gen_result.cost_estimate_usd,
                "is_simulated": gen_result.is_simulated,
                "review_status": "pending_review"
            })

        ref_public_url = storage.get_public_url(norm_ref_path)

        return {
            "test_id": f"poc_{int(time.time())}",
            "child_name": child_name,
            "child_reference_url": ref_public_url,
            "provider_used": results[0]["provider"],
            "model_used": results[0]["model"],
            "hardware_check": mock_provider.check_hardware().__dict__,
            "pages": results,
            "summary": "3-page character consistency proof-of-concept executed successfully across portrait, action, and animal rescue scenes.",
            "status": "ready_for_review"
        }

consistency_engine = CharacterConsistencyEngine()
