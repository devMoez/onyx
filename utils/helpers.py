# utils/helpers.py
import hashlib
import json
from datetime import datetime
from typing import Dict, Any

def generate_id(prefix: str = "") -> str:
    """Generate a unique ID"""
    timestamp = datetime.now().timestamp()
    hash_obj = hashlib.md5(f"{timestamp}{prefix}".encode())
    return f"{prefix}_{hash_obj.hexdigest()[:8]}" if prefix else hash_obj.hexdigest()[:12]

def safe_json_loads(data: str) -> Dict:
    """Safely load JSON data"""
    try:
        return json.loads(data)
    except:
        return {}

def safe_json_dumps(data: Dict) -> str:
    """Safely dump JSON data"""
    try:
        return json.dumps(data, indent=2)
    except:
        return "{}"

def truncate_string(text: str, max_length: int = 100) -> str:
    """Truncate string to max length"""
    if len(text) <= max_length:
        return text
    return text[:max_length] + "..."

def format_timestamp(dt: datetime = None) -> str:
    """Format timestamp for logging"""
    if dt is None:
        dt = datetime.now()
    return dt.strftime("%Y-%m-%d %H:%M:%S")

class Logger:
    def __init__(self, name: str):
        self.name = name
    
    def log(self, level: str, message: str):
        timestamp = format_timestamp()
        print(f"[{timestamp}] [{self.name}] [{level}] {message}")
    
    def info(self, message: str):
        self.log("INFO", message)
    
    def warning(self, message: str):
        self.log("WARNING", message)
    
    def error(self, message: str):
        self.log("ERROR", message)
    
    def debug(self, message: str):
        self.log("DEBUG", message)
