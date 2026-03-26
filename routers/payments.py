import os
import logging
import stripe
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Header, Request

from firestore_db import get_firestore
from dependencies import get_current_user
import schemas

logger = logging.getLogger(__name__)

router = APIRouter(tags=["payments"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
PRO_PRICE_ID = os.getenv("STRIPE_PRO_PRICE_ID", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


@router.get("/payments/subscription", response_model=schemas.UserSubscriptionResponse)
def get_subscription(user=Depends(get_current_user), db=Depends(get_firestore)):
    uid = user["uid"]
    doc = db.collection("users").document(uid).collection("subscription").document("data").get()
    tier = doc.to_dict().get("tier", "free") if doc.exists else "free"
    return schemas.UserSubscriptionResponse(user_id=uid, tier=tier)


@router.post("/payments/waitlist", status_code=200)
def join_waitlist(user=Depends(get_current_user), db=Depends(get_firestore)):
    """Save user to Pro waitlist (used during coming-soon phase)."""
    uid = user["uid"]
    email = user.get("email", "")
    db.collection("waitlist").document(uid).set({
        "email": email,
        "uid": uid,
        "joined_at": datetime.now(timezone.utc),
    }, merge=True)
    logger.info("User %s joined Pro waitlist", uid)
    return {"status": "ok"}


@router.post("/payments/checkout", response_model=schemas.StripeCheckoutResponse)
def create_checkout(user=Depends(get_current_user)):
    if not stripe.api_key:
        raise HTTPException(500, "Stripe is not configured.")
    if not PRO_PRICE_ID:
        raise HTTPException(500, "Stripe price ID is not configured.")
    uid = user["uid"]
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{"price": PRO_PRICE_ID, "quantity": 1}],
            success_url=f"{FRONTEND_URL}/account?upgraded=true",
            cancel_url=f"{FRONTEND_URL}/account",
            metadata={"user_id": uid},
        )
        return schemas.StripeCheckoutResponse(checkout_url=session.url)
    except stripe.StripeError as e:
        raise HTTPException(500, f"Stripe error: {str(e)}")


@router.post("/payments/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(alias="stripe-signature"),
    db=Depends(get_firestore),
):
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(payload, stripe_signature, WEBHOOK_SECRET)
    except stripe.SignatureVerificationError:
        raise HTTPException(400, "Invalid Stripe signature")

    event_id = event.get("id", "")

    # Idempotency: skip if this event was already processed
    if event_id:
        event_ref = db.collection("processed_webhook_events").document(event_id)
        if event_ref.get().exists:
            logger.info("Duplicate webhook event %s — skipping", event_id)
            return {"status": "ok"}
        event_ref.set({"processed_at": datetime.now(timezone.utc), "type": event["type"]})

    if event["type"] == "checkout.session.completed":
        session_obj = event["data"]["object"]
        uid = session_obj["metadata"].get("user_id")
        sid = session_obj.get("subscription")
        if uid:
            # Update user subscription
            db.collection("users").document(uid).collection("subscription").document("data").set({
                "tier": "pro",
                "stripe_customer_id": session_obj.get("customer"),
                "stripe_subscription_id": sid,
                "updated_at": datetime.now(timezone.utc),
            }, merge=True)
            # Write reverse-lookup so cancellation is O(1)
            if sid:
                db.collection("stripe_subscriptions").document(sid).set({"uid": uid})
            logger.info("User %s upgraded to Pro (subscription %s)", uid, sid)

    elif event["type"] in ("customer.subscription.deleted", "customer.subscription.paused"):
        sid = event["data"]["object"]["id"]
        # O(1) lookup instead of scanning all users
        lookup = db.collection("stripe_subscriptions").document(sid).get()
        if lookup.exists:
            uid = lookup.to_dict().get("uid")
            if uid:
                db.collection("users").document(uid).collection("subscription").document("data").update(
                    {"tier": "free"}
                )
                db.collection("stripe_subscriptions").document(sid).delete()
                logger.info("User %s downgraded to free (subscription %s cancelled)", uid, sid)
        else:
            logger.warning("Cancellation webhook for unknown subscription %s", sid)

    return {"status": "ok"}
