import os
import stripe
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Header, Request

from firestore_db import get_firestore
from dependencies import get_current_user
import schemas

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

    if event["type"] == "checkout.session.completed":
        uid = event["data"]["object"]["metadata"].get("user_id")
        if uid:
            db.collection("users").document(uid).collection("subscription").document("data").set({
                "tier": "pro",
                "stripe_customer_id": event["data"]["object"].get("customer"),
                "stripe_subscription_id": event["data"]["object"].get("subscription"),
                "updated_at": datetime.now(timezone.utc),
            }, merge=True)

    elif event["type"] in ("customer.subscription.deleted", "customer.subscription.paused"):
        sid = event["data"]["object"]["id"]
        for user_doc in db.collection("users").stream():
            sub_ref = db.collection("users").document(user_doc.id).collection("subscription").document("data")
            sub = sub_ref.get()
            if sub.exists and sub.to_dict().get("stripe_subscription_id") == sid:
                sub_ref.update({"tier": "free"})
                break

    return {"status": "ok"}
