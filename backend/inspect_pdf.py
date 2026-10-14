import fitz  # PyMuPDF
import os
import json

pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sample-assets", "unicorn Story.pdf"))

print(f"Checking PDF at: {pdf_path}")
if not os.path.exists(pdf_path):
    print("ERROR: PDF file not found!")
    exit(1)

doc = fitz.open(pdf_path)
print(f"PDF Successfully opened.")
print(f"Page Count: {len(doc)}")
print(f"Metadata: {json.dumps(doc.metadata, indent=2)}")

pages_info = []
for i in range(len(doc)):
    page = doc[i]
    rect = page.rect
    text = page.get_text().strip()
    images = page.get_images()
    pages_info.append({
        "page_number": i + 1,
        "width": rect.width,
        "height": rect.height,
        "aspect_ratio": f"{rect.width/rect.height:.2f}",
        "text_length": len(text),
        "text_sample": text[:80] if text else "(No selectable text)",
        "image_count": len(images)
    })

print("\n--- Summary of Pages ---")
for p in pages_info:
    print(f"Page {p['page_number']:02d}: {p['width']}x{p['height']} (Ratio: {p['aspect_ratio']}) | Images: {p['image_count']} | Text: {p['text_sample']}")

doc.close()
