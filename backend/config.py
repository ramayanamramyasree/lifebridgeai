import os
from pydantic import Field, AliasChoices
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="forbid"
    )

    PROJECT_NAME: str = "LifeBridge AI"
    DATABASE_URL: str = "sqlite:///./lifebridge.db"
    
    # Mapped to accept JWT_SECRET or SECRET_KEY from environment/.env
    SECRET_KEY: str = Field(
        default="super-secret-lifebridge-key-2026-prod-grade",
        validation_alias=AliasChoices("JWT_SECRET", "SECRET_KEY")
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    ADMIN_EMAIL: str = "admin@lifebridge.ai"
    ADMIN_INITIAL_PASSWORD: str = "LifeBridgeAdmin2026!"
    GEMINI_API_KEY: str = ""
    CORS_ORIGINS: list = ["http://localhost:3000", "http://127.0.0.1:3000"]

    @property
    def JWT_SECRET(self) -> str:
        """Compatibility property for code or tools requesting JWT_SECRET directly."""
        return self.SECRET_KEY

settings = Settings()
