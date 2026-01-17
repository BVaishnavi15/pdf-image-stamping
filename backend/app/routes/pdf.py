from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import FileResponse
from pathlib import Path
import json

from app.utils.file_handler import save_upload_file
from app.services.pdf_stamper import stamp_image_on_pdf, stamp_image_on_pdf_multi

router = APIRouter(prefix="/pdf", tags=["PDF"])


@router.post("/stamp")
async def stamp_pdf(
    pdf: UploadFile = File(...),
    image: UploadFile = File(...),
    x: float = Form(...),
    y: float = Form(...),
    width: float = Form(...),
    height: float = Form(...)
):
    pdf_path = save_upload_file(pdf)
    image_path = save_upload_file(image)

    output_path = Path("uploads") / f"stamped_{pdf_path.name}"

    stamp_image_on_pdf(
        pdf_path=pdf_path,
        image_path=image_path,
        x=x,
        y=y,
        width=width,
        height=height,
        output_path=output_path
    )

    return FileResponse(
        output_path,
        media_type="application/pdf",
        filename="stamped.pdf"
    )


@router.post("/stamp-multi")
async def stamp_pdf_multi(
    pdf: UploadFile = File(...),
    image: UploadFile = File(...),
    signatures: str = Form(...)
):
    pdf_path = save_upload_file(pdf)
    image_path = save_upload_file(image)

    # Parse signatures JSON
    try:
        signatures_list = json.loads(signatures)
        if not isinstance(signatures_list, list):
            return {"error": "Invalid signatures format"}, 400
    except json.JSONDecodeError:
        return {"error": "Invalid JSON"}, 400

    output_path = Path("uploads") / f"stamped_multi_{pdf_path.name}"

    stamp_image_on_pdf_multi(
        pdf_path=pdf_path,
        image_path=image_path,
        signatures=signatures_list,
        output_path=output_path
    )

    return FileResponse(
        output_path,
        media_type="application/pdf",
        filename="stamped.pdf"
    )
