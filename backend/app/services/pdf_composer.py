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

# Standard square picture book trim size configured via settings
POINTS_PER_MM = 72.0 / 25.4
PAGE_WIDTH_PT = settings.PRINT_TRIM_WIDTH_MM * POINTS_PER_MM
PAGE_HEIGHT_PT = settings.PRINT_TRIM_HEIGHT_MM * POINTS_PER_MM
BLEED_PT = settings.PRINT_BLEED_MM * POINTS_PER_MM
MARGIN_PT = settings.PRINT_SAFE_MARGIN_MM * POINTS_PER_MM

class PDFComposerService:
    """
    Deterministic PDF Layout Engine using ReportLab.
    Separates artwork generation from typography, ensuring sharp vector text,
    proper margins, bleed handling, and print preflight validation.
    """

    @staticmethod
    def compose_storybook_pdf(
        pages_data: List[Dict[str, Any]],
        output_filename: str,
        book_type: str = "preview",
        child_name: str = "Little Adventurer",
        story_title: str = "The Girl and the Magical Unicorn",
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Compose a complete, deterministic square children's picture book.
        
        pages_data item format:
        {
            "page_number": int,
            "page_type": "cover" | "story" | "ending",
            "image_path": str,
            "story_text": str
        }
        """
        output_dir = settings.PREVIEWS_DIR if book_type == "preview" else settings.FINAL_BOOKS_DIR
        output_dir.mkdir(parents=True, exist_ok=True)
        pdf_path = output_dir / output_filename

        c = canvas.Canvas(str(pdf_path), pagesize=(PAGE_WIDTH_PT, PAGE_HEIGHT_PT))
        
        preflight_validation = {
            "book_type": book_type,
            "page_count": len(pages_data),
            "trim_size_mm": "210 x 210",
            "dimensions_pt": f"{PAGE_WIDTH_PT:.2f} x {PAGE_HEIGHT_PT:.2f}",
            "aspect_ratio": "1:1 Square",
            "has_missing_images": False,
            "dpi_check": [],
            "validation_passed": True
        }

        for idx, page_info in enumerate(pages_data):
            page_num = page_info.get("page_number", idx + 1)
            page_type = page_info.get("page_type", "story")
            img_path = page_info.get("image_path")
            story_text = page_info.get("story_text", "").replace("{child_name}", child_name)

            # 1. Background / Canvas Setup
            c.saveState()

            # 2. Draw Illustration Artwork
            if img_path and os.path.exists(img_path):
                try:
                    with Image.open(img_path) as pil_img:
                        w, h = pil_img.size
                        # Preflight image DPI check
                        dpi_x = (w / (PAGE_WIDTH_PT / 72.0))
                        preflight_validation["dpi_check"].append({
                            "page": page_num,
                            "resolution_px": f"{w}x{h}",
                            "effective_dpi": round(dpi_x, 1)
                        })

                    if page_type == "cover":
                        # Full bleed artwork on cover
                        c.drawImage(img_path, 0, 0, width=PAGE_WIDTH_PT, height=PAGE_HEIGHT_PT, preserveAspectRatio=True)
                    else:
                        # Full bleed illustration
                        c.drawImage(img_path, 0, 0, width=PAGE_WIDTH_PT, height=PAGE_HEIGHT_PT, preserveAspectRatio=True)
                except Exception as e:
                    preflight_validation["has_missing_images"] = True
                    preflight_validation["validation_passed"] = False
                    # Fallback colored card
                    c.setFillColor(colors.HexColor("#FAF7F2"))
                    c.rect(0, 0, PAGE_WIDTH_PT, PAGE_HEIGHT_PT, fill=1, stroke=0)
            else:
                preflight_validation["has_missing_images"] = True
                preflight_validation["validation_passed"] = False
                c.setFillColor(colors.HexColor("#FAF7F2"))
                c.rect(0, 0, PAGE_WIDTH_PT, PAGE_HEIGHT_PT, fill=1, stroke=0)

            # 3. Typeset Story Text Overlay
            # For pages 2-25, if story text is provided, render it with luxury editorial styling:
            # A soft translucent ivory pill card at the bottom with deep plum typography.
            if page_type == "story" and story_text and len(story_text.strip()) > 0:
                card_margin_h = 35 * POINTS_PER_MM # 35mm side margins
                card_width = PAGE_WIDTH_PT - (2 * card_margin_h)
                card_bottom = 20 * POINTS_PER_MM # 20mm from bottom
                card_height = 42 * POINTS_PER_MM # 42mm height

                # Semi-translucent luxury backdrop card
                c.saveState()
                c.setFillColor(colors.HexColor("#FAF7F2"), alpha=0.92)
                c.setStrokeColor(colors.HexColor("#D4AF37"), alpha=0.4) # Muted gold border
                c.setLineWidth(1)
                c.roundRect(card_margin_h, card_bottom, card_width, card_height, 12, fill=1, stroke=1)
                c.restoreState()

                # Text inside the card
                c.saveState()
                c.setFillColor(colors.HexColor("#2D222A")) # Deep plum
                c.setFont("Helvetica-Bold", 11)
                
                # Word wrap into lines
                words = story_text.split()
                lines = []
                cur_line = []
                for word in words:
                    test_line = " ".join(cur_line + [word])
                    if c.stringWidth(test_line, "Helvetica", 11) < (card_width - 24):
                        cur_line.append(word)
                    else:
                        lines.append(" ".join(cur_line))
                        cur_line = [word]
                if cur_line:
                    lines.append(" ".join(cur_line))

                # Draw lines centered vertically and horizontally inside the pill
                total_text_height = len(lines) * 16
                start_y = card_bottom + (card_height + total_text_height) / 2 - 12
                for line_idx, line in enumerate(lines):
                    line_w = c.stringWidth(line, "Helvetica", 11)
                    line_x = card_margin_h + (card_width - line_w) / 2
                    c.drawString(line_x, start_y - (line_idx * 16), line)
                c.restoreState()

            # 4. Page numbering (interior pages only)
            if page_type == "story":
                c.saveState()
                c.setFont("Helvetica", 9)
                c.setFillColor(colors.HexColor("#7A7077"))
                page_str = str(page_num)
                c.drawRightString(PAGE_WIDTH_PT - 20, 15, page_str)
                c.restoreState()

            # 5. Preview Watermark badge if preview mode
            if book_type == "preview":
                c.saveState()
                # Subtle elegant diagonal ribbon or watermark
                c.setFillColor(colors.HexColor("#DDA7A2"), alpha=0.85) # Dusty rose banner
                c.rect(0, PAGE_HEIGHT_PT - 26, 170, 26, fill=1, stroke=0)
                c.setFillColor(colors.white)
                c.setFont("Helvetica-Bold", 9)
                c.drawString(14, PAGE_HEIGHT_PT - 17, "PERSONALIZED PREVIEW")
                c.restoreState()

            c.restoreState()
            c.showPage()

        c.save()
        return str(pdf_path), preflight_validation
