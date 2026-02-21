from sqlalchemy import Column, Integer, String, Float, Date, DateTime
from sqlalchemy.sql import func
from database import Base

class PantryItem(Base):
    __tablename__ = "pantry"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    quantity = Column(Float)
    unit = Column(String)
    expiry_date = Column(Date, nullable=True)
    date_added = Column(DateTime(timezone=True), server_default=func.now())

class NutritionLog(Base):
    __tablename__ = "nutrition_log"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, server_default=func.current_date())
    meal_name = Column(String)
    calories = Column(Float)
    protein = Column(Float)
    carbs = Column(Float)
    fat = Column(Float)
