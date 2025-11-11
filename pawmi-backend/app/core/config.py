import logging
from functools import lru_cache
from typing import Any, List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8", 
        case_sensitive=False,
        extra="ignore"  # Ignore extra fields from .env
    )

    app_name: str = Field(default="PawMI API", alias="APP_NAME")
    app_version: str = Field(default="1.0.0", alias="APP_VERSION")
    debug: bool = Field(default=True, alias="DEBUG")
    environment: str = Field(default="development", alias="ENVIRONMENT")

    # Database URL will be determined by connection_manager
    database_url: str = Field(default="", alias="DATABASE_URL")
    
    def get_active_database_url(self) -> str:
        """Get database URL with automatic fallback."""
        try:
            from app.db.connection_manager import get_database_url
            url, db_type = get_database_url()
            logger.info(f"Using {db_type} database")
            return url
        except Exception as e:
            logger.error(f"Error determining database: {e}")
            # Fallback to .env if connection manager fails
            return self.database_url or "postgresql://postgres:2502@localhost:5432/pawMi_db"

    secret_key: str = Field(default="", alias="SECRET_KEY")
    algorithm: str = Field(default="HS256", alias="ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, alias="ACCESS_TOKEN_EXPIRE_MINUTES")

    # Gemini AI
    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")

    cors_origins: List[str] = Field(default_factory=list, alias="CORS_ORIGINS")

    @field_validator('cors_origins', mode='before')
    @classmethod
    def parse_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            cleaned = v.strip()
            if not cleaned:
                return []
            if cleaned.startswith("[") and cleaned.endswith("]"):
                items = cleaned.strip("[]")
                return [item.strip().strip('"\'') for item in items.split(",") if item.strip()]
            return [item.strip() for item in cleaned.split(",") if item.strip()]
        return []


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
