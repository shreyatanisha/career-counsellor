import os
import sys
from pydantic_settings import BaseSettings
from typing import List

# Determine the correct path to .env file
if getattr(sys, 'frozen', False):
    # PyInstaller creates a temp folder and stores path in _MEIPASS
    base_dir = sys._MEIPASS
    env_path = os.path.join(base_dir, '.env')
else:
    env_path = ".env"

class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    MYSQL_URL: str = "mysql+pymysql://root:password@localhost:3306/career_counsellor"
    FIREBASE_PROJECT_ID: str = "career-counsellor-82856"
    FIREBASE_PRIVATE_KEY: str = ""
    FIREBASE_CLIENT_EMAIL: str = ""
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = env_path
        case_sensitive = True


settings = Settings()
