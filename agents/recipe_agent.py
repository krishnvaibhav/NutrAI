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
    
    Suggest up to 3 recipes that prioritize using the ingredients currently available, especially those that might expire soon (if applicable).
    You can assume basic staples like oil, salt, and pepper are available.
    
    For each recipe, provide:
    - "name": Recipe name
    - "reasoning": Why this recipe was suggested based on their pantry and goals
    - "missing_ingredients": Any extra ingredients they need to buy
    - "instructions": Brief, step-by-step instructions
    - "estimated_calories": An estimated calorie count (integer)
    - "estimated_protein": Estimated protein in grams (integer)
    
    Return the output ONLY as a valid JSON array of objects conforming to these keys.
    Do not include markdown code block formatting like ```json in your response, just the raw JSON.
    """
    
    try:
        response = model.generate_content(prompt)
        text_response = response.text.strip()
        return clean_json_response(text_response)
    except Exception as e:
        if "429" in str(e) or "ResourceExhausted" in str(e):
            raise ValueError("The Recipe AI is currently busy. Please wait a moment and try again.")
        print(f"Recipe agent error: {str(e)}")
        raise ValueError("Gemini did not return valid JSON.") from e

