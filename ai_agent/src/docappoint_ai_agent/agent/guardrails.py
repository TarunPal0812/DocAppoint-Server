"""Safety guardrails for medical triage and domain confinement."""

import re
from typing import Any, Dict, Optional, Tuple

EMERGENCY_KEYWORDS = [
    r"\bchest\s+pain\b",
    r"\bheart\s+attack\b",
    r"\bshortness\s+of\s+breath\b",
    r"\b(can'?t|cannot)\s+breathe\b",
    r"\bgasping\s+for\s+air\b",
    r"\bdifficulty\s+breathing\b",
    r"\bsevere\s+bleeding\b",
    r"\bunconscious\b",
    r"\bpassed\s+out\b",
    r"\bstroke\b",
    r"\bslurred\s+speech\b",
    r"\bfacial\s+droop\b",
    r"\bsuicid",
    r"\bkill\s+myself\b",
    r"\boverdose\b",
    r"\bpoison",
    r"\banaphylax",
    r"\bchoking\b",
    r"\bseizure\b",
]

OUT_OF_DOMAIN_KEYWORDS = [
    r"\bpython\b",
    r"\bjavascript\b",
    r"\breact\b",
    r"\bcoding\b",
    r"\bcode\b",
    r"\bprogramming\b",
    r"\bbitcoin\b",
    r"\bcrypto\b",
    r"\bstock\s+market\b",
    r"\bweather\b",
    r"\bmovie\b",
    r"\bhomework\b",
    r"\bfootball\b",
    r"\bcricket\b",
    r"\bprime\s+minister\b",
    r"\bpresident\b",
    r"\bcapital\s+of\b",
    r"\brecipe\b",
]

MEDICAL_WHITELIST_KEYWORDS = [
    r"\bdoctor\b",
    r"\bappointment\b",
    r"\bhealth\b",
    r"\bpain\b",
    r"\bfever\b",
    r"\bcough\b",
    r"\bheadache\b",
    r"\bstomach\b",
    r"\bskin\b",
    r"\brash\b",
    r"\bsymptom\b",
    r"\bmedicine\b",
    r"\bhospital\b",
    r"\bclinic\b",
    r"\bfees\b",
    r"\bbook\b",
    r"\bslot\b",
    r"\bcancel\b",
]


def check_emergency(text: str) -> Tuple[bool, Optional[str]]:
    """Checks if the user input indicates a life-threatening medical emergency."""
    text_lower = text.lower()
    for pattern in EMERGENCY_KEYWORDS:
        if re.search(pattern, text_lower):
            message = (
                "**URGENT MEDICAL ALERT**: Your symptoms may indicate a critical or life-threatening condition.\n\n"
                "Please **do not wait for an online appointment**. Immediately call your local emergency services "
                "(e.g., **112, 911, or 108**) or proceed to the nearest hospital Emergency Room (ER) right away.\n\n"
                "If someone is with you, ask them to assist you immediately."
            )
            return True, message
    return False, None


def check_out_of_domain(text: str) -> Tuple[bool, Optional[str]]:
    """
    Checks if the user is asking about topics outside healthcare, medicine, or appointment booking.
    """
    text_lower = text.lower()

    # If it clearly contains medical keywords, do not block
    has_medical = any(re.search(pat, text_lower) for pat in MEDICAL_WHITELIST_KEYWORDS)
    if has_medical:
        return False, None

    for pattern in OUT_OF_DOMAIN_KEYWORDS:
        if re.search(pattern, text_lower):
            message = (
                "I am **DocAppoint Health Assistant**, dedicated exclusively to patient healthcare triage, "
                "symptom guidance, finding verified doctors, and booking appointments.\n\n"
                "I cannot assist with queries outside healthcare (such as general knowledge, coding, or finance). "
                "How can I assist you with your health or doctor appointments today?"
            )
            return True, message

    return False, None


def evaluate_input_guardrails(text: str) -> Dict[str, Any]:
    """Runs all guardrails and returns status."""
    is_emergency, emergency_msg = check_emergency(text)
    if is_emergency:
        return {"blocked": True, "category": "emergency", "response": emergency_msg}

    is_ood, ood_msg = check_out_of_domain(text)
    if is_ood:
        return {"blocked": True, "category": "out_of_domain", "response": ood_msg}

    return {"blocked": False, "category": "clean", "response": None}
