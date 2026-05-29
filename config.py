# config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    PROJECT_NAME = "Onyx"
    VERSION = "0.1"
    OS = "Windows"
    
    # LLM Settings
    PRIMARY_LLM = "ollama/llama3.2"
    FALLBACK_LLM = "groq"
    OLLAMA_BASE_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
    
    # Mode Settings
    DEFAULT_MODE = "auto"   # "auto" or "manual"
    
    # Paths
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(BASE_DIR, "data")
    LOGS_DIR = os.path.join(BASE_DIR, "logs")
    MEMORY_DB = os.path.join(DATA_DIR, "onyx_memory.db")
    CHROMA_DIR = os.path.join(DATA_DIR, "chroma_db")
    
    # Redis (for caching)
    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
    
    # Performance
    CACHE_TTL = 300  # 5 minutes
    MAX_RETRIES = 3
    TIMEOUT = 60
    
    # Security
    ALLOWED_PATHS = [BASE_DIR, os.path.expanduser("~")]
    BLOCKED_COMMANDS = ["format", "del /f /q", "rm -rf /", "rd /s /q"]
    
    @classmethod
    def ensure_directories(cls):
        os.makedirs(cls.DATA_DIR, exist_ok=True)
        os.makedirs(cls.LOGS_DIR, exist_ok=True)
