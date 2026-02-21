import json
import google.generativeai as genai
from typing import List, Dict, Any

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from gemini_client import API_KEY
from .utils import clean_json_response

def parse_fridge_image(image_bytes: bytes, mime_type: str) -> List[Dict[str, Any]]:
    """
    Sends an image of a fridge or receipt to Gemini Vision to extract grocery items.
    Returns a list of dictionaries with name, quantity, and unit.
    """
    if not API_KEY:
        raise ValueError("Gemini API key is not configured.")

    model = genai.GenerativeModel("models/gemini-flash-latest")
    
    prompt = """
    Analyze this image of groceries (either from a fridge/pantry or a receipt).
    Identify all the distinct food items visible.
    For each item, estimate the quantity and provide an appropriate unit (e.g., "count", "kg", "liters", "grams").
    If the image is a receipt, extract the exact items and quantities.
    
    Return the output ONLY as a valid JSON array of objects. 
    Each object must have strictly these exactly three keys:
    - "name" (string)
    - "quantity" (float)
    - "unit" (string)
    
    Example output format:
    [
      {"name": "Milk", "quantity": 1.0, "unit": "liters"},
      {"name": "Eggs", "quantity": 12.0, "unit": "count"},
      {"name": "Apples", "quantity": 0.5, "unit": "kg"}
    ]
    Do not include markdown code block formatting like ```json in your response, just the raw JSON.
    """
    
    image_part = {
        "mime_type": mime_type,
        "data": image_bytes
    }
    
    try:
        response = model.generate_content([prompt, image_part])
        text_response = response.text.strip()
        return clean_json_response(text_response)
    except Exception as e:
        if "429" in str(e) or "ResourceExhausted" in str(e):
            raise ValueError("The Vision AI is currently busy. Please wait a moment and try again.")
        print(f"Vision agent error: {str(e)}")
        raise ValueError("Gemini did not return valid JSON.") from e
