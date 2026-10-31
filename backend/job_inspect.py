import sys
sys.path.append('kuttystory-buffalo-ovi/backend')
from app.database import SessionLocal
from app.models import StoryTemplate, StoryPage, PersonalizationJob, GeneratedAsset, Book
from app.services.storage import storage
import fitz

db = SessionLocal()
jid = '4cc0d012-afcf-4491-b73b-8c8efc4750da'
job = db.query(PersonalizationJob).filter(PersonalizationJob.id == jid).first()
print(f'Job: {job.id}, child={job.child_name}, photo={job.photo_path}, is_paid={job.is_paid}, status={job.status}')
story = db.query(StoryTemplate).filter(StoryTemplate.id == job.story_id).first()
print(f'Story: {story.id}, title={story.title}, slug={story.slug}, source_pdf_path={story.source_pdf_path}, page_count={story.page_count}')

if story.source_pdf_path:
    cat, fn = storage._parse_category_and_filename(story.source_pdf_path)
    if cat and fn and storage.file_exists(cat, fn):
        s_bytes = storage.get_bytes(story.source_pdf_path)
        doc = fitz.open(stream=s_bytes, filetype="pdf")
        print(f"Original Story PDF in storage has {len(doc)} pages!")
    else:
        print(f"Original Story PDF {story.source_pdf_path} not found in storage")

pages = db.query(StoryPage).filter(StoryPage.story_id == story.id).order_by(StoryPage.page_index).all()
print(f'StoryPages count in DB: {len(pages)}')
for p in pages:
    has_outline = bool(p.face_outline_points and p.face_outline_points not in ['[]', 'none', 'false'])
    print(f'  P{p.page_number} (id={p.id}, req={p.personalization_required}, img={p.original_image_path}, outline={has_outline})')

assets = db.query(GeneratedAsset).filter(GeneratedAsset.job_id == jid).order_by(GeneratedAsset.page_number, GeneratedAsset.created_at.desc()).all()
print(f'GeneratedAssets count in DB: {len(assets)}')
for a in assets:
    print(f'  Asset: page={a.page_number}, status={a.generation_status}, model={a.model}, provider={a.provider}, path={a.storage_path}')

# Check final_books
for cand in [
    f"final_books/final_book_{jid}_english_8x8_rgb.pdf",
    f"final_books/final_book_{jid}_english_8x8.pdf",
    f"previews/preview_{jid}.pdf"
]:
    cat, fn = storage._parse_category_and_filename(cand)
    exists = storage.file_exists(cat, fn)
    print(f"Storage {cand}: exists={exists}")
    if exists:
        data = storage.get_bytes(cand)
        pdf_doc = fitz.open(stream=data, filetype="pdf")
        print(f"  --> Page count: {len(pdf_doc)}")
