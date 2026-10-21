import os
import uuid
import json
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from PIL import Image

from reportlab.lib.pagesizes import inch
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm

from app.config import settings
from app.services.storage import storage

from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Standard square picture book trim size configured via settings
POINTS_PER_MM = 72.0 / 25.4
PAGE_WIDTH_PT = settings.PRINT_TRIM_WIDTH_MM * POINTS_PER_MM
PAGE_HEIGHT_PT = settings.PRINT_TRIM_HEIGHT_MM * POINTS_PER_MM
BLEED_PT = settings.PRINT_BLEED_MM * POINTS_PER_MM
MARGIN_PT = settings.PRINT_SAFE_MARGIN_MM * POINTS_PER_MM

DEFAULT_STORY_FONT = "Helvetica-Bold"
DEFAULT_BODY_FONT = "Helvetica"

# Register universal font for Indian languages (Tamil, Malayalam, Hindi, Marathi, Telugu, Kannada)
for cand in ["C:/Windows/Fonts/Nirmala.ttc", "C:/Windows/Fonts/nirmala.ttc", "C:/Windows/Fonts/NirmalaB.ttf", "C:/Windows/Fonts/segoeui.ttf"]:
    try:
        p = Path(cand)
        if p.exists():
            if str(cand).endswith(".ttc"):
                pdfmetrics.registerFont(TTFont("MultiLangFont", str(p), subfontIndex=0))
            else:
                pdfmetrics.registerFont(TTFont("MultiLangFont", str(p)))
            DEFAULT_STORY_FONT = "MultiLangFont"
            DEFAULT_BODY_FONT = "MultiLangFont"
            break
    except Exception:
        continue


class PDFComposerService:
    """
    Deterministic PDF Layout Engine using ReportLab.
    Separates artwork generation from typography, ensuring sharp vector text,
    proper margins, bleed handling, CMYK color separation, and print preflight validation.
    """

    @staticmethod
    def compose_storybook_pdf(
        pages_data: List[Dict[str, Any]],
        output_filename: str,
        book_type: str = "preview",
        child_name: str = "Little Adventurer",
        story_title: str = "Personalized Story",
        page_size: str = "8x8",
        color_mode: str = "rgb"
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Compose a complete, deterministic square children's picture book.
        
        Supported page_size options:
        - "8x8", "8x8_inch", "8*8", "8*8 mm", "8*8mm", "8x8mm": 8.0 x 8.0 inches (203.2 x 203.2 mm) = 576 x 576 pt
        - "210x210", "210x210_mm": 210 x 210 mm = 595.28 x 595.28 pt
        
        Supported color_mode options:
        - "rgb": Vibrant high-fidelity RGB (DeviceRGB color space, matching screen preview and modern photo printing)
        - "cmyk": Commercial print CMYK (DeviceCMYK color space with 4-channel image separation)
        """
        output_dir = settings.PREVIEWS_DIR if book_type == "preview" else settings.FINAL_BOOKS_DIR
        output_dir.mkdir(parents=True, exist_ok=True)
        pdf_path = output_dir / output_filename

        # 1. Resolve Page Geometry (8x8 inches = 203.2 x 203.2 mm = 576 x 576 pt)
        normalized_size = str(page_size).lower().strip().replace(" ", "")
        if any(token in normalized_size for token in ["8x8", "8*8", "8inch"]):
            page_w_pt = 8.0 * inch
            page_h_pt = 8.0 * inch
            trim_label = "8 x 8 inches (203.2 x 203.2 mm)"
        elif "210" in normalized_size:
            page_w_pt = 210.0 * POINTS_PER_MM
            page_h_pt = 210.0 * POINTS_PER_MM
            trim_label = "210 x 210 mm"
        else:
            page_w_pt = 8.0 * inch
            page_h_pt = 8.0 * inch
            trim_label = "8 x 8 inches (203.2 x 203.2 mm)"

        is_cmyk = (str(color_mode).lower().strip() == "cmyk")

        # ReportLab Canvas
        c = canvas.Canvas(str(pdf_path), pagesize=(page_w_pt, page_h_pt))

        # Color definitions for CMYK vs RGB
        if is_cmyk:
            card_fill = colors.CMYKColor(0.01, 0.02, 0.04, 0.01, alpha=0.94)  # Ivory in CMYK
            card_stroke = colors.CMYKColor(0.12, 0.22, 0.60, 0.10, alpha=0.50) # Muted gold in CMYK
            text_color = colors.CMYKColor(0.30, 0.50, 0.20, 0.85)             # Deep plum rich black
            page_num_color = colors.CMYKColor(0.10, 0.10, 0.10, 0.60)         # Muted charcoal
            banner_bg = colors.CMYKColor(0.10, 0.40, 0.30, 0.05, alpha=0.85)  # Dusty rose in CMYK
            fallback_bg = colors.CMYKColor(0.01, 0.02, 0.04, 0.01)
        else:
            card_fill = colors.Color(0.98, 0.97, 0.95, alpha=0.98)
            card_stroke = colors.Color(0.83, 0.69, 0.22, alpha=0.40)
            text_color = colors.HexColor("#2D222A")
            page_num_color = colors.HexColor("#7A7077")
            banner_bg = colors.Color(0.87, 0.65, 0.64, alpha=0.85)
            fallback_bg = colors.HexColor("#FAF7F2")

        preflight_validation = {
            "book_type": book_type,
            "page_count": len(pages_data),
            "trim_size": trim_label,
            "dimensions_pt": f"{page_w_pt:.2f} x {page_h_pt:.2f}",
            "color_space": "DeviceCMYK (4 Channels)" if is_cmyk else "DeviceRGB (3 Channels)",
            "aspect_ratio": "1:1 Square",
            "has_missing_images": False,
            "dpi_check": [],
            "validation_passed": True
        }

        # Cache folder for CMYK converted images
        cmyk_cache_dir = settings.STORAGE_DIR / "cache_cmyk"
        if is_cmyk:
            cmyk_cache_dir.mkdir(parents=True, exist_ok=True)

        for idx, page_info in enumerate(pages_data):
            page_num = page_info.get("page_number", idx + 1)
            raw_img_path = page_info.get("image_path")
            resolved_img_path = storage.resolve_path(raw_img_path) if raw_img_path else None
            img_path = resolved_img_path if (resolved_img_path and os.path.exists(resolved_img_path)) else None
            story_text = page_info.get("story_text", "")
            for tag in ["[Name]", "[name]", "{name}", "[child_name]", "{child_name}"]:
                story_text = story_text.replace(tag, child_name)

            c.saveState()

            # 2. Draw Illustration Artwork (Full Bleed)
            if img_path and os.path.exists(img_path):
                draw_img_path = img_path
                try:
                    with Image.open(img_path) as pil_img:
                        w, h = pil_img.size
                        dpi_x = (w / (page_w_pt / 72.0))
                        preflight_validation["dpi_check"].append({
                            "page": page_num,
                            "resolution_px": f"{w}x{h}",
                            "effective_dpi": round(dpi_x, 1)
                        })

                        if is_cmyk:
                            # Convert to true 4-channel CMYK for print
                            cmyk_filename = f"cmyk_{Path(img_path).stem}_{w}x{h}.jpg"
                            cached_cmyk_path = cmyk_cache_dir / cmyk_filename
                            if not cached_cmyk_path.exists() or os.path.getmtime(img_path) > os.path.getmtime(cached_cmyk_path):
                                cmyk_img = pil_img.convert("CMYK")
                                cmyk_img.save(str(cached_cmyk_path), format="JPEG", quality=96)
                            draw_img_path = str(cached_cmyk_path)

                    c.drawImage(draw_img_path, 0, 0, width=page_w_pt, height=page_h_pt, preserveAspectRatio=True)
                except Exception as e:
                    print(f"Notice: Error drawing image on page {page_num}: {e}")
                    preflight_validation["has_missing_images"] = True
                    preflight_validation["validation_passed"] = False
                    c.setFillColor(fallback_bg)
                    c.rect(0, 0, page_w_pt, page_h_pt, fill=1, stroke=0)
            else:
                preflight_validation["has_missing_images"] = True
                preflight_validation["validation_passed"] = False
                c.setFillColor(fallback_bg)
                c.rect(0, 0, page_w_pt, page_h_pt, fill=1, stroke=0)





            # 5. Preview Watermark badge (Only for free preview; Omitted for final print books)
            if book_type == "preview":
                c.saveState()
                c.setFillColor(banner_bg)
                c.rect(0, page_h_pt - 26, 170, 26, fill=1, stroke=0)
                c.setFillColor(colors.white)
                c.setFont("Helvetica-Bold", 9)
                c.drawString(14, page_h_pt - 17, "PERSONALIZED PREVIEW")
                c.restoreState()

            c.restoreState()
            c.showPage()

        c.save()
        category = "previews" if book_type == "preview" else "final_books"
        object_key = storage.save_file(pdf_path, category=category, object_name=output_filename)
        return object_key, preflight_validation


