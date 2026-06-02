from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from .env file."""
    DATABASE_URL: str = "sqlite:///./mentoria_academica.db"
    FIREBASE_CREDENTIALS_PATH: str = "./firebase-service-account.json"
    FIREBASE_PROJECT_ID: str = "moviles-ii-exu"
    FIREBASE_CLOCK_SKEW_SECONDS: int = 10
    ALLOWED_DOMAIN: str = "virtual.upt.pe"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Google Calendar / Meet
    GOOGLE_SERVICE_ACCOUNT_JSON: str = "./google-service-account.json"
    GOOGLE_CALENDAR_ID: str = "primary"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
