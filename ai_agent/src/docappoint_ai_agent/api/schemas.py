"""Pydantic schemas for request and response validation."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ChatMessageRequest(BaseModel):
    """Payload sent by the client when communicating with the AI chatbot."""

    message: str = Field(..., min_length=1, max_length=4000, description="Patient message text")
    session_id: Optional[str] = Field(
        default=None,
        description="Unique thread identifier to persist multi-turn conversational context",
    )
    user_id: Optional[str] = Field(
        default=None,
        description="Patient ID if authenticated. Overridden by JWT token if present.",
    )
    user_name: Optional[str] = Field(
        default=None,
        description="Patient display name",
    )
    user_email: Optional[str] = Field(
        default=None,
        description="Patient email address",
    )


class ToolCallDetail(BaseModel):
    """Represents a tool executed by the agent."""

    name: str
    args: Dict[str, Any]
    result: Optional[Any] = None


class ChatMessageResponse(BaseModel):
    """Response returned by the non-streaming chat endpoint."""

    session_id: str = Field(..., description="Conversation session ID")
    response: str = Field(..., description="AI Agent reply text formatted in Markdown")
    tool_calls: List[ToolCallDetail] = Field(
        default_factory=list,
        description="List of clinical tools executed during the turn",
    )
    is_emergency: bool = Field(default=False, description="Whether an emergency condition was detected")
    is_blocked: bool = Field(default=False, description="Whether input was blocked by guardrails")


class MessageHistoryItem(BaseModel):
    """Represents a single message in the conversation history."""

    role: str = Field(..., description="'user', 'assistant', 'system', or 'tool'")
    content: str = Field(..., description="Message text content")
    timestamp: Optional[str] = None


class SessionHistoryResponse(BaseModel):
    """Conversation history response."""

    session_id: str
    message_count: int
    messages: List[MessageHistoryItem]


class HealthCheckResponse(BaseModel):
    """System health check response."""

    status: str
    environment: str
    database_connected: bool
    groq_configured: bool
    groq_model: str
    version: str = "0.1.0"


class DirectBookRequest(BaseModel):
    """Direct appointment booking payload."""

    doc_id: str
    slot_date: str
    slot_time: str
    user_id: Optional[str] = None
    patient_name: Optional[str] = None
    patient_email: Optional[str] = None
    patient_phone: Optional[str] = None
