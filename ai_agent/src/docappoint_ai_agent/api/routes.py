"""FastAPI API routes for AI Agent interaction and health inspection."""

import json
import uuid
from typing import Any, AsyncGenerator, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
from sse_starlette.sse import EventSourceResponse

from docappoint_ai_agent.agent.graph import agent_graph
from docappoint_ai_agent.api.dependencies import get_optional_user
from docappoint_ai_agent.api.schemas import (
    ChatMessageRequest,
    ChatMessageResponse,
    HealthCheckResponse,
    MessageHistoryItem,
    SessionHistoryResponse,
    ToolCallDetail,
)
from docappoint_ai_agent.config import settings
from docappoint_ai_agent.core.database import db_manager
from docappoint_ai_agent.core.logging import logger

router = APIRouter(prefix="/api", tags=["AI Clinical Agent"])


@router.get("/health", response_model=HealthCheckResponse)
def health_check() -> HealthCheckResponse:
    """Verifies system health, database connectivity, and Groq configuration."""
    db_ok = db_manager.check_health()
    groq_ok = bool(settings.GROQ_API_KEY and settings.GROQ_API_KEY != "your_groq_api_key_here")

    return HealthCheckResponse(
        status="healthy" if (db_ok or not settings.DEBUG) else "degraded",
        environment=settings.ENVIRONMENT,
        database_connected=db_ok,
        groq_configured=groq_ok,
        groq_model=settings.GROQ_MODEL,
        version="0.1.0",
    )


@router.post("/chat", response_model=ChatMessageResponse)
def chat_endpoint(
    req: ChatMessageRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user),
) -> ChatMessageResponse:
    """
    Standard chat endpoint running on FastAPI's thread pool.
    Maintains conversational thread memory across multiple requests using session_id.
    """
    session_id = req.session_id or f"session_{uuid.uuid4().hex[:12]}"

    # Resolve user context (JWT takes precedence over payload)
    user_id = str(current_user["_id"]) if isinstance(current_user, dict) else req.user_id
    user_name = current_user.get("name") if isinstance(current_user, dict) else (req.user_name or "Patient")
    user_email = current_user.get("email") if isinstance(current_user, dict) else req.user_email

    logger.info(f"Chat request received: session={session_id}, user={user_id}, msg='{req.message[:50]}...'")

    config = {"configurable": {"thread_id": session_id}}
    initial_input = {
        "messages": [HumanMessage(content=req.message)],
        "user_id": user_id,
        "user_name": user_name,
        "user_email": user_email,
        "session_id": session_id,
    }

    try:
        final_state = agent_graph.invoke(initial_input, config=config) # type: ignore
    except Exception as e:
        logger.error(f"Error during graph execution: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent workflow error: {str(e)}",
        )

    # Extract messages and tool calls
    all_messages = final_state.get("messages", [])
    response_text = ""
    tool_calls: List[ToolCallDetail] = []

    for msg in reversed(all_messages):
        if isinstance(msg, AIMessage) and not response_text:
            response_text = str(msg.content)
            if hasattr(msg, "tool_calls") and msg.tool_calls:
                for tc in msg.tool_calls:
                    tool_calls.append(
                        ToolCallDetail(
                            name=tc.get("name", "tool"),
                            args=tc.get("args", {}),
                        )
                    )

    # Associate tool outputs if available
    for msg in all_messages:
        if isinstance(msg, ToolMessage):
            for tc in tool_calls:
                if tc.result is None:
                    try:
                        tc.result = json.loads(str(msg.content))
                    except Exception:
                        tc.result = str(msg.content)

    return ChatMessageResponse(
        session_id=session_id,
        response=response_text or "I am ready to help with your medical questions and appointment booking.",
        tool_calls=tool_calls,
        is_emergency=final_state.get("is_emergency", False),
        is_blocked=final_state.get("is_blocked", False),
    )


@router.post("/chat/stream")
async def chat_stream_endpoint(
    req: ChatMessageRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user),
):
    """
    Server-Sent Events (SSE) streaming endpoint for real-time token delivery and tool events.
    """
    session_id = req.session_id or f"session_{uuid.uuid4().hex[:12]}"
    user_id = str(current_user["_id"]) if isinstance(current_user, dict) else req.user_id
    user_name = current_user.get("name") if isinstance(current_user, dict) else (req.user_name or "Patient")
    user_email = current_user.get("email") if isinstance(current_user, dict) else req.user_email

    config = {"configurable": {"thread_id": session_id}}
    initial_input = {
        "messages": [HumanMessage(content=req.message)],
        "user_id": user_id,
        "user_name": user_name,
        "user_email": user_email,
        "session_id": session_id,
    }

    async def event_generator() -> AsyncGenerator[Dict[str, str], None]:
        yield {
            "event": "metadata",
            "data": json.dumps({"session_id": session_id, "user_id": user_id}),
        }

        try:
            import anyio

            def produce_stream():
                events = []
                for chunk in agent_graph.stream(initial_input, config=config, stream_mode="messages"): # type: ignore
                    events.append(chunk)
                return events

            stream_items = await anyio.to_thread.run_sync(produce_stream)
            for item in stream_items:
                msg, metadata = item
                if hasattr(msg, "content") and msg.content:
                    yield {"event": "token", "data": json.dumps({"token": msg.content})}
                if hasattr(msg, "tool_calls") and msg.tool_calls:
                    for tc in msg.tool_calls:
                        yield {
                            "event": "tool_start",
                            "data": json.dumps({
                                "name": tc.get("name"),
                                "args": tc.get("args"),
                            }),
                        }

            yield {"event": "done", "data": json.dumps({"status": "completed", "session_id": session_id})}

        except Exception as e:
            logger.error(f"Error in SSE stream: {e}")
            yield {"event": "error", "data": json.dumps({"error": str(e)})}

    return EventSourceResponse(event_generator())


@router.get("/chat/history/{session_id}", response_model=SessionHistoryResponse)
def get_chat_history(session_id: str) -> SessionHistoryResponse:
    """Retrieves conversation history stored in the thread checkpointer."""
    config = {"configurable": {"thread_id": session_id}}
    state_snapshot = agent_graph.get_state(config) # type: ignore

    if not state_snapshot or not state_snapshot.values:
        return SessionHistoryResponse(session_id=session_id, message_count=0, messages=[])

    raw_messages = state_snapshot.values.get("messages", [])
    history_items: List[MessageHistoryItem] = []

    for m in raw_messages:
        role = "assistant"
        if isinstance(m, HumanMessage):
            role = "user"
        elif isinstance(m, ToolMessage):
            role = "tool"

        content_str = str(m.content) if m.content else ""
        if content_str.strip():
            history_items.append(MessageHistoryItem(role=role, content=content_str))

    return SessionHistoryResponse(
        session_id=session_id,
        message_count=len(history_items),
        messages=history_items,
    )


@router.get("/doctors")
def list_doctors_endpoint(
    speciality: Optional[str] = Query(None, description="Filter by specialty"),
):
    """Direct query endpoint to list registered doctors from database."""
    try:
        doctors = db_manager.search_doctors_sync(speciality=speciality, available_only=True)
        return {"success": True, "count": len(doctors), "doctors": doctors}
    except Exception as e:
        logger.error(f"Error querying doctors from database: {e}")
        return {"success": False, "count": 0, "doctors": [], "error": str(e)}
