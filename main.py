import os
import logging

import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from limiter import limiter

import firebase_admin_setup
from routers import pantry, nutrition, recipes, payments, users

# ── Logging ─────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ── Sentry ───────────────────────────────────────────────────────────────────
SENTRY_DSN = os.getenv("SENTRY_DSN", "")
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        traces_sample_rate=0.2,
        profiles_sample_rate=0.1,
    )
    logger.info("Sentry initialised")

# ── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(title="NutriAI API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ─────────────────────────────────────────────────────────────────────
FRONTEND_URL = os.getenv("FRONTEND_URL", "").strip().rstrip("/")
IS_DEV = os.getenv("ENV", "development") == "development"

ALLOWED_ORIGINS = list(filter(None, [
    FRONTEND_URL,
    "http://localhost:5173" if IS_DEV else None,
    "http://127.0.0.1:5173" if IS_DEV else None,
]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _cors_headers(request: Request) -> dict:
    origin = request.headers.get("origin", "")
    if origin in ALLOWED_ORIGINS:
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
        }
    return {}


# ── Exception handlers ───────────────────────────────────────────────────────
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
        headers=_cors_headers(request),
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception on %s %s", request.method, request.url.path, exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."},
        headers=_cors_headers(request),
    )


# ── Startup ──────────────────────────────────────────────────────────────────
_REQUIRED_ENV = [
    "GEMINI_API_KEY",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_PRIVATE_KEY",
    "FIREBASE_CLIENT_EMAIL",
]

# Stripe vars only required when PRO_ENABLED=true
_STRIPE_ENV = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "STRIPE_PRO_PRICE_ID"]

@app.on_event("startup")
def startup_event():
    missing = [k for k in _REQUIRED_ENV if not os.getenv(k)]
    if missing:
        raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")

    if os.getenv("PRO_ENABLED", "false").lower() == "true":
        missing_stripe = [k for k in _STRIPE_ENV if not os.getenv(k)]
        if missing_stripe:
            raise RuntimeError(f"PRO_ENABLED=true but missing Stripe vars: {', '.join(missing_stripe)}")

    if not IS_DEV and not FRONTEND_URL:
        raise RuntimeError(
            "FRONTEND_URL must be set in production — "
            "CORS will block all browser requests without it."
        )

    firebase_admin_setup.init_firebase()
    logger.info("Firebase Admin initialised")


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/health/deep")
def health_check_deep():
    from firestore_db import get_firestore
    try:
        db = get_firestore()
        db.collection("_health").document("ping").set({"ts": __import__("time").time()})
        return {"status": "healthy", "firestore": "ok"}
    except Exception as e:
        logger.error("Deep health check failed: %s", e)
        return {"status": "degraded", "firestore": str(e)}


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(pantry.router)
app.include_router(nutrition.router)
app.include_router(recipes.router)
app.include_router(payments.router)
app.include_router(users.router)
