"""Pytest fixtures and test environment setup."""

import pytest
from fastapi.testclient import TestClient
from docappoint_ai_agent.main import app
from docappoint_ai_agent.core.security import create_mock_user_token

TEST_DOCTORS = [
    {
        "_id": "67053e1a0000000000000001",
        "name": "Dr. Aanya Sharma",
        "speciality": "General physician",
        "degree": "MBBS, MD",
        "experience": "4 Years",
        "fees": 500,
        "available": True,
        "about": "Dedicated general physician.",
        "address": {"line1": "27, MG Road", "line2": "New Delhi"},
        "slots_booked": {},
    },
    {
        "_id": "67053e1a0000000000000002",
        "name": "Dr. Priya Nair",
        "speciality": "Dermatologist",
        "degree": "MBBS, MD",
        "experience": "1 Year",
        "fees": 450,
        "available": True,
        "about": "Specialist in skin health.",
        "address": {"line1": "8, Brigade Road", "line2": "Bangalore"},
        "slots_booked": {},
    },
]


@pytest.fixture(autouse=True)
def mock_backend_data_layer(monkeypatch):
    """Ensures offline test suite execution without external network dependence."""
    from docappoint_ai_agent.core.database import db_manager

    original_search = db_manager.search_doctors_sync
    original_get_by_id = db_manager.get_doctor_by_id_sync

    def test_search(speciality=None, query_text=None, max_fees=None, available_only=True):
        res = original_search(speciality, query_text, max_fees, available_only)
        if res:
            return res
        filtered = list(TEST_DOCTORS)
        if speciality:
            filtered = [d for d in filtered if d["speciality"].lower() == speciality.lower()]
        if max_fees is not None:
            filtered = [d for d in filtered if d["fees"] <= max_fees]
        return filtered

    def test_get_by_id(doc_id):
        res = original_get_by_id(doc_id)
        if res:
            return res
        for d in TEST_DOCTORS:
            if d["_id"] == doc_id:
                return dict(d)
        return None

    monkeypatch.setattr(db_manager, "search_doctors_sync", test_search)
    monkeypatch.setattr(db_manager, "get_doctor_by_id_sync", test_get_by_id)


@pytest.fixture
def mock_token() -> str:
    """Provides a valid test JWT token for patient."""
    return create_mock_user_token(user_id="66f43e5c9b83b1234567890a")


@pytest.fixture
def test_client():
    """Provides standard FastAPI TestClient with automatic lifespan handling."""
    with TestClient(app) as client:
        yield client
