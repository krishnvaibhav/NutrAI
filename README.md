# Smart Inventory API

An AI-powered grocery inventory tracker built with FastAPI, SQLite, and Gemini AI.

## Features
- Track pantry items (name, quantity, unit, expiry date).
- Nutrition logging (calories, protein, carbs, fat).
- Gemini AI integration for smart queries.

## Setup

1. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and add your Gemini API key:
   ```bash
   cp .env.example .env
   ```

3. **Run the Application:**
   ```bash
   uvicorn main:app --reload
   ```

## API Endpoints

- `GET /health`: Health check.
- `GET /pantry`: List all pantry items.
- `POST /pantry`: Add a new item.
- `PUT /pantry/{id}`: Update an item.
- `DELETE /pantry/{id}`: Remove an item.
- `POST /ask-gemini`: Send a prompt to Gemini 1.5 Pro.

## Database
The application uses SQLite (`grocery.db`) by default. Tables are created automatically on startup.
