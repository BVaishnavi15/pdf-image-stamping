import uuid
from pathlib import Path
from fastapi import UploadFile

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def save_upload_file(upload_file: UploadFile) -> Path:
    """
    Saves an uploaded file to disk with a unique name.
    Returns the file path.
    """
    suffix = Path(upload_file.filename).suffix
    unique_name = f"{uuid.uuid4()}{suffix}"
    file_path = UPLOAD_DIR / unique_name

    with open(file_path, "wb") as buffer:
        buffer.write(upload_file.file.read())

    return file_path
