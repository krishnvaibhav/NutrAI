import json
import google.generativeai as genai
from typing import Dict, Any

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from gemini_client import API_KEY
from .utils import clean_json_response

def process_chat(message: str) -> Dict[str, Any]:
    """
    Takes a natural language message and determines the user's intent to route to the correct agent.
    Returns a dict with 'intent' and an optional 'response' or 'extracted_data'.
    """
    if not API_KEY:
        raise ValueError("Gemini API key is not configured.")

    model = genai.GenerativeModel("models/gemma-3-27b-it")    
    
    prompt = f"""
    You are the Orchestrator for a Smart Inventory & Nutrition app.
    The user sent the following message: "{message}"
    
    Determine the primary intent of this message. The intent must be one of:
    - "log_nutrition"
    - "suggest_recipe"
    - "vision_scan"
    - "inventory_query"
    - "general_chat"

    CRITICAL: 
    1. Do NOT include any "Thinking" or "Reasoning" steps in your response text outside of the JSON. 
    2. Return ONLY a valid JSON object.

    JSON Keys:
    - "intent": One of the exact strings above.
    - "extracted_data": If log_nutrition, put food description. If inventory_query, put items. Otherwise, empty string.
    - "response": A friendly, brief text response acknowledging their request.
    """
    
    try:
        response = model.generate_content(prompt)
        text_response = response.text.strip()
        return clean_json_response(text_response)
    except Exception as e:
        if "429" in str(e) or "ResourceExhausted" in str(e):
            return {
                "intent": "general_chat",
                "response": "I'm a bit overwhelmed with requests right now. Please wait a few seconds and try again!",
                "extracted_data": ""
            }
        print(f"Orchestrator error: {str(e)}")
        return {
            "intent": "general_chat",
            "response": "I'm sorry, I'm having trouble connecting to my brain right now.",
            "extracted_data": ""
        }
