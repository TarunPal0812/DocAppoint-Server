"""Unit tests for agent tools."""

import pytest
from docappoint_ai_agent.agent.tools.doctor_tools import (
    get_doctor_availability,
    search_doctors,
)
from docappoint_ai_agent.agent.tools.appointment_tools import (
    book_appointment,
    cancel_appointment,
    list_user_appointments,
)
from docappoint_ai_agent.agent.tools.triage_tools import (
    assess_symptoms,
    get_available_specialties,
)


def test_search_doctors_by_speciality():
    docs = search_doctors.invoke({"speciality": "Dermatologist"})
    assert isinstance(docs, list)
    assert len(docs) > 0
    assert any(d["speciality"].lower() == "dermatologist" for d in docs)


def test_search_doctors_by_budget():
    docs = search_doctors.invoke({"max_fees": 500})
    assert isinstance(docs, list)
    assert all(d["fees"] <= 500 for d in docs)


def test_get_doctor_availability():
    res = get_doctor_availability.invoke({
        "doctor_id": "67053e1a0000000000000001",
        "slot_date": "18_11_2026",
    })
    assert res["success"] is True
    assert "availableSlots" in res
    assert len(res["availableSlots"]) > 0


def test_book_appointment_tool():
    res = book_appointment.invoke({
        "doctor_id": "67053e1a0000000000000001",
        "slot_date": "18_11_2026",
        "slot_time": "10:00 AM",
        "patient_name": "John Doe",
        "patient_email": "john@example.com",
    })
    assert res["success"] is True
    assert "appointmentId" in res
    assert res["slotTime"] == "10:00 AM"


def test_assess_symptoms_triage():
    res = assess_symptoms.invoke({
        "symptoms": "Severe itchy red rash and dry peeling skin on my elbows",
        "duration_days": 4,
        "severity_1_to_10": 6,
    })
    assert res["recommendedSpecialty"] == "Dermatologist"
    assert "MODERATE" in res["urgencyLevel"]
    assert len(res["supportiveCareTips"]) > 0


def test_get_available_specialties():
    specs = get_available_specialties.invoke({})
    assert "General physician" in specs
    assert "Gynecologist" in specs
    assert "Dermatologist" in specs
    assert "Neurologist" in specs
