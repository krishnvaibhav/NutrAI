from firebase_admin import firestore


def get_firestore():
    return firestore.client()
