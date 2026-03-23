import os
import re as _re
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

import firebase_admin_setup
from routers import pantry, nutrition, recipes, chat, payments

app = FastAPI(title="Smart Inventory API")

ALLOWED_ORIGINS = [
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _cors_headers(request: Request) -> dict:
    origin = request.headers.get("origin", "")
    if origin in ALLOWED_ORIGINS or _re.match(r"http://localhost:\d+$", origin):
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
        }
    return {}


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
        headers=_cors_headers(request),
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers=_cors_headers(request),
    )


@app.on_event("startup")
def startup_event():
    try:
        firebase_admin_setup.init_firebase()
    except Exception as e:
        # Firebase credentials not configured yet — app still runs for local dev
        print(f"[startup] Firebase init skipped: {e}")


@app.get("/health")
def health_check():
    return {"status": "healthy"}


app.include_router(pantry.router)
app.include_router(nutrition.router)
app.include_router(recipes.router)
app.include_router(chat.router)
app.include_router(payments.router)
