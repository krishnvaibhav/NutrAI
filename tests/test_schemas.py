"""
Unit tests for Pydantic schemas — no I/O required.
"""
import pytest
from schemas import RecipeResponse, PantryItemBase, NutritionLogCreate


class TestRecipeResponse:
    def test_valid(self):
        r = RecipeResponse(
            name="Pasta",
            reasoning="Quick meal",
            missing_ingredients=["olive oil"],
            instructions=["Boil water", "Cook pasta"],
            estimated_calories=500,
            estimated_protein=20,
            servings=2,
            cost_per_dish=4.50,
        )
        assert r.name == "Pasta"
        assert r.servings == 2

    def test_coerces_string_calories(self):
        r = RecipeResponse(
            name="x", reasoning="x", missing_ingredients=[], instructions=[],
            estimated_calories="~450 kcal", estimated_protein="22g",
        )
        assert r.estimated_calories == 450
        assert r.estimated_protein == 22

    def test_none_calories_becomes_zero(self):
        r = RecipeResponse(
            name="x", reasoning="x", missing_ingredients=[], instructions=[],
            estimated_calories=None, estimated_protein=None,
        )
        assert r.estimated_calories == 0
        assert r.estimated_protein == 0

    def test_none_servings_allowed(self):
        r = RecipeResponse(
            name="x", reasoning="x", missing_ingredients=[], instructions=[],
            estimated_calories=100, estimated_protein=5, servings=None,
        )
        assert r.servings is None

    def test_string_instructions_wrapped_in_list(self):
        r = RecipeResponse(
            name="x", reasoning="x", missing_ingredients=[],
            instructions="Just one step",
            estimated_calories=100, estimated_protein=5,
        )
        assert r.instructions == ["Just one step"]

    def test_none_instructions_becomes_empty_list(self):
        r = RecipeResponse(
            name="x", reasoning="x", missing_ingredients=None,
            instructions=None,
            estimated_calories=100, estimated_protein=5,
        )
        assert r.instructions == []
        assert r.missing_ingredients == []


class TestPantryItemBase:
    def test_valid(self):
        item = PantryItemBase(name="Milk", quantity=2.0, unit="liters")
        assert item.name == "Milk"
        assert item.expiry_date is None

    def test_with_expiry(self):
        from datetime import date
        item = PantryItemBase(name="Yogurt", quantity=1, unit="kg", expiry_date="2026-06-01")
        assert item.expiry_date == date(2026, 6, 1)


class TestNutritionLogCreate:
    def test_valid(self):
        log = NutritionLogCreate(meal_name="Lunch", calories=600, protein=30, carbs=70, fat=15)
        assert log.date is None  # optional

    def test_date_object(self):
        from datetime import date
        d = date(2026, 3, 23)
        log = NutritionLogCreate(meal_name="Dinner", calories=700, protein=40, carbs=80, fat=20, date=d)
        assert log.date == d
