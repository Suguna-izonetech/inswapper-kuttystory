import os
from pathlib import Path
from typing import Optional
from PIL import Image, ImageOps, ImageDraw, ImageFilter

from app.config import settings

class CharacterConsistencyEngine:
    """
    Manages the Character Reference Package and facial normalization.
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
            studio_bg = Image.new("RGB", (512, 512), (250, 247, 242))
            mask = Image.new("L", (512, 512), 0)
            draw = ImageDraw.Draw(mask)
            draw.ellipse((40, 25, 472, 490), fill=255)
            feathered_mask = mask.filter(ImageFilter.GaussianBlur(radius=28))

            composite = Image.composite(resized, studio_bg, feathered_mask)
            composite.save(dest, format="JPEG", quality=94)

        return dest

consistency_engine = CharacterConsistencyEngine()
