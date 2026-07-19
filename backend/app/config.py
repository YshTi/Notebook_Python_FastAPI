from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    frontend_url: str
    backend_url: str = "http://localhost:8000"
    brevo_api_key: str | None = None
    brevo_sender_email: str | None = None
    jwt_secret_key: str = "supersecret_default_jwt_key_1234567890_change_me"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()