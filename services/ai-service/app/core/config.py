from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "TaskForge AI Engine"
    API_V1_STR: str = "/api/v1"
    
    OPENAI_API_KEY: str = "sk-placeholder"  # User will provide this
    
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"

settings = Settings()
