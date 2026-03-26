from firebase_admin import firestore

_client = None


def get_firestore():
    global _client
    if _client is None:
        _client = firestore.client()
    return _client
