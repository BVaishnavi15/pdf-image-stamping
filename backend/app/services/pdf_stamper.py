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
