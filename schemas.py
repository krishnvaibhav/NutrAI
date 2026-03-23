import re
from pydantic import BaseModel, field_validator
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
    id: str
    date_added: datetime


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
    id: str
    date: date  # Override to require a date type on read


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
    servings: Optional[int] = None
    cost_per_dish: Optional[float] = None

    @field_validator('estimated_calories', 'estimated_protein', mode='before')
    @classmethod
    def coerce_int(cls, v):
        if v is None:
            return 0
        if isinstance(v, (int, float)):
            return int(v)
        if isinstance(v, str):
            cleaned = re.sub(r'[^0-9]', '', v)
            return int(cleaned) if cleaned else 0
        return 0

    @field_validator('servings', mode='before')
    @classmethod
    def coerce_servings(cls, v):
        if v is None:
            return None
        if isinstance(v, (int, float)):
            return int(v)
        if isinstance(v, str):
            cleaned = re.sub(r'[^0-9]', '', v)
            return int(cleaned) if cleaned else None
        return None

    @field_validator('cost_per_dish', mode='before')
    @classmethod
    def coerce_cost(cls, v):
        if v is None:
            return None
        try:
            return float(v)
        except (ValueError, TypeError):
            return None

    @field_validator('missing_ingredients', 'instructions', mode='before')
    @classmethod
    def coerce_list(cls, v):
        if v is None:
            return []
        if isinstance(v, str):
            return [v] if v.strip() else []
        return v

    @field_validator('name', 'reasoning', mode='before')
    @classmethod
    def coerce_str(cls, v):
        if v is None:
            return ""
        return str(v)


class NutritionAnalysisRequest(BaseModel):
    meal_description: str


class NutritionSummaryResponse(BaseModel):
    summary: str


class ChatHistoryMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatHistoryMessage] = []


class ChatResponse(BaseModel):
    intent: str
    response: str
    extracted_data: str = ""


class UserSubscriptionResponse(BaseModel):
    user_id: str
    tier: str


class StripeCheckoutResponse(BaseModel):
    checkout_url: str
