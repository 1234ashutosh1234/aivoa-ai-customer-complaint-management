"""
Document Uploads API Router
Supports secure ingestion and parsing of PDF, TXT, and scanned image documents.
"""

from fastapi import APIRouter, UploadFile, File, Form, status, HTTPException
from app.schemas import APIResponse, FileUploadResponse
from app.services.file_service import process_uploaded_file

router = APIRouter(prefix="/uploads", tags=["Uploads"])

@router.post("/document", response_model=APIResponse[FileUploadResponse], status_code=status.HTTP_201_CREATED, summary="Upload and parse complaint document")
async def upload_document(
    file: UploadFile = File(..., description="Target document (.pdf, .txt, .eml, .png, .jpg)"),
    source_type: str = Form("document", description="Document source classification"),
):
    """
    Ingests an unstructured customer document, calculates cryptographic SHA-256 digest,
    and extracts text streams for downstream AI entity extraction.
    """
    try:
        result = await process_uploaded_file(file)
        return APIResponse(
            success=True,
            data=result,
            message="File uploaded and processed successfully."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during document processing: {str(e)}"
        )
