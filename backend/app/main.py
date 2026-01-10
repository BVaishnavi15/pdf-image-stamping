from fastapi import FastAPI
from app.routes.pdf import router as pdf_router

app = FastAPI(
    title="PDF Signature Stamper",
    version="1.0.0"
)

app.include_router(pdf_router)


@app.get("/")
def health_check():
    return {"status": "ok"}
