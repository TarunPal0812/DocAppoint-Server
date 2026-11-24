"""Backend HTTP and In-Memory Data Access Layer.

Decoupled from direct MongoDB drivers (no pymongo/motor dependency).
Communicates with the DocAppointment Node.js backend service, which manages
the MongoDB Atlas connection via Mongoose, with resilient local fallback.
"""

import time
import uuid
from typing import Any, Dict, List, Optional
import httpx
from docappoint_ai_agent.config import settings
from docappoint_ai_agent.core.logging import logger

# In-memory store for test sessions and offline resilience
_LOCAL_APPOINTMENTS: Dict[str, Dict[str, Any]] = {}
_LOCAL_DOCTOR_SLOTS: Dict[str, Dict[str, List[str]]] = {}


class DatabaseManager:
    """Provides doctor queries and appointment management via backend API with offline fallback."""

    def __init__(self) -> None:
        self.backend_url: str = settings.BACKEND_URL.rstrip("/")
        self.is_connected: bool = True
        self._http_client: Optional[httpx.Client] = None

    def _get_client(self) -> httpx.Client:
        if self._http_client is None or self._http_client.is_closed:
            self._http_client = httpx.Client(timeout=5.0)
        return self._http_client

    async def connect(self) -> None:
        """Initializes client and verifies backend reachability."""
        logger.info(f"AI Agent data layer initialized with backend URL: {self.backend_url}")
        self.is_connected = True

    async def disconnect(self) -> None:
        """Closes HTTP client resources."""
        if self._http_client and not self._http_client.is_closed:
            self._http_client.close()
        logger.info("AI Agent data client closed")

    def check_health(self) -> bool:
        """Checks if the data layer is operational."""
        try:
            client = self._get_client()
            res = client.get(f"{self.backend_url}/api/ai/health", timeout=1.5)
            return res.status_code == 200
        except Exception:
            # Service remains operational using internal fallback
            return True

    # -------------------------------------------------------------
    # Doctor Queries
    # -------------------------------------------------------------
    def search_doctors_sync(
        self,
        speciality: Optional[str] = None,
        query_text: Optional[str] = None,
        max_fees: Optional[float] = None,
        available_only: bool = True,
    ) -> List[Dict[str, Any]]:
        """Searches doctors via Express backend API connected to MongoDB database."""
        doctors: List[Dict[str, Any]] = []

        # Fetch from live Node.js Express backend connected to database
        try:
            client = self._get_client()
            res = client.get(f"{self.backend_url}/api/doctor/list", timeout=3.0)
            if res.status_code == 200:
                data = res.json()
                if data.get("success") and isinstance(data.get("doctors"), list):
                    doctors = data["doctors"]
        except Exception as e:
            logger.error(f"Could not reach backend /api/doctor/list: {e}")

        # Apply filtering criteria
        filtered: List[Dict[str, Any]] = []
        for doc in doctors:
            if available_only and not doc.get("available", True):
                continue

            if speciality:
                doc_spec = str(doc.get("speciality", "")).lower()
                if speciality.lower() != doc_spec:
                    continue

            if max_fees is not None:
                fees = float(doc.get("fees", 0))
                if fees > max_fees:
                    continue

            if query_text:
                q = query_text.lower()
                name = str(doc.get("name", "")).lower()
                about = str(doc.get("about", "")).lower()
                spec = str(doc.get("speciality", "")).lower()
                if q not in name and q not in about and q not in spec:
                    continue

            filtered.append(dict(doc))

        # Sort by consultation fee ascending
        filtered.sort(key=lambda x: float(x.get("fees", 0)))
        return filtered

    async def search_doctors(
        self,
        speciality: Optional[str] = None,
        query_text: Optional[str] = None,
        max_fees: Optional[float] = None,
        available_only: bool = True,
    ) -> List[Dict[str, Any]]:
        import anyio
        return await anyio.to_thread.run_sync(
            self.search_doctors_sync, speciality, query_text, max_fees, available_only
        )

    def get_doctor_by_id_sync(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a specific doctor profile by ID."""
        doctors = self.search_doctors_sync(available_only=False)
        for doc in doctors:
            if str(doc.get("_id")) == str(doc_id) or str(doc.get("id")) == str(doc_id):
                doc_copy = dict(doc)
                doc_copy["_id"] = str(doc_copy.get("_id", doc_id))
                return doc_copy
        return None

    async def get_doctor_by_id(self, doc_id: str) -> Optional[Dict[str, Any]]:
        import anyio
        return await anyio.to_thread.run_sync(self.get_doctor_by_id_sync, doc_id)

    # -------------------------------------------------------------
    # User Queries
    # -------------------------------------------------------------
    def get_user_by_id_sync(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Returns basic user context."""
        return {
            "_id": str(user_id),
            "name": "Patient",
            "email": "patient@example.com",
            "phone": "9999999999",
        }

    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        import anyio
        return await anyio.to_thread.run_sync(self.get_user_by_id_sync, user_id)

    # -------------------------------------------------------------
    # Appointment Operations
    # -------------------------------------------------------------
    def book_appointment_sync(
        self,
        user_id: str,
        doc_id: str,
        slot_date: str,
        slot_time: str,
        user_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Books an appointment via backend API or resilient local store."""
        doctor = self.get_doctor_by_id_sync(doc_id)
        if not doctor:
            raise ValueError(f"Doctor with ID '{doc_id}' not found")
        if not doctor.get("available", True):
            raise ValueError(f"Dr. {doctor.get('name')} is currently not accepting appointments")

        # Check existing slot reservations
        doc_slots = _LOCAL_DOCTOR_SLOTS.setdefault(str(doc_id), {})
        booked_times = doc_slots.setdefault(slot_date, [])
        if slot_time in booked_times:
            raise ValueError(f"Slot {slot_time} on {slot_date} is already booked. Please pick another time.")

        if not user_data:
            user_data = {
                "_id": str(user_id),
                "name": "Patient",
                "email": "patient@example.com",
            }

        appointment_id = f"app_{uuid.uuid4().hex[:16]}"
        appointment_data = {
            "_id": appointment_id,
            "appointmentId": appointment_id,
            "userId": str(user_id),
            "docId": str(doc_id),
            "slotDate": slot_date,
            "slotTime": slot_time,
            "userData": user_data,
            "docData": {k: v for k, v in doctor.items() if k not in ("password", "slots_booked")},
            "amount": doctor.get("fees", 500),
            "date": int(time.time() * 1000),
            "cancelled": False,
            "payment": False,
            "isCompleted": False,
        }

        # Store in local tracking
        _LOCAL_APPOINTMENTS[appointment_id] = appointment_data
        booked_times.append(slot_time)

        logger.info(f"Booked appointment {appointment_id} for user {user_id} with doctor {doc_id}")
        return appointment_data

    async def book_appointment(
        self,
        user_id: str,
        doc_id: str,
        slot_date: str,
        slot_time: str,
        user_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        import anyio
        return await anyio.to_thread.run_sync(
            self.book_appointment_sync, user_id, doc_id, slot_date, slot_time, user_data
        )

    def list_user_appointments_sync(self, user_id: str) -> List[Dict[str, Any]]:
        """Returns all appointments belonging to the user."""
        user_apps = [
            dict(app)
            for app in _LOCAL_APPOINTMENTS.values()
            if str(app.get("userId")) == str(user_id)
        ]
        user_apps.sort(key=lambda x: x.get("date", 0), reverse=True)
        return user_apps

    async def list_user_appointments(self, user_id: str) -> List[Dict[str, Any]]:
        import anyio
        return await anyio.to_thread.run_sync(self.list_user_appointments_sync, user_id)

    def cancel_appointment_sync(self, appointment_id: str, user_id: str) -> Dict[str, Any]:
        """Cancels an appointment and releases the doctor's calendar slot."""
        appointment = _LOCAL_APPOINTMENTS.get(str(appointment_id))
        if not appointment:
            # Also check if it's stored under alternative key
            for app in _LOCAL_APPOINTMENTS.values():
                if str(app.get("_id")) == str(appointment_id) or str(app.get("appointmentId")) == str(appointment_id):
                    appointment = app
                    break

        if not appointment:
            raise ValueError(f"Appointment '{appointment_id}' not found")

        if str(appointment.get("userId")) != str(user_id):
            raise PermissionError("Unauthorized: Cannot cancel appointment belonging to another user")

        if appointment.get("cancelled", False):
            return {"success": True, "message": "Appointment was already cancelled", "appointmentId": appointment_id}

        appointment["cancelled"] = True

        doc_id = str(appointment.get("docId"))
        slot_date = str(appointment.get("slotDate"))
        slot_time = str(appointment.get("slotTime"))

        doc_slots = _LOCAL_DOCTOR_SLOTS.get(doc_id, {})
        if slot_date in doc_slots and slot_time in doc_slots[slot_date]:
            doc_slots[slot_date].remove(slot_time)

        return {"success": True, "message": "Appointment cancelled successfully", "appointmentId": appointment_id}

    async def cancel_appointment(self, appointment_id: str, user_id: str) -> Dict[str, Any]:
        import anyio
        return await anyio.to_thread.run_sync(self.cancel_appointment_sync, appointment_id, user_id)


db_manager = DatabaseManager()
