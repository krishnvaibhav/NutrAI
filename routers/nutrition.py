from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from firestore_db import get_firestore
from dependencies import get_current_user
import schemas
from agents import nutrition_agent

router = APIRouter(tags=["nutrition"])


def _doc_to_log(doc) -> dict:
    d = doc.to_dict()
    d["id"] = doc.id
    return d


@router.get("/nutrition", response_model=List[schemas.NutritionLog])
def get_nutrition_logs(db=Depends(get_firestore), user=Depends(get_current_user)):
    uid = user["uid"]
    docs = db.collection("users").document(uid).collection("nutrition_logs").stream()
    return [_doc_to_log(doc) for doc in docs]


@router.post("/nutrition", response_model=schemas.NutritionLog, status_code=status.HTTP_201_CREATED)
def create_nutrition_log(log: schemas.NutritionLogCreate, db=Depends(get_firestore), user=Depends(get_current_user)):
    uid = user["uid"]
    data = log.model_dump()
    if data.get("date") is None:
        data["date"] = str(date.today())
    else:
        data["date"] = str(data["date"])
    _, doc_ref = db.collection("users").document(uid).collection("nutrition_logs").add(data)
    return {**data, "id": doc_ref.id}


@router.get("/nutrition/{log_id}", response_model=schemas.NutritionLog)
def get_nutrition_log(log_id: str, db=Depends(get_firestore), user=Depends(get_current_user)):
    uid = user["uid"]
    doc = db.collection("users").document(uid).collection("nutrition_logs").document(log_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Log not found")
    return _doc_to_log(doc)


@router.delete("/nutrition/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_nutrition_log(log_id: str, db=Depends(get_firestore), user=Depends(get_current_user)):
    uid = user["uid"]
    ref = db.collection("users").document(uid).collection("nutrition_logs").document(log_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Log not found")
    ref.delete()
    return None


@router.post("/agents/nutrition/analyze", response_model=schemas.NutritionLog)
def analyze_and_log_meal(request: schemas.NutritionAnalysisRequest, db=Depends(get_firestore), user=Depends(get_current_user)):
    """Analyze natural language meal description and log nutrition."""
    uid = user["uid"]
    try:
        nutrition_data = nutrition_agent.analyze_meal(request.meal_description)
        data = {
            "meal_name": nutrition_data.get("meal_name", "Unknown Meal"),
            "calories": nutrition_data.get("calories", 0),
            "protein": nutrition_data.get("protein", 0),
            "carbs": nutrition_data.get("carbs", 0),
            "fat": nutrition_data.get("fat", 0),
            "date": str(date.today()),
        }
        _, doc_ref = db.collection("users").document(uid).collection("nutrition_logs").add(data)
        return {**data, "id": doc_ref.id}
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@router.get("/agents/nutrition/summary", response_model=schemas.NutritionSummaryResponse)
def get_nutrition_summary(db=Depends(get_firestore), user=Depends(get_current_user)):
    uid = user["uid"]
    docs = db.collection("users").document(uid).collection("nutrition_logs").stream()
    logs_list = []
    for doc in docs:
        d = doc.to_dict()
        logs_list.append({
            "date": str(d.get("date", "")),
            "meal_name": d.get("meal_name", ""),
            "calories": d.get("calories", 0),
            "protein": d.get("protein", 0),
            "carbs": d.get("carbs", 0),
            "fat": d.get("fat", 0),
        })
    try:
        summary_text = nutrition_agent.generate_health_summary(logs_list)
        return {"summary": summary_text}
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
