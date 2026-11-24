"""FastAPI dependency injection utilities."""

from typing import Any, Dict, Optional
from fastapi import Header, Request
from docappoint_ai_agent.core.database import db_manager
from docappoint_ai_agent.core.security import verify_user_token
from docappoint_ai_agent.core.logging import logger


def get_optional_user(
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    token_header: Optional[str] = Header(None, alias="token"),
) -> Optional[Dict[str, Any]]:
    """
    Extracts and authenticates user from JWT token if present.
    Supports either 'Authorization: Bearer <token>' or custom 'token: <token>' header
    matching the Node.js backend convention.
    """
    raw_token = authorization or token_header
    if not raw_token:
        return None

    payload = verify_user_token(raw_token)
    if not payload:
        return None

    user_id = payload.get("id")
    if not user_id:
        return None

    try:
        user_doc = db_manager.get_user_by_id_sync(str(user_id))
        if user_doc:
            return user_doc
    except Exception as e:
        logger.debug(f"Could not load full user doc for ID {user_id}: {e}")

    return {"_id": str(user_id), "name": "Patient", "email": "patient@docappoint.com"}
