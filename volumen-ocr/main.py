from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import PlainTextResponse
from rapidocr_onnxruntime import RapidOCR
from PIL import Image
import numpy as np
import io

app = FastAPI(title="Volumen OCR Service")
engine = RapidOCR()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ocr", response_class=PlainTextResponse)
async def run_ocr(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()

    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image_np = np.array(image)
        result, _ = engine(image_np)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")

    if not result:
        return ""

    text = " ".join([line[1] for line in result])
    text = "".join(ch if ch.isalnum() or ch.isspace() else " " for ch in text)
    return text.strip()