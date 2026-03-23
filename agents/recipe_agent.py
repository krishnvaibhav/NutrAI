import json
import google.generativeai as genai
from typing import List, Dict, Any

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from gemini_client import API_KEY
from .utils import clean_json_response

def suggest_recipes(pantry_items: List[Dict[str, Any]], preferences: str = "", time_of_day: str = "") -> List[Dict[str, Any]]:
    """
    Sends the user's pantry items to Gemini to get suggested recipes.
    Returns a list of recipes with explanations.
    """
    if not API_KEY:
        raise ValueError("Gemini API key is not configured.")

    model = genai.GenerativeModel("models/gemma-3-27b-it")

    pantry_context = "\n".join([f"- {item['name']}: {item['quantity']} {item['unit']}" for item in pantry_items])
    if not pantry_context:
        pantry_context = "No items in pantry."

    prompt = f"""
    You are an expert culinary AI aimed at reducing food waste for a solo-living adult.
    Based on the following available ingredients in the user's pantry:
    {pantry_context}

    User dietary preferences/restrictions: {preferences}
    Current time of day / meal type requested: {time_of_day}

    Suggest up to 3 recipes that prioritize using the ingredients currently available.

    CRITICAL RULES — YOU MUST FOLLOW ALL OF THESE:
    1. Do NOT include any "Thinking", "Reasoning", or <think> blocks outside of the JSON.
    2. Return ONLY a valid JSON array. No markdown fences, no extra text before or after.
    3. Every instruction step MUST include exact numeric measurements (e.g. "Add 2 tbsp olive oil", "Cook for 5 minutes on medium heat"). Vague steps like "add some oil" are NOT acceptable.
    4. "servings" and "cost_per_dish" are REQUIRED — never omit them or set them to null.

    Each object MUST have exactly these fields:
    - "name": Recipe name (string)
    - "reasoning": Why this recipe suits the available pantry items (string)
    - "missing_ingredients": Extra ingredients needed beyond pantry (JSON array of strings — empty array [] if nothing is missing)
    - "instructions": Step-by-step cooking instructions, MINIMUM 5 steps, each step MUST state exact quantities and times (JSON array of strings)
    - "estimated_calories": Total kcal for the whole dish (integer)
    - "estimated_protein": Total protein in grams for the whole dish (integer)
    - "servings": Number of servings this recipe makes (integer, e.g. 2)
    - "cost_per_dish": Estimated total ingredient cost in AUD (float, e.g. 7.50)

    Example of correct format:
    [
      {{
        "name": "Scrambled Eggs on Toast",
        "reasoning": "Uses eggs and bread from pantry, minimal cost",
        "missing_ingredients": ["butter"],
        "instructions": [
          "Step 1: Crack 3 large eggs into a bowl and whisk with 2 tbsp milk and a pinch of salt.",
          "Step 2: Heat a non-stick pan over medium-low heat and melt 1 tbsp butter.",
          "Step 3: Pour in the egg mixture and stir gently with a spatula for 3-4 minutes.",
          "Step 4: Remove from heat just before eggs are fully set — residual heat will finish cooking.",
          "Step 5: Toast 2 slices of bread and serve the eggs on top."
        ],
        "estimated_calories": 350,
        "estimated_protein": 22,
        "servings": 1,
        "cost_per_dish": 2.80
      }}
    ]
    """

    try:
        response = model.generate_content(prompt)
        text_response = response.text.strip()
        return clean_json_response(text_response)
    except Exception as e:
        if "429" in str(e) or "ResourceExhausted" in str(e):
            raise ValueError("The Recipe AI is currently busy. Please wait a moment and try again.")
        if e is None or str(e) == "None":
            raise ValueError("Gemini returned an empty response.")
        print(f"Recipe agent error: {str(e)}")
        raise ValueError("Gemini did not return valid JSON.") from e
