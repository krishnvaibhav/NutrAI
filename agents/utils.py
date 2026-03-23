import json
import re
from typing import Any


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
    More reliable than greedy regex when reasoning text precedes the JSON.
    """
    for start_char, end_char in [('{', '}'), ('[', ']')]:
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
    # Fallback: return as-is and let json.loads raise a clear error
    return text
