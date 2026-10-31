import sys
sys.path.append('kuttystory-buffalo-ovi/backend')
from app.services.storage import storage
import fitz

objects = storage.client.list_objects(storage.bucket, prefix="original_pdfs/", recursive=True)
for obj in objects:
    try:
        data = storage.get_bytes(obj.object_name)
        doc = fitz.open(stream=data, filetype="pdf")
        print(f"PDF {obj.object_name}: {len(doc)} pages, size={len(data)/(1024*1024):.2f} MB")
    except Exception as e:
        print(f"PDF {obj.object_name}: Error {e}")

