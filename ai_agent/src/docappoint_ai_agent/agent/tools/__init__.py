"""Agent tools index."""

from docappoint_ai_agent.agent.tools.doctor_tools import (
    search_doctors,
    get_doctor_availability,
)
from docappoint_ai_agent.agent.tools.appointment_tools import (
    book_appointment,
    list_user_appointments,
    cancel_appointment,
)
from docappoint_ai_agent.agent.tools.triage_tools import (
    assess_symptoms,
    get_available_specialties,
)

ALL_TOOLS = [
    search_doctors,
    get_doctor_availability,
    book_appointment,
    list_user_appointments,
    cancel_appointment,
    assess_symptoms,
    get_available_specialties,
]

__all__ = [
    "ALL_TOOLS",
    "search_doctors",
    "get_doctor_availability",
    "book_appointment",
    "list_user_appointments",
    "cancel_appointment",
    "assess_symptoms",
    "get_available_specialties",
]
