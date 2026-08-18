from pydantic_settings import BaseSettings , SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str
    ENVIRONMENT: str
    DATABASE_URL: str
    HUGGINGFACE_API_KEY: str
    HUGGINGFACE_MODEL: str
    
    model_config = SettingsConfigDict(
        env_file = ".env",
        env_file_encoding = "utf-8",
        case_sensitive = False
    )

settings = Settings()