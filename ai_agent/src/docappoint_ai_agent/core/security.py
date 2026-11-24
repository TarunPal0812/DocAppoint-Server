"""Security and JWT token validation module."""

from typing import Any, Dict, Optional
import jwt
from docappoint_ai_agent.config import settings
from docappoint_ai_agent.core.logging import logger


def verify_user_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and verifies JWT token issued by the Node.js backend.
    Returns payload dictionary or None if invalid.
    """
    if not token:
        return None

    # Strip 'Bearer ' if present
    if token.startswith("Bearer "):
        token = token[7:].strip()

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_exp": False},  # Node.js backend may or may not include exp
        )
        return payload
    except jwt.PyJWTError as e:
        logger.debug(f"JWT verification failed: {e}")
        return None


def create_mock_user_token(user_id: str = "66f43e5c9b83b1234567890a") -> str:
    """Creates a mock JWT token for testing and local development."""
    return jwt.encode(
        {"id": user_id},
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )
