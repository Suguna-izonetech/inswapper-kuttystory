from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
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
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    pdf_path = Path(book.pdf_storage_path)
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="PDF file missing from storage")

    job = db.query(PersonalizationJob).filter(PersonalizationJob.id == book.job_id).first()
    child_name = job.child_name.replace(" ", "_") if job else "Custom"
    filename = f"{child_name}_and_the_Magical_Unicorn_{book.book_type}.pdf"

    return FileResponse(
        path=pdf_path,
        filename=filename,
        media_type="application/pdf"
    )
