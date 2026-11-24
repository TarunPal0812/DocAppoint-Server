"""LangGraph Agent State definition using standard TypedDict."""

from typing import Annotated, Any, Dict, List, Optional, TypedDict
from langchain_core.messages import AnyMessage
from langgraph.graph.message import add_messages


class AgentState(TypedDict, total=False):
    """Represents the complete conversational and clinical context of the agent."""

    messages: Annotated[List[AnyMessage], add_messages]
    user_id: Optional[str]
    user_name: Optional[str]
    user_email: Optional[str]
    session_id: Optional[str]
    is_emergency: bool
    is_blocked: bool
    block_reason: Optional[str]
    triage_data: Optional[Dict[str, Any]]
