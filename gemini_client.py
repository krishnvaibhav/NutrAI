import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    print("Warning: GEMINI_API_KEY not found in environment variables.")
else:
    genai.configure(api_key=API_KEY)

def ask_gemini(prompt: str) -> str:
    """
    Sends a prompt to Gemma 3 27B and returns the text response.
    """
    if not API_KEY:
        return "Error: Gemini API key not configured."
    
    try:
        model = genai.GenerativeModel("Gemma-3-27B")
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error communicating with Gemini: {str(e)}"
