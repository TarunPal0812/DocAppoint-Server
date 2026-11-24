"""Unit tests for LangGraph StateGraph workflow execution."""

import pytest
from langchain_core.messages import HumanMessage
from docappoint_ai_agent.agent.graph import agent_graph


def test_graph_emergency_interception():
    input_state = {
        "messages": [HumanMessage(content="I have unbearable crushing chest pain and feel dizzy")],
        "session_id": "test_emergency_session",
    }
    config = {"configurable": {"thread_id": "test_emergency_session"}}

    result = agent_graph.invoke(input_state, config=config)

    assert result["is_emergency"] is True
    assert result["is_blocked"] is True
    last_msg = result["messages"][-1]
    assert "URGENT MEDICAL ALERT" in str(last_msg.content)


def test_graph_out_of_domain_interception():
    input_state = {
        "messages": [HumanMessage(content="Explain python object oriented programming inheritance")],
        "session_id": "test_ood_session",
    }
    config = {"configurable": {"thread_id": "test_ood_session"}}

    result = agent_graph.invoke(input_state, config=config)

    assert result["is_blocked"] is True
    last_msg = result["messages"][-1]
    assert "DocAppoint Health Assistant" in str(last_msg.content)
