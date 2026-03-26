"""
Shared fixtures for all tests.
Firebase Admin and Firestore are mocked so tests run without real credentials.
"""
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient


# ── Patch Firebase / Firestore before app is imported ───────────────────────

@pytest.fixture(autouse=True)
def mock_firebase(monkeypatch):
    """Prevent real Firebase initialisation in every test."""
    monkeypatch.setattr("firebase_admin_setup.init_firebase", lambda: None)


@pytest.fixture
def mock_firestore():
    """Return a fresh MagicMock Firestore client."""
    return MagicMock()


@pytest.fixture
def mock_user():
    return {"uid": "test-uid-123", "email": "test@example.com"}


@pytest.fixture
def client(mock_user):
    """TestClient with Firebase auth bypassed."""
    with patch("firebase_admin.auth.verify_id_token", return_value=mock_user):
        with patch("firebase_admin_setup.init_firebase"):
            import importlib, sys
            # Remove cached modules so patches apply cleanly
            for mod in list(sys.modules.keys()):
                if mod.startswith(("routers.", "main", "dependencies", "firestore_db")):
                    sys.modules.pop(mod, None)

            from main import app
            return TestClient(app, raise_server_exceptions=False)
