"""Appointment booking, inspection, and cancellation tools for LangChain."""

from typing import Any, Dict, Optional
from langchain_core.tools import tool
from docappoint_ai_agent.core.database import db_manager
from docappoint_ai_agent.core.logging import logger


@tool
def book_appointment(
    doctor_id: str,
    slot_date: str,
    slot_time: str,
    patient_name: Optional[str] = "Patient",
    patient_email: Optional[str] = "patient@docappoint.com",
    patient_phone: Optional[str] = "9999999999",
    user_id: Optional[str] = "guest_patient_001",
) -> Dict[str, Any]:
    """
    Book a clinical consultation appointment with a chosen doctor.

    Args:
        doctor_id: The ID of the doctor (e.g. from search_doctors).
        slot_date: Date string formatted as 'DD_MM_YYYY' or 'D_M_YYYY' (e.g., '18_11_2026').
        slot_time: Chosen time slot (e.g., '10:00 AM', '02:30 PM').
        patient_name: Full name of the patient.
        patient_email: Contact email address of the patient.
        patient_phone: Contact phone number of the patient.
        user_id: Optional user identifier.

    Returns:
        Structured confirmation with appointment ID, doctor details, date, time, and fee.
    """
    logger.info(
        f"Tool book_appointment called: doctor_id={doctor_id}, date={slot_date}, time={slot_time}, patient={patient_name}"
    )

    clean_date = slot_date.replace("-", "_").replace("/", "_").strip()

    user_data = {
        "_id": user_id or "guest_patient_001",
        "name": patient_name or "Patient",
        "email": patient_email or "patient@docappoint.com",
        "phone": patient_phone or "9999999999",
    }

    try:
        booking = db_manager.book_appointment_sync(
            user_id=user_id or "guest_patient_001",
            doc_id=doctor_id,
            slot_date=clean_date,
            slot_time=slot_time,
            user_data=user_data,
        )
        return {
            "success": True,
            "status": "CONFIRMED",
            "appointmentId": booking["_id"],
            "doctorName": booking["docData"].get("name"),
            "speciality": booking["docData"].get("speciality"),
            "slotDate": clean_date,
            "slotTime": slot_time,
            "amount": booking.get("amount", 500),
            "patientName": patient_name,
            "message": f"Appointment successfully confirmed with {booking['docData'].get('name')} on {clean_date} at {slot_time}.",
        }
    except ValueError as ve:
        logger.warning(f"Booking validation error: {ve}")
        return {
            "success": False,
            "status": "FAILED",
            "error": str(ve),
            "message": f"Could not book appointment: {ve}",
        }
    except Exception as e:
        logger.error(f"Database error during booking: {e}")
        return {
            "success": False,
            "status": "FAILED",
            "error": str(e),
            "message": f"Could not complete appointment booking: {e}",
        }


@tool
def list_user_appointments(user_id: str = "guest_patient_001") -> Dict[str, Any]:
    """
    Retrieve all booked appointments for the current patient.

    Args:
        user_id: The ID of the patient.

    Returns:
        List of scheduled and past appointments.
    """
    logger.info(f"Tool list_user_appointments called for user_id={user_id}")
    try:
        appointments = db_manager.list_user_appointments_sync(user_id)
        if appointments:
            return {
                "success": True,
                "count": len(appointments),
                "appointments": [
                    {
                        "appointmentId": a["_id"],
                        "doctorName": a.get("docData", {}).get("name", "Doctor"),
                        "speciality": a.get("docData", {}).get("speciality", "General"),
                        "slotDate": a.get("slotDate"),
                        "slotTime": a.get("slotTime"),
                        "amount": a.get("amount"),
                        "cancelled": a.get("cancelled", False),
                        "payment": a.get("payment", False),
                    }
                    for a in appointments
                ],
            }
    except Exception as e:
        logger.warning(f"Error fetching user appointments: {e}")

    return {
        "success": True,
        "count": 0,
        "appointments": [],
        "message": "No appointments found for this account.",
    }


@tool
def cancel_appointment(appointment_id: str, user_id: str = "guest_patient_001") -> Dict[str, Any]:
    """
    Cancel an existing appointment and release the doctor's calendar slot.

    Args:
        appointment_id: The appointment ID to cancel.
        user_id: The ID of the patient owning the appointment.

    Returns:
        Cancellation confirmation status.
    """
    logger.info(f"Tool cancel_appointment called: id={appointment_id}, user={user_id}")
    try:
        res = db_manager.cancel_appointment_sync(appointment_id=appointment_id, user_id=user_id)
        return res
    except Exception as e:
        logger.error(f"Cancellation error: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Unable to cancel appointment {appointment_id}: {e}",
            "appointmentId": appointment_id,
        }
