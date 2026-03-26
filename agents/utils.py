import json
import logging
import re
from typing import Any

import google.generativeai as genai

logger = logging.getLogger(__name__)

# Primary model for all text agents; fallback used when rate limited
_PRIMARY_MODEL = "gemini-2.5-flash"
_FALLBACK_MODEL = "models/gemma-3-12b-it"

# Vision needs a multimodal fallback (Gemma doesn't support images)
_VISION_PRIMARY = "gemini-2.5-flash"
_VISION_FALLBACK = "gemini-2.0-flash"


def _is_rate_limited(exc: Exception) -> bool:
    msg = str(exc)
    return "429" in msg or "ResourceExhausted" in msg or "quota" in msg.lower()


def _should_fallback(exc: Exception) -> bool:
    """True for any primary-model failure that the fallback model might succeed on."""
    msg = str(exc).lower()
    return (
        _is_rate_limited(exc)
        or "timeout" in msg
        or "deadline" in msg
        or "503" in msg
        or "unavailable" in msg
    )


def generate_with_fallback(prompt_or_content: Any) -> Any:
    """
    Calls generate_content with _PRIMARY_MODEL (gemini-2.5-flash).
    Falls back to _FALLBACK_MODEL (gemma-3-12b-it) on rate limits, timeouts,
    or service unavailability.
    """
    for model_name in (_PRIMARY_MODEL, _FALLBACK_MODEL):
        try:
            model = genai.GenerativeModel(model_name)
            return model.generate_content(
                prompt_or_content,
                request_options={"timeout": 45},
            )
        except Exception as e:
            if _should_fallback(e) and model_name == _PRIMARY_MODEL:
                logger.warning(
                    "Primary model %s failed (%s) — falling back to %s",
                    _PRIMARY_MODEL, type(e).__name__, _FALLBACK_MODEL,
                )
                continue
            raise
    raise RuntimeError("All models failed. Please try again later.")


def generate_vision_with_fallback(parts: list) -> Any:
    """
    Vision-capable fallback: gemini-2.5-flash → gemini-2.0-flash.
    Gemma models don't support image input so a separate chain is used.
    """
    for model_name in (_VISION_PRIMARY, _VISION_FALLBACK):
        try:
            model = genai.GenerativeModel(model_name)
            return model.generate_content(
                parts,
                request_options={"timeout": 45},
            )
        except Exception as e:
            if _should_fallback(e) and model_name == _VISION_PRIMARY:
                logger.warning(
                    "Primary vision model %s failed (%s) — falling back to %s",
                    _VISION_PRIMARY, type(e).__name__, _VISION_FALLBACK,
                )
                continue
            raise
    raise RuntimeError("All vision models failed. Please try again later.")


def clean_json_response(text: str) -> Any:
    """
    Extracts and parses JSON from a response string that might contain
    Gemma <think> blocks or markdown code fences.
    """
    text = text.strip()

    # Strip Gemma reasoning blocks before attempting extraction
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()
    text = re.sub(r'<thinking>.*?</thinking>', '', text, flags=re.DOTALL).strip()

    # Try markdown code blocks first (```json ... ``` or ``` ... ```)
    matches = re.findall(r'```(?:json)?\s*(.*?)\s*```', text, re.DOTALL)
    if matches:
        json_str = matches[-1].strip()
    else:
        json_str = _extract_first_json(text)

    return json.loads(json_str)


def _extract_first_json(text: str) -> str:
    """
    Bracket-counting extractor: finds the first complete JSON object or array.
    Starts from whichever of '{' or '[' appears first in the text, so that
    bare arrays like '[{"name":"Milk"}]' are not incorrectly reduced to the
    inner object.
    """
    brace_idx = text.find('{')
    bracket_idx = text.find('[')

    if brace_idx == -1 and bracket_idx == -1:
        return text  # no JSON found — let json.loads raise

    if brace_idx == -1:
        pairs = [('[', ']')]
    elif bracket_idx == -1:
        pairs = [('{', '}')]
    elif bracket_idx < brace_idx:
        pairs = [('[', ']'), ('{', '}')]
    else:
        pairs = [('{', '}'), ('[', ']')]

    for start_char, end_char in pairs:
        idx = text.find(start_char)
        if idx == -1:
            continue
        depth = 0
        in_string = False
        escape_next = False
        for i, ch in enumerate(text[idx:], start=idx):
            if escape_next:
                escape_next = False
                continue
            if ch == '\\' and in_string:
                escape_next = True
                continue
            if ch == '"' and not escape_next:
                in_string = not in_string
                continue
            if in_string:
                continue
            if ch == start_char:
                depth += 1
            elif ch == end_char:
                depth -= 1
                if depth == 0:
                    return text[idx:i + 1]
    return text
