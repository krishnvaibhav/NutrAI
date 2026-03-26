"""
Integration tests for the pantry endpoints.
Uses FastAPI dependency_overrides to mock Firestore and auth.
"""
import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone
from fastapi.testclient import TestClient


MOCK_USER = {"uid": "test-uid-123", "email": "test@example.com"}
AUTH_HEADER = {"Authorization": "Bearer fake-token"}


@pytest.fixture(scope="module")
def app():
    with patch("firebase_admin_setup.init_firebase"), \
         patch("firebase_admin.auth.verify_id_token", return_value=MOCK_USER):
        import sys
        for mod in list(sys.modules.keys()):
            if mod.startswith(("routers.", "main", "dependencies", "firestore_db", "limiter")):
                sys.modules.pop(mod, None)
        from main import app as _app
        return _app


@pytest.fixture
def db():
    return MagicMock()


@pytest.fixture
def client(app, db):
    from firestore_db import get_firestore
    from dependencies import get_current_user
    app.dependency_overrides[get_firestore] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: MOCK_USER
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


def _make_doc(id_, data):
    doc = MagicMock()
    doc.id = id_
    doc.exists = True
    doc.to_dict.return_value = data
    return doc


class TestGetPantry:
    def test_returns_empty_list(self, client, db):
        db.collection().document().collection().limit().offset().stream.return_value = iter([])
        resp = client.get("/pantry", headers=AUTH_HEADER)
        assert resp.status_code == 200
        assert resp.json() == []

    def test_returns_items(self, client, db):
        item_data = {
            "name": "Milk", "quantity": 2.0, "unit": "liters",
            "expiry_date": "2026-06-01",
            "date_added": datetime.now(timezone.utc).isoformat(),
        }
        db.collection().document().collection().limit().offset().stream.return_value = iter([
            _make_doc("abc123", item_data)
        ])
        resp = client.get("/pantry", headers=AUTH_HEADER)
        assert resp.status_code == 200
        items = resp.json()
        assert len(items) == 1
        assert items[0]["name"] == "Milk"
        assert items[0]["id"] == "abc123"

    def test_requires_auth(self, app):
        from firestore_db import get_firestore
        app.dependency_overrides = {get_firestore: lambda: MagicMock()}
        with TestClient(app, raise_server_exceptions=False) as c:
            resp = c.get("/pantry")
        app.dependency_overrides.clear()
        assert resp.status_code in (401, 403)  # unauthenticated


class TestCreatePantryItem:
    def test_creates_item(self, client, db):
        doc_ref = MagicMock()
        doc_ref.id = "new-doc-id"
        db.collection().document().collection().add.return_value = (None, doc_ref)
        resp = client.post("/pantry", json={"name": "Eggs", "quantity": 12, "unit": "count"}, headers=AUTH_HEADER)
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Eggs"
        assert data["id"] == "new-doc-id"

    def test_rejects_missing_fields(self, client):
        resp = client.post("/pantry", json={"name": "Eggs"}, headers=AUTH_HEADER)
        assert resp.status_code == 422


class TestDeletePantryItem:
    def test_deletes_existing(self, client, db):
        ref = MagicMock()
        ref.get.return_value.exists = True
        db.collection().document().collection().document.return_value = ref
        resp = client.delete("/pantry/abc123", headers=AUTH_HEADER)
        assert resp.status_code == 204

    def test_404_for_missing(self, client, db):
        ref = MagicMock()
        ref.get.return_value.exists = False
        db.collection().document().collection().document.return_value = ref
        resp = client.delete("/pantry/nonexistent", headers=AUTH_HEADER)
        assert resp.status_code == 404
