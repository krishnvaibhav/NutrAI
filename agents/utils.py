import json
import re
from typing import Any

def clean_json_response(text: str) -> Any:
    """
    Extracts and parses JSON from a response string that might contain markdown blocks.
    """
    text = text.strip()
    
    # 1. Look for markdown code blocks
    matches = re.findall(r'```(?:json)?\s*(.*?)\s*```', text, re.DOTALL)
    if matches:
        # Take the last block as it's usually the intended output after thinking
        json_str = matches[-1].strip()
    else:
        # 2. No code blocks, try to find the last occurrence of a JSON structure
        # This handles cases where thinking text precedes the JSON
        json_match = re.findall(r'(\{.*\}|\[.*\])', text, re.DOTALL)
        if json_match:
            json_str = json_match[-1].strip()
        else:
            json_str = text

    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        # 3. If it still fails, it might be because of minor trailing/leading junk after extraction
        # We can try one more pass of stripping if it looks like it might have junk
        try:
            return json.loads(json_str.strip())
        except:
            raise e
