import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials

load_dotenv()
private_key = os.getenv('FIREBASE_PRIVATE_KEY', '')

private_key = private_key.replace('\\n', '\n')
private_key = private_key.strip().strip('"').strip("'").strip()

try:
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
    print("Certificate loaded successfully!")
    firebase_admin.initialize_app(cred)
    print("App initialized successfully!")
except Exception as e:
    import traceback
    traceback.print_exc()
