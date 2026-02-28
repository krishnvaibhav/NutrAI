from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional, List

class PantryItemBase(BaseModel):
    name: str
    quantity: float
    unit: str
    expiry_date: Optional[date] = None

class PantryItemCreate(PantryItemBase):
    pass

class PantryItemUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    expiry_date: Optional[date] = None

class PantryItem(PantryItemBase):
    id: int
    date_added: datetime

    model_config = ConfigDict(from_attributes=True)

class NutritionLogBase(BaseModel):
    meal_name: str
    calories: float
    protein: float
    carbs: float
    fat: float
    date: Optional[date] = None

class NutritionLogCreate(BaseModel):
    meal_name: str
    calories: float
    protein: float
    carbs: float
    fat: float
    date: Optional[date] = None

class NutritionLog(NutritionLogBase):
    id: int
    date: date # Override to require a date type on read

    model_config = ConfigDict(from_attributes=True)

class RecipeRequest(BaseModel):
    preferences: str = ""
    time_of_day: str = ""

class RecipeResponse(BaseModel):
    name: str
    reasoning: str
    missing_ingredients: List[str]
    instructions: List[str]
    estimated_calories: int
    estimated_protein: int

class NutritionAnalysisRequest(BaseModel):
    meal_description: str

class NutritionSummaryResponse(BaseModel):
    summary: str

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    intent: str
    response: str
    extracted_data: str = ""
