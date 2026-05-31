# database/sqlite_db.py
import sqlite3
import json
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List

class OnyxDatabase:
    def __init__(self, db_path: str = "data/onyx.db"):
        self.db_path = db_path
        Path("data").mkdir(exist_ok=True)
        self._init_tables()
    
    def _init_tables(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Sessions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                mode TEXT DEFAULT 'auto'
            )
        """)
        
        # Tasks table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                session_id TEXT,
                user_input TEXT,
                status TEXT DEFAULT 'pending',
                result TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions(id)
            )
        """)
        
        # Episodes table (Tier 2 Memory)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS episodes (
                id TEXT PRIMARY KEY,
                session_id TEXT,
                content TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions(id)
            )
        """)
        
        # Memory table (Tier 3 Memory)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS memory (
                id TEXT PRIMARY KEY,
                category TEXT,
                content TEXT,
                confidence REAL DEFAULT 0.8,
                access_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Tools table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tools (
                name TEXT PRIMARY KEY,
                category TEXT,
                enabled INTEGER DEFAULT 1
            )
        """)
        
        conn.commit()
        conn.close()
        print("✅ SQLite database initialized at", self.db_path)
    
    def save_memory(self, category: str, content: dict, confidence: float = 0.8) -> str:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        import hashlib
        memory_id = hashlib.md5(f"{category}{json.dumps(content)}".encode()).hexdigest()
        
        cursor.execute("""
            INSERT OR REPLACE INTO memory (id, category, content, confidence)
            VALUES (?, ?, ?, ?)
        """, (memory_id, category, json.dumps(content), confidence))
        
        conn.commit()
        conn.close()
        return memory_id
    
    def save_episode(self, session_id: str, content: dict) -> str:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        import hashlib
        episode_id = hashlib.md5(f"{session_id}{json.dumps(content)}{datetime.now()}".encode()).hexdigest()
        cursor.execute("INSERT INTO episodes (id, session_id, content) VALUES (?, ?, ?)", 
                       (episode_id, session_id, json.dumps(content)))
        conn.commit()
        conn.close()
        return episode_id

    def get_memories(self, category: str = None, limit: int = 10) -> List[dict]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if category:
            cursor.execute("""
                SELECT id, category, content, confidence, access_count
                FROM memory
                WHERE category = ?
                ORDER BY access_count DESC
                LIMIT ?
            """, (category, limit))
        else:
            cursor.execute("""
                SELECT id, category, content, confidence, access_count
                FROM memory
                ORDER BY access_count DESC
                LIMIT ?
            """, (limit,))
        
        results = []
        for row in cursor.fetchall():
            results.append({
                'id': row[0],
                'category': row[1],
                'content': json.loads(row[2]),
                'confidence': row[3],
                'access_count': row[4]
            })
            
            # Update access count
            cursor.execute("UPDATE memory SET access_count = access_count + 1 WHERE id = ?", (row[0],))
        
        conn.commit()
        conn.close()
        return results
    
    def create_session(self, session_id: str) -> bool:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("INSERT OR IGNORE INTO sessions (id) VALUES (?)", (session_id,))
        conn.commit()
        conn.close()
        return True
    
    def save_task(self, task_id: str, session_id: str, user_input: str) -> bool:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO tasks (id, session_id, user_input)
            VALUES (?, ?, ?)
        """, (task_id, session_id, user_input))
        conn.commit()
        conn.close()
        return True
    
    def update_task_result(self, task_id: str, result: str, status: str = 'completed'):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE tasks SET result = ?, status = ?
            WHERE id = ?
        """, (result, status, task_id))
        conn.commit()
        conn.close()

# Initialize
db = OnyxDatabase()
