import io
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status, UploadFile, File
from typing import List
from PIL import Image

from firestore_db import get_firestore
from dependencies import get_current_user, require_pro
import schemas
from agents import vision_agent
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(tags=["pantry"])

MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB


def _doc_to_pantry(doc) -> dict:
    d = doc.to_dict()
    d["id"] = doc.id
    return d


@router.get("/pantry", response_model=List[schemas.PantryItem])
def get_pantry(
    db=Depends(get_firestore),
    user=Depends(get_current_user),
    limit: int = Query(200, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    uid = user["uid"]
    docs = db.collection("users").document(uid).collection("pantry").limit(limit).offset(offset).stream()
    return [_doc_to_pantry(doc) for doc in docs]


@router.post("/pantry", response_model=schemas.PantryItem, status_code=status.HTTP_201_CREATED)
def create_pantry_item(item: schemas.PantryItemCreate, db=Depends(get_firestore), user=Depends(get_current_user)):
    uid = user["uid"]
    data = item.model_dump()
    data["date_added"] = datetime.now(timezone.utc)
    if data.get("expiry_date") is not None:
        data["expiry_date"] = str(data["expiry_date"])
    _, doc_ref = db.collection("users").document(uid).collection("pantry").add(data)
    return {**data, "id": doc_ref.id}


@router.put("/pantry/{item_id}", response_model=schemas.PantryItem)
def update_pantry_item(item_id: str, item_update: schemas.PantryItemUpdate, db=Depends(get_firestore), user=Depends(get_current_user)):
    uid = user["uid"]
    ref = db.collection("users").document(uid).collection("pantry").document(item_id)
    doc = ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Item not found")
    update_data = item_update.model_dump(exclude_unset=True)
    if "expiry_date" in update_data and update_data["expiry_date"] is not None:
        update_data["expiry_date"] = str(update_data["expiry_date"])
    ref.update(update_data)
    updated = doc.to_dict()
    updated.update(update_data)
    updated["id"] = item_id
    return updated


@router.delete("/pantry/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pantry_item(item_id: str, db=Depends(get_firestore), user=Depends(get_current_user)):
    uid = user["uid"]
    ref = db.collection("users").document(uid).collection("pantry").document(item_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Item not found")
    ref.delete()
    return None


@router.post("/agents/vision/scan", response_model=List[schemas.PantryItemBase])
@limiter.limit("5/minute")
async def scan_receipt_or_fridge(
    request: Request,  # noqa: ARG001 — required by slowapi for rate limiting
    file: UploadFile = File(...),
    user=Depends(require_pro),
):
    """Pro-only: scan fridge/receipt image and return identified items."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")

    image_bytes = await file.read()
    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image must be smaller than 10 MB.")

    # Compress large images to reduce API latency
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.thumbnail((1024, 1024))
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=85)
        image_bytes = buf.getvalue()
    except Exception:
        pass  # use original bytes if PIL fails

    try:
        items = vision_agent.parse_fridge_image(image_bytes, "image/jpeg")
        return items
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception:
        logger.exception("Vision scan failed for user %s", user["uid"])
        raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again.")
