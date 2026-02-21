import json
import google.generativeai as genai
from typing import List, Dict, Any

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from gemini_client import API_KEY
from .utils import clean_json_response

def analyze_meal(meal_description: str) -> Dict[str, Any]:
    """
    Analyzes a natural language meal description and estimates macros and calories.
    """
    if not API_KEY:
        raise ValueError("Gemini API key is not configured.")

    model = genai.GenerativeModel("gemma-3-12b-it")
    
    prompt = f"""
    Analyze the following meal description and estimate its nutritional content.
    Meal: "{meal_description}"
    
    Provide a reasonable estimate for:
    - "meal_name": A short title for the meal
    - "calories": Estimated calories (integer)
    - "protein": Estimated protein in grams (integer)
    - "carbs": Estimated carbohydrates in grams (integer)
    - "fat": Estimated fat in grams (integer)
    
    Return the output ONLY as a valid JSON object with exactly these keys.
    Do not include markdown code block formatting like ```json.
    """
    
    try:
        response = model.generate_content(prompt)
        text_response = response.text.strip()
        return clean_json_response(text_response)
    except Exception as e:
        if "429" in str(e) or "ResourceExhausted" in str(e):
            raise ValueError("The AI is currently busy. Please wait a moment and try again.")
        print(f"Nutrition analysis error: {str(e)}")
        raise ValueError("Gemini did not return valid JSON.") from e

def generate_health_summary(logs: List[Dict[str, Any]]) -> str:
    """
    Generates a brief health summary and recommendations based on recent nutrition logs.
    """
    if not API_KEY:
        raise ValueError("Gemini API key is not configured.")

    if not logs:
        return "No nutrition logs found. Start logging your meals to get insights!"

    model = genai.GenerativeModel("models/gemma-3-12b-it")    
    
    logs_context = "\n".join([f"- {log['date']}: {log['meal_name']} ({log['calories']} kcal, {log['protein']}g protein, {log['carbs']}g carbs, {log['fat']}g fat)" for log in logs])
    
    prompt = f"""
    You are an expert nutritionist AI. Analyze the user's recent meal logs:
    {logs_context}
    
    Provide a short, encouraging summary of their eating habits. Point out any trends 
    (e.g., high protein, low carb, very high calorie) and give 1-2 actionable tips 
    for their next meal based on common dietary goals (balance macros, moderate calories).
    Keep it mostly brief and conversational. Do not use JSON.
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        if "429" in str(e) or "ResourceExhausted" in str(e):
            return "The AI is currently busy generating your summary. Please refresh in a moment!"
        raise e
