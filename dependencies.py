from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from firebase_admin import auth as firebase_auth

from firestore_db import get_firestore

security = HTTPBearer()


def get_current_user(creds=Depends(security)) -> dict:
    try:
        return firebase_auth.verify_id_token(creds.credentials)
    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(401, "Token expired")
    except Exception as e:
        msg = str(e)
        if "default Firebase app does not exist" in msg or "not initialized" in msg.lower():
            raise HTTPException(503, "Firebase Admin not initialized — check backend .env and restart")
        print(f"[auth] verify_id_token failed: {msg}")
        raise HTTPException(401, "Invalid token")


def get_user_tier(user_id: str, db) -> str:
    doc = db.collection("users").document(user_id).collection("subscription").document("data").get()
    return doc.to_dict().get("tier", "free") if doc.exists else "free"


def require_pro(user=Depends(get_current_user), db=Depends(get_firestore)):
    if get_user_tier(user["uid"], db) != "pro":
        raise HTTPException(
            403,
            "This feature requires a Pro subscription. Upgrade on the Account page.",
        )
    return user
