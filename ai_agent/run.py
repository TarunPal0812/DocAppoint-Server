"""Convenience runner script for DocAppointment AI Agent Service."""

import os
import uvicorn
from docappoint_ai_agent.config import settings

if __name__ == "__main__":
    port = int(os.environ.get("PORT") or settings.PORT)
    host = os.environ.get("HOST") or settings.HOST
    masked_key = (
        f"{settings.GROQ_API_KEY[:6]}...{settings.GROQ_API_KEY[-4:]}"
        if settings.GROQ_API_KEY
        else "NOT SET"
    )
    print(f"Starting DocAppointment AI Agent on http://{host}:{port}")
    print(f"Active LLM Model: {settings.GROQ_MODEL}")
    print(f"Groq API Key: {masked_key}")
    print(f"API Documentation available at: http://{host}:{port}/docs")
    uvicorn.run(
        "docappoint_ai_agent.main:app",
        host=host,
        port=port,
        reload=settings.DEBUG,
    )
