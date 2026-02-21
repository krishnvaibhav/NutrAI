from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
import models, schemas, database, gemini_client
from database import engine, get_db
from agents import vision_agent, recipe_agent, nutrition_agent, orchestrator_agent

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Inventory API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/pantry", response_model=List[schemas.PantryItem])
def get_pantry(db: Session = Depends(get_db)):
    items = db.query(models.PantryItem).all()
    return items

@app.post("/pantry", response_model=schemas.PantryItem, status_code=status.HTTP_201_CREATED)
def create_pantry_item(item: schemas.PantryItemCreate, db: Session = Depends(get_db)):
    db_item = models.PantryItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.put("/pantry/{item_id}", response_model=schemas.PantryItem)
def update_pantry_item(item_id: int, item_update: schemas.PantryItemUpdate, db: Session = Depends(get_db)):
    db_item = db.query(models.PantryItem).filter(models.PantryItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    update_data = item_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/pantry/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pantry_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.PantryItem).filter(models.PantryItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(db_item)
    db.commit()
    return None

# --- Nutrition Log Endpoints ---

@app.get("/nutrition", response_model=List[schemas.NutritionLog])
def get_nutrition_logs(db: Session = Depends(get_db)):
    logs = db.query(models.NutritionLog).all()
    return logs

@app.post("/nutrition", response_model=schemas.NutritionLog, status_code=status.HTTP_201_CREATED)
def create_nutrition_log(log: schemas.NutritionLogCreate, db: Session = Depends(get_db)):
    db_log = models.NutritionLog(**log.model_dump())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@app.get("/nutrition/{log_id}", response_model=schemas.NutritionLog)
def get_nutrition_log(log_id: int, db: Session = Depends(get_db)):
    db_log = db.query(models.NutritionLog).filter(models.NutritionLog.id == log_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Log not found")
    return db_log

@app.delete("/nutrition/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_nutrition_log(log_id: int, db: Session = Depends(get_db)):
    db_log = db.query(models.NutritionLog).filter(models.NutritionLog.id == log_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Log not found")
    
    db.delete(db_log)
    db.commit()
    return None

# --- Gemini Example Endpoint ---
@app.post("/ask-gemini")
def ask_gemini_endpoint(prompt: str):
    response = gemini_client.ask_gemini(prompt)
    return {"response": response}

# --- Agent Endpoints ---
@app.post("/agents/vision/scan", response_model=List[schemas.PantryItemBase])
async def scan_receipt_or_fridge(file: UploadFile = File(...)):
    """
    Accepts an image upload (JPEG/PNG), passes it to the Vision Agent, 
    and returns the identified items. For safety, this endpoint just returns
    the identified items so the frontend can confirm them before adding to the pantry.
    Or, we could add them directly.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")
    
    try:
        image_bytes = await file.read()
        items = vision_agent.parse_fridge_image(image_bytes, file.content_type)
        return items
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.post("/agents/recipe/suggest", response_model=List[schemas.RecipeResponse])
def suggest_recipes_endpoint(request: schemas.RecipeRequest, db: Session = Depends(get_db)):
    """
    Generates recipe suggestions based on current pantry inventory.
    """
    pantry_items = db.query(models.PantryItem).all()
    # Convert SQLAlchemy objects to dicts
    items_list = [{"name": item.name, "quantity": item.quantity, "unit": item.unit} for item in pantry_items]
    
    try:
        recipes = recipe_agent.suggest_recipes(items_list, request.preferences, request.time_of_day)
        return recipes
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.post("/agents/nutrition/analyze", response_model=schemas.NutritionLog)
def analyze_and_log_meal(request: schemas.NutritionAnalysisRequest, db: Session = Depends(get_db)):
    """
    Analyzes a natural language meal description, estimates nutritional content,
    and saves it as a new NutritionLog in the database.
    """
    try:
        nutrition_data = nutrition_agent.analyze_meal(request.meal_description)
        # Create NutritionLog based on extracted data
        new_log = models.NutritionLog(
            meal_name=nutrition_data.get("meal_name", "Unknown Meal"),
            calories=nutrition_data.get("calories", 0),
            protein=nutrition_data.get("protein", 0),
            carbs=nutrition_data.get("carbs", 0),
            fat=nutrition_data.get("fat", 0)
            # date defaults to current_date
        )
        db.add(new_log)
        db.commit()
        db.refresh(new_log)
        return new_log
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.get("/agents/nutrition/summary", response_model=schemas.NutritionSummaryResponse)
def get_nutrition_summary(db: Session = Depends(get_db)):
    """
    Analyzes all logged meals and generates a personalized health summary.
    """
    # Fetch all logs (could be limited to last 7 days in a real app)
    logs = db.query(models.NutritionLog).all()
    logs_list = [{
        "date": str(log.date),
        "meal_name": log.meal_name,
        "calories": log.calories,
        "protein": log.protein,
        "carbs": log.carbs,
        "fat": log.fat
    } for log in logs]
    
    try:
        summary_text = nutrition_agent.generate_health_summary(logs_list)
        return {"summary": summary_text}
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.post("/agents/chat", response_model=schemas.ChatResponse)
def chat_with_orchestrator(request: schemas.ChatRequest):
    """
    Acts as the main entry point for conversational requests.
    Categorizes intent and returns actionable response data for the frontend to route or display.
    """
    try:
        result = orchestrator_agent.process_chat(request.message)
        return schemas.ChatResponse(
            intent=result.get("intent", "general_chat"),
            response=result.get("response", "I received your message."),
            extracted_data=result.get("extracted_data", "")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Orchestrator error: {str(e)}")
