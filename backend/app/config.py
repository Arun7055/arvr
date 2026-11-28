from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str
    supabase_bucket: str = "fashion-assets"
    groq_api_key: str
    groq_fast_model: str = "openai/gpt-oss-20b"
    groq_smart_model: str = "openai/gpt-oss-120b"
    frontend_url: str = "http://localhost:3000"
    jwt_secret: str = "dev-secret-change-me"

    class Config:
        env_file = ".env"

settings = Settings()