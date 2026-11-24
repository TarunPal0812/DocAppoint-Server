"""Doctor search and availability check tools for LangChain / LangGraph."""

from typing import Any, Dict, List, Optional
from langchain_core.tools import tool
from docappoint_ai_agent.core.database import db_manager
from docappoint_ai_agent.core.logging import logger

STANDARD_SLOTS = [
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
]


@tool
def search_doctors(
    speciality: Optional[str] = None,
    query: Optional[str] = None,
    max_fees: Optional[float] = None,
) -> List[Dict[str, Any]]:
    """
    Search for verified doctors in the DocAppointment database.

    Args:
        speciality: Medical specialty, e.g. 'General physician', 'Dermatologist',
                    'Gynecologist', 'Pediatricians', 'Neurologist', 'Gastroenterologist'.
        query: Free-text search matching doctor name or description.
        max_fees: Maximum consultation fee in INR (e.g., 600).

    Returns:
        A list of available doctor profiles matching the search criteria from the database.
    """
    logger.info(f"Tool search_doctors called: speciality={speciality}, query={query}, max_fees={max_fees}")
    try:
        doctors = db_manager.search_doctors_sync(
            speciality=speciality,
            query_text=query,
            max_fees=max_fees,
            available_only=True,
        )
        return [
            {
                "docId": str(d.get("_id", d.get("docId", ""))),
                "name": d.get("name", ""),
                "speciality": d.get("speciality", ""),
                "degree": d.get("degree", "MBBS"),
                "experience": d.get("experience", "1 Year"),
                "fees": d.get("fees", 500),
                "about": d.get("about", ""),
                "address": d.get("address", {}),
            }
            for d in doctors
        ]
    except Exception as e:
        logger.error(f"Error querying database for doctors: {e}")
        return []


@tool
def get_doctor_availability(
    doctor_id: str,
    slot_date: str,
) -> Dict[str, Any]:
    """
    Check available consultation time slots for a specific doctor on a given date.

    Args:
        doctor_id: The ID of the doctor (e.g., from search_doctors).
        slot_date: The date in 'D_M_YYYY' or 'DD_MM_YYYY' format, e.g. '17_11_2026'.

    Returns:
        Doctor information, booked slots, and open available slots for that date from the database.
    """
    logger.info(f"Tool get_doctor_availability called: doctor_id={doctor_id}, slot_date={slot_date}")

    try:
        doctor = db_manager.get_doctor_by_id_sync(doctor_id)
    except Exception as e:
        logger.error(f"Error fetching doctor from database: {e}")
        return {
            "success": False,
            "error": f"Database error fetching doctor '{doctor_id}': {e}",
        }

    if not doctor:
        return {
            "success": False,
            "error": f"Doctor with ID '{doctor_id}' could not be found in the clinic database.",
        }

    booked_slots_dict = doctor.get("slots_booked", {}) or {}
    already_booked = booked_slots_dict.get(slot_date, [])

    open_slots = [slot for slot in STANDARD_SLOTS if slot not in already_booked]

    return {
        "success": True,
        "docId": str(doctor.get("_id", doctor_id)),
        "doctorName": doctor.get("name", "Doctor"),
        "speciality": doctor.get("speciality", "General"),
        "slotDate": slot_date,
        "availableSlots": open_slots,
        "alreadyBookedCount": len(already_booked),
        "fees": doctor.get("fees", 500),
    }
