import json
import re
from typing import Any

def clean_json_response(text: str) -> Any:
    """
    Extracts and parses JSON from a response string that might contain markdown blocks.
    """
    text = text.strip()
    
    # 1. Look for markdown code blocks
    # Note: Using non-greedy match for first block
    match = re.search(r'```(?:json)?\s*(.*?)\s*```', text, re.DOTALL)
    if match:
        json_str = match.group(1).strip()
    else:
        # 2. No code blocks, but maybe there is content before/after the JSON
        # This regex tries to find the outermost matching braces/brackets
        json_match = re.search(r'(\{.*\}|\[.*\])', text, re.DOTALL)
        if json_match:
            json_str = json_match.group(1).strip()
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
