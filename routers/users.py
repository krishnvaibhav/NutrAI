import logging
import os
import secrets
from fastapi import APIRouter, Depends, Header, HTTPException, status
from firebase_admin import auth as firebase_auth
from pydantic import BaseModel

from firestore_db import get_firestore
from dependencies import get_current_user

logger = logging.getLogger(__name__)

ADMIN_SECRET = os.getenv("ADMIN_SECRET", "")


def _verify_admin(x_admin_secret: str = Header(...)):
    if not ADMIN_SECRET or not secrets.compare_digest(x_admin_secret, ADMIN_SECRET):
        raise HTTPException(status_code=403, detail="Forbidden")


class AdminGrantRequest(BaseModel):
    email: str

router = APIRouter(tags=["users"])


def _delete_collection(col_ref, batch_size: int = 100):
    """Iteratively delete all documents in a Firestore collection in batches."""
    while True:
        docs = list(col_ref.limit(batch_size).stream())
        if not docs:
            break
        for doc in docs:
            doc.reference.delete()


@router.delete("/users/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(db=Depends(get_firestore), user=Depends(get_current_user)):
    """
    Permanently delete the authenticated user's account and all associated data.
    Complies with GDPR/CCPA right-to-erasure requirements.
    """
    uid = user["uid"]

    # Delete Firebase Auth account FIRST — if this fails, Firestore data is still intact
    # and the user can retry. Orphaned Firestore data is recoverable; orphaned Auth is not.
    firebase_auth.delete_user(uid)

    # Now delete Firestore data
    user_ref = db.collection("users").document(uid)
    for subcol in ("pantry", "nutrition_logs", "subscription", "usage"):
        _delete_collection(user_ref.collection(subcol))
    user_ref.delete()

    logger.info("Account deleted for user %s", uid)
    return None


@router.post("/admin/grant-pro", status_code=status.HTTP_200_OK, dependencies=[Depends(_verify_admin)])
def admin_grant_pro(body: AdminGrantRequest, db=Depends(get_firestore)):
    """Manually grant Pro tier to a user by email (admin only)."""
    try:
        firebase_user = firebase_auth.get_user_by_email(body.email)
    except firebase_auth.UserNotFoundError:
        raise HTTPException(status_code=404, detail=f"No Firebase user found for {body.email}")

    uid = firebase_user.uid
    db.collection("users").document(uid).collection("subscription").document("data").set(
        {"tier": "pro", "granted_manually": True}, merge=True
    )
    logger.info("Admin manually granted Pro to %s (uid=%s)", body.email, uid)
    return {"message": f"Pro granted to {body.email}", "uid": uid}


@router.post("/admin/revoke-pro", status_code=status.HTTP_200_OK, dependencies=[Depends(_verify_admin)])
def admin_revoke_pro(body: AdminGrantRequest, db=Depends(get_firestore)):
    """Revoke Pro tier from a user by email (admin only)."""
    try:
        firebase_user = firebase_auth.get_user_by_email(body.email)
    except firebase_auth.UserNotFoundError:
        raise HTTPException(status_code=404, detail=f"No Firebase user found for {body.email}")

    uid = firebase_user.uid
    db.collection("users").document(uid).collection("subscription").document("data").set(
        {"tier": "free", "granted_manually": False}, merge=True
    )
    logger.info("Admin revoked Pro from %s (uid=%s)", body.email, uid)
    return {"message": f"Pro revoked from {body.email}", "uid": uid}
