"""Clinical triage tools for symptom assessment and specialty mapping."""

from typing import Any, Dict, List, Optional
from langchain_core.tools import tool
from docappoint_ai_agent.core.logging import logger

SPECIALTY_MAPPING = {
    "dermatologist": ["skin", "rash", "acne", "pimple", "itch", "eczema", "psoriasis", "mole", "hair fall", "dandruff"],
    "gynecologist": ["period", "menstrual", "pregnancy", "pregnant", "ovary", "pcos", "pcod", "pelvic", "vaginal", "contraception"],
    "pediatricians": ["child", "baby", "infant", "toddler", "kid", "newborn", "vaccination", "pediatric"],
    "neurologist": ["migraine", "headache", "seizure", "numbness", "tingling", "nerve", "dizziness", "epilepsy", "tremor"],
    "gastroenterologist": ["stomach", "gastric", "acidity", "reflux", "gerd", "diarrhea", "constipation", "vomiting", "nausea", "abdomen", "liver"],
    "general physician": ["fever", "cough", "cold", "flu", "sore throat", "fatigue", "weakness", "body pain", "infection", "checkup"],
}


@tool
def assess_symptoms(
    symptoms: str,
    duration_days: Optional[int] = None,
    severity_1_to_10: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Perform a structured clinical triage assessment on patient symptoms to determine
    the recommended medical specialty and safe supportive care guidance.

    Args:
        symptoms: Description of the patient's complaints or symptoms.
        duration_days: How many days the patient has experienced these symptoms.
        severity_1_to_10: Patient-reported severity on a scale from 1 (mild) to 10 (unbearable).

    Returns:
        A clinical triage summary with recommended specialty, severity level, and care guidance.
    """
    logger.info(f"Tool assess_symptoms called: symptoms='{symptoms}', duration={duration_days}, severity={severity_1_to_10}")

    symptoms_lower = symptoms.lower()
    matched_specialty = "General physician"

    for specialty, keywords in SPECIALTY_MAPPING.items():
        if any(kw in symptoms_lower for kw in keywords):
            # Format properly capitalized
            if specialty == "general physician":
                matched_specialty = "General physician"
            elif specialty == "gynecologist":
                matched_specialty = "Gynecologist"
            elif specialty == "dermatologist":
                matched_specialty = "Dermatologist"
            elif specialty == "pediatricians":
                matched_specialty = "Pediatricians"
            elif specialty == "neurologist":
                matched_specialty = "Neurologist"
            elif specialty == "gastroenterologist":
                matched_specialty = "Gastroenterologist"
            break

    # Determine triage level
    if severity_1_to_10 and severity_1_to_10 >= 8:
        urgency = "HIGH - Urgent Doctor Consultation Recommended"
    elif (duration_days and duration_days > 7) or (severity_1_to_10 and severity_1_to_10 >= 5):
        urgency = "MODERATE - In-Person Clinical Assessment Advised"
    else:
        urgency = "MILD - Supportive Self-Care & Doctor Consultation"

    home_care_tips = [
        "Stay well hydrated with clean water and electrolytes if dehydrated.",
        "Ensure adequate physical rest and monitor your body temperature.",
        "Avoid self-medicating with unprescribed strong pharmaceuticals.",
    ]

    return {
        "symptoms": symptoms,
        "recommendedSpecialty": matched_specialty,
        "urgencyLevel": urgency,
        "durationDays": duration_days,
        "severityReported": severity_1_to_10,
        "supportiveCareTips": home_care_tips,
        "disclaimer": "This is an AI triage recommendation. For formal diagnosis and treatment, please consult a verified doctor.",
    }


@tool
def get_available_specialties() -> List[str]:
    """
    Get the list of all doctor medical specialties currently available for consultations
    at DocAppointment.

    Returns:
        A list of clinical specialties.
    """
    return [
        "General physician",
        "Gynecologist",
        "Dermatologist",
        "Pediatricians",
        "Neurologist",
        "Gastroenterologist",
    ]
