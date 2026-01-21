import fitz  # PyMuPDF
from pathlib import Path


def stamp_image_on_pdf(
    pdf_path: Path,
    image_path: Path,
    x: float,
    y: float,
    width: float,
    height: float,
    output_path: Path
) -> None:
    """
    Stamps an image on all pages of a PDF at the given coordinates.
    """
    doc = fitz.open(pdf_path)
    image_bytes = image_path.read_bytes()

    for page in doc:
        rect = fitz.Rect(x, y, x + width, y + height)
        page.insert_image(rect, stream=image_bytes)

    doc.save(output_path)
    doc.close()


def stamp_image_on_pdf_multi(
    pdf_path: Path,
    image_path: Path,
    signatures: list,
    output_path: Path
) -> None:
    """
    Stamps an image on specific pages of a PDF with per-page coordinates.
    
    Args:
        pdf_path: Path to the PDF file
        image_path: Path to the image file
        signatures: List of signature objects, each with:
            - x, y, width, height: coordinates and dimensions
            - page: page number (1-indexed)
        output_path: Path to save the stamped PDF
    """
    doc = fitz.open(pdf_path)
    image_bytes = image_path.read_bytes()
    
    # Group signatures by page
    signatures_by_page = {}
    for sig in signatures:
        page_num = sig.get("page", 1)
        if 1 <= page_num <= len(doc):
            if page_num not in signatures_by_page:
                signatures_by_page[page_num] = []
            signatures_by_page[page_num].append(sig)
    
    # Stamp each page with its specific signature positions
    for page_num in range(1, len(doc) + 1):
        page = doc[page_num - 1]  
        
        # If this page has specific signatures, use them; otherwise skip
        if page_num in signatures_by_page:
            for sig in signatures_by_page[page_num]:
                x = float(sig.get("x", 0))
                y = float(sig.get("y", 0))
                width = float(sig.get("width", 100))
                height = float(sig.get("height", 50))
                
                rect = fitz.Rect(x, y, x + width, y + height)
                page.insert_image(rect, stream=image_bytes)

    doc.save(output_path)
    doc.close()