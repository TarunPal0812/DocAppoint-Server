"""LangGraph StateGraph workflow for DocAppointment AI Agent."""

from typing import Any, Dict, List, Literal, Optional
from langchain_core.messages import AIMessage, AnyMessage, HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode

from docappoint_ai_agent.agent.guardrails import evaluate_input_guardrails
from docappoint_ai_agent.agent.prompts import SYSTEM_PROMPT
from docappoint_ai_agent.agent.state import AgentState
from docappoint_ai_agent.agent.tools import ALL_TOOLS
from docappoint_ai_agent.config import settings
from docappoint_ai_agent.core.logging import logger


def get_llm():
    """Initializes the Groq LLM with tools bound."""
    api_key = settings.GROQ_API_KEY
    if not api_key:
        logger.warning("GROQ_API_KEY is not configured in environment variables.")
        return None

    model_name = settings.GROQ_MODEL or "openai/gpt-oss-120b"

    try:
        model = ChatGroq(
            model=model_name,
            groq_api_key=api_key,  # type: ignore
            temperature=settings.GROQ_TEMPERATURE,
            max_retries=settings.GROQ_MAX_RETRIES,
        )
        return model.bind_tools(ALL_TOOLS)
    except Exception as e:
        logger.error(f"Failed to initialize ChatGroq: {e}")
        return None


def guardrail_node(state: AgentState) -> Dict[str, Any]:
    """
    Evaluates safety guardrails before invoking the LLM:
    1. Checks for urgent life-threatening emergencies.
    2. Checks for out-of-domain topics (e.g. coding, finance, trivia).
    """
    messages = state.get("messages", [])
    if not messages:
        return {}

    last_msg = messages[-1]
    user_content = last_msg.content if isinstance(last_msg, HumanMessage) else ""

    if not isinstance(user_content, str):
        user_content = str(user_content)

    eval_result = evaluate_input_guardrails(user_content)

    if eval_result["blocked"]:
        logger.info(f"Guardrail triggered: {eval_result['category']}")
        response_msg = AIMessage(content=eval_result["response"])
        return {
            "messages": [response_msg],
            "is_blocked": True,
            "is_emergency": eval_result["category"] == "emergency",
            "block_reason": eval_result["category"],
        }

    return {"is_blocked": False}


def route_after_guardrail(state: AgentState) -> str:
    """Routes execution based on guardrail checks."""
    if state.get("is_blocked", False):
        return END
    return "agent_node"


def agent_node(state: AgentState) -> Dict[str, Any]:
    """Invokes the Groq LLM with system prompts and tools."""
    llm = get_llm()

    messages = state.get("messages", [])
    user_id = state.get("user_id")
    user_name = state.get("user_name")
    user_email = state.get("user_email")

    # Build system instructions
    patient_context = (
        f"\n\n### Current User Context:\n"
        f"- Patient ID: {user_id or 'Not logged in (Guest)'}\n"
        f"- Patient Name: {user_name or 'Patient'}\n"
        f"- Patient Email: {user_email or 'patient@docappoint.com'}\n"
        f"If the patient is not logged in and wants to book, you can still proceed with their name or use their guest ID."
    )
    sys_message = SystemMessage(content=SYSTEM_PROMPT + patient_context)

    # Filter messages to ensure SystemMessage is first
    filtered_messages: List[AnyMessage] = [sys_message]
    for msg in messages:
        if not isinstance(msg, SystemMessage):
            filtered_messages.append(msg)

    if llm is None:
        logger.error("Groq LLM is not available.")
        return {
            "messages": [
                AIMessage(
                    content="The AI clinical assistant is currently unable to reach the Groq language model. Please verify your connection and Groq API key configuration."
                )
            ]
        }

    try:
        response = llm.invoke(filtered_messages)
        return {"messages": [response]}
    except Exception as e:
        logger.error(f"Error invoking Groq LLM: {e}")
        fallback_msg = AIMessage(
            content=f"I encountered a temporary service error while processing your request: {e}. Please try again."
        )
        return {"messages": [fallback_msg]}


def route_after_agent(state: AgentState) -> str:
    """Determines whether the agent needs to call tools or finish."""
    messages = state.get("messages", [])
    if not messages:
        return END

    last_message = messages[-1]
    if hasattr(last_message, "tool_calls") and last_message.tool_calls: # type: ignore
        logger.info(f"Agent requested {len(last_message.tool_calls)} tool call(s)") # type: ignore
        return "tools_node"

    return END


# Build the StateGraph
def build_agent_graph():
    """Constructs and compiles the LangGraph StateGraph with checkpointing."""
    workflow = StateGraph(AgentState)

    # Add Nodes
    workflow.add_node("guardrail_node", guardrail_node)
    workflow.add_node("agent_node", agent_node)
    workflow.add_node("tools_node", ToolNode(ALL_TOOLS))

    # Add Edges
    workflow.add_edge(START, "guardrail_node")
    workflow.add_conditional_edges("guardrail_node", route_after_guardrail)
    workflow.add_conditional_edges("agent_node", route_after_agent)

    # After tools run, feed output back to agent node to synthesize response
    workflow.add_edge("tools_node", "agent_node")

    # In-memory checkpointer for multi-turn conversational persistence
    checkpointer = MemorySaver()
    app = workflow.compile(checkpointer=checkpointer)
    return app


# Singleton graph instance
agent_graph = build_agent_graph()
