"""FastAPI HTTP route and business handler integration tests."""

import pytest
from docappoint_ai_agent.api.routes import (
    chat_endpoint,
    get_chat_history,
    health_check,
    list_doctors_endpoint,
)
from docappoint_ai_agent.api.schemas import ChatMessageRequest
from docappoint_ai_agent.config import settings


def test_health_check_endpoint():
    res = health_check()
    assert res.status in ("healthy", "degraded")
    assert res.version == "0.1.0"
    assert res.groq_model == settings.GROQ_MODEL


def test_list_doctors_endpoint():
    res = list_doctors_endpoint(speciality="Dermatologist")
    assert res["success"] is True
    assert len(res["doctors"]) > 0
    assert any(d["speciality"].lower() == "dermatologist" for d in res["doctors"])


def test_chat_emergency_endpoint():
    req = ChatMessageRequest(
        message="I am having severe chest pain and cannot breathe",
        session_id="test_api_emergency",
    )
    res = chat_endpoint(req=req)
    assert res.is_emergency is True
    assert "URGENT MEDICAL ALERT" in res.response


def test_chat_out_of_domain_endpoint():
    req = ChatMessageRequest(
        message="Can you solve this calculus equation for my homework?",
        session_id="test_api_ood",
    )
    res = chat_endpoint(req=req)
    assert res.is_blocked is True
    assert "DocAppoint Health Assistant" in res.response


def test_chat_with_auth_context():
    req = ChatMessageRequest(
        message="Hello, I have had a mild headache and fever for 2 days",
        session_id="test_api_auth",
    )
    mock_user = {
        "_id": "66f43e5c9b83b1234567890a",
        "name": "John Doe",
        "email": "john@example.com",
    }
    res = chat_endpoint(req=req, current_user=mock_user)
    assert res.session_id == "test_api_auth"
    assert len(res.response) > 0


def test_chat_history_retrieval():
    session_id = "test_history_session_1"
    req = ChatMessageRequest(message="I have skin rashes", session_id=session_id)
    chat_endpoint(req=req)

    history = get_chat_history(session_id=session_id)
    assert history.session_id == session_id
    assert history.message_count > 0
