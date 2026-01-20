import uuid
from pathlib import Path
from fastapi import UploadFile

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
MAX_UPLOAD_FILES = 10


def _trim_upload_dir(max_files: int = MAX_UPLOAD_FILES) -> None:
    """
    Keeps only the newest `max_files` files in the uploads directory.
    Deletes older ones.
    """
    try:
        files = [p for p in UPLOAD_DIR.iterdir() if p.is_file()]
        # Sort newest first by modified time
        files.sort(key=lambda p: p.stat().st_mtime, reverse=True)
        for old in files[max_files:]:
            try:
                old.unlink()
            except Exception:
                # best-effort cleanup
                pass
    except Exception:
        # best-effort cleanup
        pass


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

    # Keep uploads directory bounded
    _trim_upload_dir()

    return file_path
