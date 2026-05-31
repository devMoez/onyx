# database/simple_cache.py
from datetime import datetime, timedelta
from typing import Any, Optional, Dict
import threading

class SimpleCache:
    """In-memory cache - no Redis required, Windows native"""
    
    def __init__(self):
        self._cache: Dict[str, tuple] = {}
        self._lock = threading.Lock()
    
    def set(self, key: str, value: Any, ttl_seconds: int = 300):
        """Store value with TTL"""
        expires_at = datetime.now() + timedelta(seconds=ttl_seconds)
        with self._lock:
            self._cache[key] = (value, expires_at)
    
    def get(self, key: str) -> Optional[Any]:
        """Get value if not expired"""
        with self._lock:
            if key not in self._cache:
                return None
            
            value, expires_at = self._cache[key]
            if datetime.now() > expires_at:
                del self._cache[key]
                return None
            
            return value
    
    def delete(self, key: str):
        with self._lock:
            if key in self._cache:
                del self._cache[key]
    
    def clear(self):
        with self._lock:
            self._cache.clear()
    
    def get_stats(self) -> Dict:
        with self._lock:
            return {
                "size": len(self._cache),
                "keys": list(self._cache.keys())
            }

# Initialize
cache = SimpleCache()
