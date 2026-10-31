from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pathlib import Path

from app.database import get_db
from app.models import Book, PersonalizationJob
from app.schemas import BookOut
from app.services.storage import storage

router = APIRouter(prefix="/books", tags=["Books"])

@router.get("/{book_id}", response_model=BookOut)
def get_book(book_id: str, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    return {
        "id": book.id,
        "job_id": book.job_id,
        "book_type": book.book_type,
        "version": book.version,
        "pdf_storage_path": book.pdf_storage_path,
        "pdf_download_url": f"/api/v1/books/{book.id}/download",
        "page_count": book.page_count,
        "validation_status": book.validation_status,
        "validation_details": book.validation_details,
        "created_at": book.created_at
    }

@router.get("/{book_id}/download")
def download_book_pdf(book_id: str, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book or not book.pdf_storage_path:
        raise HTTPException(status_code=404, detail="Book or PDF not found")
    
    category, filename = storage._parse_category_and_filename(book.pdf_storage_path)
    if not category or not filename:
        category = "previews" if getattr(book, "book_type", "preview") == "preview" else "final_books"
        filename = Path(book.pdf_storage_path).name

    job = db.query(PersonalizationJob).filter(PersonalizationJob.id == book.job_id).first()
    child_name = job.child_name.replace(" ", "_") if job else "Custom"
    download_filename = f"{child_name}_and_the_Magical_Unicorn_{book.book_type}.pdf"

    stream, media_type, content_length = storage.get_object_stream(category, filename)

    def iterfile():
        try:
            for chunk in stream.stream(32768):
                yield chunk
        finally:
            stream.close()
            stream.release_conn()

    return StreamingResponse(
        iterfile(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{download_filename}"',
            "Content-Length": str(content_length),
            "Access-Control-Expose-Headers": "Content-Disposition, Content-Length"
        }
    )


