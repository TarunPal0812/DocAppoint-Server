"""Unit tests for safety and domain guardrails."""

import pytest
from docappoint_ai_agent.agent.guardrails import (
    check_emergency,
    check_out_of_domain,
    evaluate_input_guardrails,
)


def test_emergency_chest_pain_detected():
    is_emergency, msg = check_emergency("I am having severe chest pain radiating to my left arm")
    assert is_emergency is True
    assert "URGENT MEDICAL ALERT" in msg
    assert "112, 911, or 108" in msg


def test_emergency_breathing_difficulty():
    is_emergency, msg = check_emergency("My father cannot breathe and is gasping for air")
    assert is_emergency is True
    assert "Emergency Room" in msg


def test_normal_symptoms_not_flagged_emergency():
    is_emergency, msg = check_emergency("I have a mild runny nose and sneezing since yesterday")
    assert is_emergency is False
    assert msg is None


def test_out_of_domain_coding():
    is_ood, msg = check_out_of_domain("Can you write a python script to parse csv files?")
    assert is_ood is True
    assert "DocAppoint Health Assistant" in msg


def test_out_of_domain_finance():
    is_ood, msg = check_out_of_domain("Should I invest in bitcoin and stock market?")
    assert is_ood is True


def test_medical_query_with_programming_word():
    # If the user says "doctor" or "pain", medical whitelist applies
    is_ood, msg = check_out_of_domain("I am a coding engineer and I have acute wrist pain, need a doctor")
    assert is_ood is False
    assert msg is None


def test_evaluate_input_guardrails_clean():
    res = evaluate_input_guardrails("I need to see a dermatologist for a skin rash on my neck")
    assert res["blocked"] is False
    assert res["category"] == "clean"
