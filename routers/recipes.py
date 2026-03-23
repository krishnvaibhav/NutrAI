from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from google.cloud.firestore_v1 import Increment
from typing import List

from firestore_db import get_firestore
from dependencies import get_current_user, get_user_tier
import schemas
from agents import recipe_agent

router = APIRouter(tags=["recipes"])

FREE_DAILY_LIMIT = 3


@router.post("/agents/recipe/suggest", response_model=List[schemas.RecipeResponse])
def suggest_recipes_endpoint(
    request: schemas.RecipeRequest,
    db=Depends(get_firestore),
    user=Depends(get_current_user),
):
    uid = user["uid"]

    if get_user_tier(uid, db) == "free":
        today_str = str(date.today())
        usage_ref = db.collection("users").document(uid).collection("usage").document(today_str)
        usage_doc = usage_ref.get()
        count = (usage_doc.to_dict() or {}).get("recipe_suggest", 0) if usage_doc.exists else 0
        if count >= FREE_DAILY_LIMIT:
            raise HTTPException(
                403,
                f"Free tier: {FREE_DAILY_LIMIT} recipe suggestions per day. Upgrade to Pro for unlimited.",
            )
        usage_ref.set({"recipe_suggest": Increment(1)}, merge=True)

    docs = db.collection("users").document(uid).collection("pantry").stream()
    items_list = [
        {"name": d.get("name"), "quantity": d.get("quantity"), "unit": d.get("unit")}
        for doc in docs
        for d in [doc.to_dict()]
    ]

    try:
        recipes = recipe_agent.suggest_recipes(items_list, request.preferences, request.time_of_day)
        return recipes
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
