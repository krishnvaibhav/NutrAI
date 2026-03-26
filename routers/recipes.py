import logging
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Request
from google.cloud.firestore_v1 import transactional, Transaction
from typing import List

from firestore_db import get_firestore
from dependencies import get_current_user, get_user_tier
import schemas
from agents import recipe_agent
from limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(tags=["recipes"])

FREE_DAILY_LIMIT = 3


@transactional
def _check_and_increment(transaction: Transaction, usage_ref) -> int:
    """Atomically read + increment the usage counter. Returns new count."""
    snapshot = usage_ref.get(transaction=transaction)
    current = (snapshot.to_dict() or {}).get("recipe_suggest", 0) if snapshot.exists else 0
    transaction.set(usage_ref, {"recipe_suggest": current + 1}, merge=True)
    return current + 1


@router.post("/agents/recipe/suggest", response_model=List[schemas.RecipeResponse])
@limiter.limit("10/minute")
def suggest_recipes_endpoint(
    request: Request,  # noqa: ARG001 — required by slowapi for rate limiting
    body: schemas.RecipeRequest,
    db=Depends(get_firestore),
    user=Depends(get_current_user),
):
    uid = user["uid"]

    if get_user_tier(uid, db) == "free":
        today_str = str(date.today())
        usage_ref = db.collection("users").document(uid).collection("usage").document(today_str)
        new_count = _check_and_increment(db.transaction(), usage_ref)
        if new_count > FREE_DAILY_LIMIT:
            # Already incremented — decrement back to keep count accurate
            from google.cloud.firestore_v1 import Increment as FSIncrement
            usage_ref.update({"recipe_suggest": FSIncrement(-1)})
            raise HTTPException(
                403,
                f"Free tier: {FREE_DAILY_LIMIT} recipe suggestions per day. Upgrade to Pro for unlimited.",
            )

    docs = db.collection("users").document(uid).collection("pantry").stream()
    items_list = [
        {"name": d.get("name"), "quantity": d.get("quantity"), "unit": d.get("unit")}
        for doc in docs
        for d in [doc.to_dict()]
    ]

    try:
        recipes = recipe_agent.suggest_recipes(items_list, body.preferences, body.time_of_day)
        return recipes
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.exception("Recipe suggestion failed for user %s", uid)
        raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again.")
