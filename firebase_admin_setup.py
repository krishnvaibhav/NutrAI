import os
import firebase_admin
from firebase_admin import credentials

_initialized = False

def init_firebase():
    global _initialized
    if _initialized:
        return

    private_key = os.getenv("FIREBASE_PRIVATE_KEY", "")
    # Strip outer whitespace and quotes first
    private_key = private_key.strip().strip('"').strip("'").strip()
    # Replace literal \n sequences with real newlines (handles both dotenv-expanded and unexpanded)
    if "\\n" in private_key:
        private_key = private_key.replace("\\n", "\n")
    print(f"[firebase] key starts: {repr(private_key[:40])}")
    print(f"[firebase] key ends:   {repr(private_key[-40:])}")

    client_email = (os.getenv("FIREBASE_CLIENT_EMAIL") or "").strip().strip('"').strip("'")

    cred = credentials.Certificate({
        "type": "service_account",
        "project_id": os.getenv("FIREBASE_PROJECT_ID", "").strip().strip('"').strip("'"),
        "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID", "dummy"),
        "private_key": private_key,
        "client_email": client_email,
        "client_id": os.getenv("FIREBASE_CLIENT_ID", ""),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{client_email}",
    })
    firebase_admin.initialize_app(cred)
    _initialized = True
