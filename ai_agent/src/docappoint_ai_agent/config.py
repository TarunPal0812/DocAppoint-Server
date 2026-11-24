"""Application configuration module using Pydantic Settings."""

from pathlib import Path
from typing import Any, List
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_BASE_DIR = Path(__file__).resolve().parent.parent.parent
_BACKEND_DIR = _BASE_DIR.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(
            str(_BASE_DIR / ".env"),
            str(_BACKEND_DIR / ".env"),
            ".env",
            "../.env",
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Server settings
    HOST: str = Field(default="0.0.0.0", description="FastAPI host")
    PORT: int = Field(default=8000, description="FastAPI port")

    @field_validator("PORT", mode="before")
    @classmethod
    def resolve_port(cls, v: Any) -> int:
        import os
        ai_port = os.getenv("AI_AGENT_PORT")
        if ai_port:
            try:
                return int(ai_port)
            except ValueError:
                pass
        if v:
            try:
                return int(v)
            except ValueError:
                pass
        return 8000
    ENVIRONMENT: str = Field(default="development", description="Environment mode")
    DEBUG: bool = Field(default=True, description="Debug mode")

    # Groq LLM settings
    GROQ_API_KEY: str = Field(
        default="",
        description="Groq API key loaded from environment",
    )

    @field_validator("GROQ_API_KEY", mode="before")
    @classmethod
    def sanitize_groq_api_key(cls, v: Any) -> str:
        if not v:
            return ""
        clean = str(v).strip().strip("'\"")
        if clean == "your_groq_api_key_here":
            return ""
        return clean

    GROQ_MODEL: str = Field(
        default="openai/gpt-oss-120b",
        validation_alias="GROQ_MODEL",
        description="Groq model (e.g., openai/gpt-oss-120b, llama-3.3-70b-versatile, llama-3.1-8b-instant)",
    )
    GROQ_TEMPERATURE: float = Field(
        default=0.2,
        description="Sampling temperature for clinical precision",
    )
    GROQ_MAX_RETRIES: int = Field(default=3, description="Max retries for Groq API calls")

    # Backend integration settings
    BACKEND_URL: str = Field(
        default="http://localhost:3001",
        description="Base URL of the Node.js Express backend service",
    )

    # MongoDB connection settings
    MONGODB_URI: str = Field(
        default="",
        description="MongoDB connection URI matching Node.js backend",
    )
    MONGODB_DB_NAME: str = Field(
        default="docappoint",
        description="Database name used by the application",
    )

    # Collection names (matches Mongoose singular model names pluralized)
    DOCTORS_COLLECTION: str = Field(default="doctormodels")
    APPOINTMENTS_COLLECTION: str = Field(default="appointmentmodels")
    USERS_COLLECTION: str = Field(default="usermodels")

    # Authentication / JWT settings (matches Node.js backend)
    JWT_SECRET: str = Field(
        default="your_jwt_secret_key_here",
        description="JWT Secret key shared with Node.js backend for token verification",
    )
    JWT_ALGORITHM: str = Field(default="HS256")

    # CORS origins
    CORS_ORIGINS: List[str] = Field(
        default=[
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000",
            "http://localhost:3001",
            "https://docappoint-client.netlify.app",
            "https://docappoint-admin.netlify.app",
        ]
    )

    # Agent guardrail settings
    EMERGENCY_HOTLINE: str = Field(
        default="112 / 911 / 108",
        description="Emergency helpline displayed for life-threatening symptoms",
    )


settings = Settings()
