"""FastAPI Application Entrypoint for DocAppointment AI Agent Service."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from docappoint_ai_agent.api.routes import router as api_router
from docappoint_ai_agent.config import settings
from docappoint_ai_agent.core.database import db_manager
from docappoint_ai_agent.core.logging import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager: connects to DB on startup and cleans up on shutdown."""
    logger.info("Initializing DocAppointment AI Agent Service...")
    logger.info(f"Environment: {settings.ENVIRONMENT} | Debug: {settings.DEBUG}")
    logger.info(f"Configured Groq Model: {settings.GROQ_MODEL}")

    # Connect to MongoDB
    await db_manager.connect()

    yield

    # Disconnect from MongoDB
    logger.info("Shutting down DocAppointment AI Agent Service...")
    await db_manager.disconnect()


def create_app() -> FastAPI:
    """Factory function creating the production-grade FastAPI application."""
    app = FastAPI(
        title="DocAppointment AI Clinical Agent API",
        description=(
            "Production-grade Medical Triage and Doctor Appointment Booking AI Agent "
            "powered by LangGraph, LangChain, Groq API (Llama 3.3/3.1), and MongoDB."
        ),
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register API Router
    app.include_router(api_router)

    # Root informational route
    @app.get("/", tags=["General"])
    async def root():
        return {
            "name": "DocAppointment AI Clinical Agent API",
            "version": "0.1.0",
            "status": "online",
            "model": settings.GROQ_MODEL,
            "documentation": "/docs",
            "endpoints": {
                "health": "/api/health",
                "chat": "/api/chat",
                "chat_stream": "/api/chat/stream",
                "chat_history": "/api/chat/history/{session_id}",
                "doctors": "/api/doctors",
            },
        }

    return app


app = create_app()


def main():
    """CLI entrypoint for running the server with uvicorn."""
    import uvicorn

    uvicorn.run(
        "docappoint_ai_agent.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )


if __name__ == "__main__":
    main()
