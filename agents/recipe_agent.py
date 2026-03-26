import logging
from typing import List, Dict, Any

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from gemini_client import API_KEY
from .utils import clean_json_response, generate_with_fallback

logger = logging.getLogger(__name__)

_PROMPT_TEMPLATE = """
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

_MAX_RETRIES = 3


def suggest_recipes(pantry_items: List[Dict[str, Any]], preferences: str = "", time_of_day: str = "") -> List[Dict[str, Any]]:
    """
    Sends the user's pantry items to Gemini to get suggested recipes.
    Retries up to _MAX_RETRIES times if the model returns invalid JSON.
    """
    if not API_KEY:
        raise ValueError("Gemini API key is not configured.")

    pantry_context = "\n".join(
        [f"- {item['name']}: {item['quantity']} {item['unit']}" for item in pantry_items]
    ) or "No items in pantry."

    prompt = _PROMPT_TEMPLATE.format(
        pantry_context=pantry_context,
        preferences=preferences or "None",
        time_of_day=time_of_day or "Any",
    )

    last_error: Exception | None = None

    for attempt in range(1, _MAX_RETRIES + 1):
        response = None
        try:
            response = generate_with_fallback(prompt)

            # Guard against blocked/empty responses
            if not response.parts:
                raise ValueError("Model returned an empty response (possibly blocked by safety filters).")

            text_response = response.text.strip()
            if not text_response:
                raise ValueError("Model returned blank text.")

            result = clean_json_response(text_response)

            # Validate it's a non-empty list
            if not isinstance(result, list) or len(result) == 0:
                raise ValueError(f"Expected a JSON array, got: {type(result).__name__}")

            return result

        except ValueError:
            raise  # propagate rate-limit / config errors immediately
        except Exception as e:
            raw_preview = response.text[:300] if response is not None else ""

            if "429" in str(e) or "ResourceExhausted" in str(e):
                raise ValueError("The Recipe AI is currently busy. Please wait a moment and try again.")

            logger.warning(
                "Recipe agent attempt %d/%d failed: %s | raw preview: %r",
                attempt, _MAX_RETRIES, e, raw_preview,
            )
            last_error = e

    logger.error("Recipe agent failed after %d attempts. Last error: %s", _MAX_RETRIES, last_error)
    raise ValueError(
        "The AI could not generate a valid recipe response after several attempts. "
        "Please try again in a moment."
    )
