# memory/memory_manager.py
import sqlite3
import json
import hashlib
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from config import Config
import time

class MemoryManager:
    """Enhanced Memory Manager with categorization and caching"""
    
    CATEGORIES = {
        "identity": "Information about ONYX and user identity",
        "preferences": "User preferences and settings",
        "coding_patterns": "Recognized coding patterns and best practices",
        "past_errors": "Failed approaches and what went wrong",
        "best_practices": "What works well - successful patterns",
        "general": "General knowledge and reference material"
    }
    
    def __init__(self):
        self.db_path = Config.MEMORY_DB
        self.cache = {}  # In-memory cache for fast access
        self.cache_ttl = Config.CACHE_TTL  # seconds
        self.cache_timestamps = {}
        self._init_db()
    
    def _init_db(self):
        """Initialize SQLite database with enhanced schema"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS memory (
                id TEXT PRIMARY KEY,
                category TEXT NOT NULL,
                content TEXT NOT NULL,
                content_hash TEXT,
                confidence REAL DEFAULT 1.0,
                access_count INTEGER DEFAULT 0,
                last_accessed TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                tags TEXT,
                metadata TEXT
            )
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_category 
            ON memory(category)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_access_count 
            ON memory(access_count DESC)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_confidence 
            ON memory(confidence DESC)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_updated_at
            ON memory(updated_at DESC)
        """)
        
        conn.commit()
        conn.close()
    
    def store(self, content: Dict[str, Any], category: str, tags: Optional[List[str]] = None, 
              metadata: Optional[Dict] = None) -> str:
        """Store memory with category"""
        
        if category not in self.CATEGORIES:
            category = "general"
        
        content_str = json.dumps(content, sort_keys=True)
        content_hash = hashlib.md5(content_str.encode()).hexdigest()
        memory_id = f"{category}_{content_hash}"
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        tags_str = ",".join(tags) if tags else ""
        metadata_str = json.dumps(metadata) if metadata else "{}"
        
        cursor.execute("""
            INSERT OR REPLACE INTO memory 
            (id, category, content, content_hash, tags, metadata, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (memory_id, category, content_str, content_hash, tags_str, metadata_str))
        
        conn.commit()
        conn.close()
        
        # Clear cache for this category
        self._clear_category_cache(category)
        
        return memory_id
    
    def retrieve_by_category(self, category: str, limit: int = 10) -> List[Dict]:
        """Retrieve memories by category"""
        
        # Check cache first
        cache_key = f"cat_{category}"
        if cache_key in self.cache and self._is_cache_valid(cache_key):
            return self.cache[cache_key]
        
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM memory 
            WHERE category = ?
            ORDER BY confidence DESC, access_count DESC, updated_at DESC
            LIMIT ?
        """, (category, limit))
        
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        # Parse JSON fields
        for row in rows:
            row["content"] = json.loads(row["content"])
            row["metadata"] = json.loads(row["metadata"]) if row["metadata"] else {}
        
        # Cache results
        self.cache[cache_key] = rows
        self.cache_timestamps[cache_key] = time.time()
        
        return rows
    
    def search(self, query: str, category: Optional[str] = None, 
               min_confidence: float = 0.5, limit: int = 10) -> List[Dict]:
        """Search memories by content similarity"""
        
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        if category:
            cursor.execute("""
                SELECT * FROM memory 
                WHERE category = ? AND confidence >= ?
                ORDER BY access_count DESC, updated_at DESC
                LIMIT ?
            """, (category, min_confidence, limit))
        else:
            cursor.execute("""
                SELECT * FROM memory 
                WHERE confidence >= ?
                ORDER BY access_count DESC, updated_at DESC
                LIMIT ?
            """, (min_confidence, limit))
        
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        # Parse JSON fields
        for row in rows:
            row["content"] = json.loads(row["content"])
            row["metadata"] = json.loads(row["metadata"]) if row["metadata"] else {}
        
        # Increment access count
        for row in rows:
            self._increment_access(row["id"])
        
        return rows
    
    def get_by_id(self, memory_id: str) -> Optional[Dict]:
        """Retrieve specific memory by ID"""
        
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM memory WHERE id = ?", (memory_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
        
        result = dict(row)
        result["content"] = json.loads(result["content"])
        result["metadata"] = json.loads(result["metadata"]) if result["metadata"] else {}
        
        # Increment access
        self._increment_access(memory_id)
        
        return result
    
    def get_by_tag(self, tag: str) -> List[Dict]:
        """Retrieve memories with specific tag"""
        
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM memory 
            WHERE tags LIKE ?
            ORDER BY access_count DESC
        """, (f"%{tag}%",))
        
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        for row in rows:
            row["content"] = json.loads(row["content"])
            row["metadata"] = json.loads(row["metadata"]) if row["metadata"] else {}
        
        return rows
    
    def update_confidence(self, memory_id: str, confidence: float):
        """Update memory confidence score (0-1)"""
        confidence = max(0, min(1, confidence))  # Clamp 0-1
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE memory 
            SET confidence = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (confidence, memory_id))
        conn.commit()
        conn.close()
        
        self._clear_category_cache_for_id(memory_id)
    
    def _increment_access(self, memory_id: str):
        """Increment access count"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE memory 
            SET access_count = access_count + 1, last_accessed = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (memory_id,))
        conn.commit()
        conn.close()
    
    def _clear_category_cache(self, category: str):
        """Clear cache for category"""
        cache_key = f"cat_{category}"
        if cache_key in self.cache:
            del self.cache[cache_key]
        if cache_key in self.cache_timestamps:
            del self.cache_timestamps[cache_key]
    
    def _clear_category_cache_for_id(self, memory_id: str):
        """Clear cache for memory's category"""
        parts = memory_id.split("_")
        if parts:
            category = parts[0]
            self._clear_category_cache(category)
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cache entry is still valid"""
        if cache_key not in self.cache_timestamps:
            return False
        age = time.time() - self.cache_timestamps[cache_key]
        return age < self.cache_ttl
    
    def get_stats(self) -> Dict[str, Any]:
        """Get memory statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        stats = {
            "total_memories": 0,
            "by_category": {},
            "avg_confidence": 0,
            "most_accessed": []
        }
        
        # Total and by category
        for category in self.CATEGORIES.keys():
            cursor.execute("SELECT COUNT(*) FROM memory WHERE category = ?", (category,))
            count = cursor.fetchone()[0]
            stats["by_category"][category] = count
            stats["total_memories"] += count
        
        # Average confidence
        cursor.execute("SELECT AVG(confidence) FROM memory")
        avg = cursor.fetchone()[0]
        stats["avg_confidence"] = avg or 0
        
        # Most accessed
        cursor.execute("""
            SELECT id, category, access_count FROM memory 
            ORDER BY access_count DESC LIMIT 5
        """)
        stats["most_accessed"] = [dict(zip([d[0] for d in cursor.description], row)) for row in cursor.fetchall()]
        
        conn.close()
        return stats
    
    def clear_old_memories(self, days: int = 30):
        """Remove memories older than specified days"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
        cursor.execute("DELETE FROM memory WHERE updated_at < ?", (cutoff_date,))
        
        conn.commit()
        conn.close()
        
        # Clear all caches
        self.cache.clear()
        self.cache_timestamps.clear()

# Global instance
memory_manager = MemoryManager()
