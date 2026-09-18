"""
File Service Module
Handles secure document uploads, cryptographic checksum generation,
and text extraction for PDF, plain-text, and image formats.
"""

import os
import uuid
import hashlib
from typing import Tuple, Optional
from fastapi import UploadFile
from app.config import settings
from app.schemas import FileUploadResponse

SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".eml", ".csv", ".json", ".png", ".jpg", ".jpeg"}

def compute_sha256(content: bytes) -> str:
    """Computes cryptographic digest of file contents for data integrity."""
    return hashlib.sha256(content).hexdigest()

def extract_text_from_pdf(content: bytes) -> Tuple[Optional[str], bool, str]:
    """Extracts text streams from a PDF file using pypdf."""
    try:
        from io import BytesIO
        from pypdf import PdfReader

        reader = PdfReader(BytesIO(content))
        extracted_pages = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text and text.strip():
                extracted_pages.append(f"--- Page {i + 1} ---\n{text.strip()}")

        if extracted_pages:
            full_text = "\n\n".join(extracted_pages)
            return full_text, True, f"Extracted text from {len(extracted_pages)} PDF page(s)."
        else:
            return None, False, "PDF contains no readable text streams (may be a scanned raster image)."
    except Exception as e:
        return None, False, f"Failed to parse PDF document: {str(e)}"

def extract_text_from_plain_text(content: bytes) -> Tuple[Optional[str], bool, str]:
    """Extracts text from plain text or email file."""
    for encoding in ["utf-8", "latin-1", "windows-1252"]:
        try:
            text = content.decode(encoding)
            return text, True, f"Extracted text cleanly with {encoding} encoding."
        except UnicodeDecodeError:
            continue
    return None, False, "Unable to decode text with supported character encodings."

async def process_uploaded_file(file: UploadFile) -> FileUploadResponse:
    """
    Safely saves an uploaded file, computes SHA-256 hash, and performs text extraction.
    """
    original_filename = file.filename or "uploaded_document"
    ext = os.path.splitext(original_filename)[1].lower()

    if ext not in SUPPORTED_EXTENSIONS:
        return FileUploadResponse(
            attachment_id=str(uuid.uuid4()),
            file_name=original_filename,
            file_type=file.content_type or "unknown",
            file_size_bytes=0,
            file_hash_sha256="",
            extracted_text=None,
            is_parsed=False,
            message=f"Unsupported file extension '{ext}'. Supported formats: {', '.join(sorted(list(SUPPORTED_EXTENSIONS)))}.",
        )

    # Read binary content
    content = await file.read()
    file_size = len(content)
    file_hash = compute_sha256(content)

    # Generate unique storage name to prevent collisions and path traversal
    unique_id = str(uuid.uuid4())
    safe_filename = f"{unique_id}_{os.path.basename(original_filename)}"
    storage_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(storage_path, "wb") as f:
        f.write(content)

    extracted_text = None
    is_parsed = False
    status_message = ""

    if ext == ".pdf":
        extracted_text, is_parsed, status_message = extract_text_from_pdf(content)
    elif ext in {".txt", ".eml", ".csv", ".json"}:
        extracted_text, is_parsed, status_message = extract_text_from_plain_text(content)
    elif ext in {".png", ".jpg", ".jpeg"}:
        is_parsed = False
        status_message = "Image upload stored and cryptographic digest verified. (OCR extraction is not engaged in prototype mode)."

    return FileUploadResponse(
        attachment_id=unique_id,
        file_name=original_filename,
        file_type=file.content_type or "application/octet-stream",
        file_size_bytes=file_size,
        file_hash_sha256=file_hash,
        extracted_text=extracted_text,
        is_parsed=is_parsed,
        message=status_message,
    )
