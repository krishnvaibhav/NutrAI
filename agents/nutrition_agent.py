import logging
from typing import List, Dict, Any

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from gemini_client import API_KEY
from .utils import clean_json_response, generate_with_fallback

logger = logging.getLogger(__name__)

_MAX_RETRIES = 3


def analyze_meal(meal_description: str) -> Dict[str, Any]:
    """
    Analyzes a natural language meal description and estimates macros and calories.
    Retries up to _MAX_RETRIES times if the model returns invalid JSON.
    """
    if not API_KEY:
        raise ValueError("Gemini API key is not configured.")

    prompt = f"""
    Analyze the following meal description and estimate its nutritional content.
    Meal: "{meal_description}"

    Provide a reasonable estimate for:
    - "meal_name": A short title for the meal
    - "calories": Estimated calories (integer)
    - "protein": Estimated protein in grams (integer)
    - "carbs": Estimated carbohydrates in grams (integer)
    - "fat": Estimated fat in grams (integer)

    CRITICAL:
    1. Do NOT include any "Thinking" or "Reasoning" steps or <think> blocks in your response.
    2. Return ONLY a valid JSON object with exactly these 5 keys. No extra text, no markdown.

    Example: {{"meal_name": "Grilled Chicken Salad", "calories": 420, "protein": 38, "carbs": 18, "fat": 22}}
    """

    last_error: Exception | None = None

    for attempt in range(1, _MAX_RETRIES + 1):
        response = None
        try:
            response = generate_with_fallback(prompt)

            if not response.parts:
                raise ValueError("Model returned an empty response.")

            text_response = response.text.strip()
            if not text_response:
                raise ValueError("Model returned blank text.")

            result = clean_json_response(text_response)

            if not isinstance(result, dict):
                raise ValueError(f"Expected a JSON object, got: {type(result).__name__}")

            return result

        except ValueError:
            raise
        except Exception as e:
            raw_preview = response.text[:200] if response is not None else ""

            if "429" in str(e) or "ResourceExhausted" in str(e):
                raise ValueError("The AI is currently busy. Please wait a moment and try again.")

            logger.warning(
                "Nutrition agent attempt %d/%d failed: %s | raw: %r",
                attempt, _MAX_RETRIES, e, raw_preview,
            )
            last_error = e

    logger.error("Nutrition agent failed after %d attempts. Last error: %s", _MAX_RETRIES, last_error)
    raise ValueError(
        "The AI could not analyse the meal after several attempts. Please try again."
    )


def generate_health_summary(logs: List[Dict[str, Any]]) -> str:
    """
    Generates a brief health summary and recommendations based on recent nutrition logs.
    """
    if not API_KEY:
        raise ValueError("Gemini API key is not configured.")

    if not logs:
        return "No nutrition logs found. Start logging your meals to get insights!"

    logs_context = "\n".join([
        f"- {log['date']}: {log['meal_name']} "
        f"({log['calories']} kcal, {log['protein']}g protein, "
        f"{log['carbs']}g carbs, {log['fat']}g fat)"
        for log in logs
    ])

    prompt = f"""
    You are an expert nutritionist AI. Analyze the user's recent meal logs:
    {logs_context}

    Provide a short, encouraging summary of their eating habits. Point out any trends
    (e.g., high protein, low carb, very high calorie) and give 1-2 actionable tips
    for their next meal based on common dietary goals (balance macros, moderate calories).
    Keep it brief and conversational. Do not use JSON. Do not use <think> blocks.
    """

    try:
        response = generate_with_fallback(prompt)
        return response.text.strip()
    except Exception as e:
        if "429" in str(e) or "ResourceExhausted" in str(e):
            return "The AI is currently busy generating your summary. Please refresh in a moment!"
        logger.error("Health summary failed: %s", e)
        raise
