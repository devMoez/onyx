# memory/memory_manager.py
from database.sqlite_db import db
from database.vector_memory import vector_memory
from database.simple_cache import cache
from typing import Dict, Any, List, Optional
import hashlib
import json

class MemoryManager:
    """Unified memory system - Windows native"""
    
    def __init__(self):
        self.sqlite = db
        self.vector = vector_memory
        self.cache = cache
        
        self.categories = {
            "identity": "User identity and preferences",
            "coding": "Code patterns and styles", 
            "errors": "Past errors and solutions",
            "skills": "Agent skills and capabilities",
            "context": "Session context",
            "insights": "Extracted session goals and decisions"
        }
        
        # Bootstrap hot data on startup
        self.bootstrap()

    def bootstrap(self):
        """Pre-load 'Hot' memories into Tier 1 RAM cache"""
        print("⚡ BOOTSTRAP: Loading Hot Memories into Tier 1 (Cache)...")
        try:
            # Load top 20 most accessed memories
            hot_memories = self.sqlite.get_memories(limit=20)
            for mem in hot_memories:
                self.cache.set(f"mem:{mem['id']}", mem['content'], 3600)
            print(f"✅ BOOTSTRAP: Loaded {len(hot_memories)} high-priority items.")
        except Exception as e:
            print(f"❌ BOOTSTRAP FAILED: {e}")

    async def extract_and_store_insights(self, session_id: str, llm_router):
        """Automatically extract goals and decisions from session history and store them."""
        print(f"🧠 MEMORY: Extracting insights for session {session_id}...")
        from core.session import session_manager
        history = session_manager.get_messages()
        
        if len(history) < 2: 
            print("🧠 MEMORY: History too short for extraction.")
            return
        
        prompt = f"""
        Analyze the following session history for an AI OS named ONYX.
        History: {json.dumps(history[-15:])}
        
        Extract:
        1. Core Goals: What is the user trying to achieve?
        2. Architectural Decisions: What technical choices were made?
        3. Code Summaries: If code was written/edited, what changed?
        
        Respond ONLY with a JSON object in this format:
        {{
            "core_goals": ["..."],
            "decisions": ["..."],
            "code_changes": ["..."]
        }}
        """
        
        try:
            response = await llm_router.chat(prompt)
            # Clean and parse response
            clean_resp = response.strip()
            if "```json" in clean_resp:
                clean_resp = clean_resp.split("```json")[1].split("```")[0].strip()
            elif "```" in clean_resp:
                clean_resp = clean_resp.split("```")[1].split("```")[0].strip()
            
            insight_data = json.loads(clean_resp)
            self.store(
                content=insight_data,
                category="insights",
                tags=[session_id, "extraction"],
                priority="high"
            )
            print(f"✅ MEMORY: Insights successfully stored.")
        except Exception as e:
            print(f"❌ MEMORY: Insight extraction failed: {e}")
    
    def store(self, content: Dict, category: str, tags: List[str] = None, priority: str = "medium") -> str:
        """Store memory routing across 4 tiers"""
        memory_id = hashlib.md5(
            f"{category}{json.dumps(content)}".encode()
        ).hexdigest()
        
        # Tier 1: Cache (Hot)
        if priority == "high":
            self.cache.set(f"mem:{memory_id}", content, 3600)
            
        # Tier 2: Episodes (Episodic - short term structured)
        if category in ["context", "session"]:
            self.sqlite.save_episode("default_session", content)
            
        # Tier 3: Long-Term (Structured)
        self.sqlite.save_memory(category, content)
        
        # Tier 4: Vector (Semantic)
        text_for_embedding = f"{category}: {json.dumps(content)}"
        self.vector.add("memories", text_for_embedding, {
            "category": category,
            "memory_id": memory_id,
            "tags": str(tags)
        }, memory_id)
        
        return memory_id
    
    def retrieve(self, query: str, category: str = None, limit: int = 5) -> List[Dict]:
        """Retrieve memories"""
        results = []
        
        # Check cache first
        cached = self.cache.get(f"search:{query[:30]}")
        if cached:
            return cached[:limit]
        
        # Semantic search
        vector_results = self.vector.search("memories", query, limit)
        
        for vr in vector_results:
            # Get full content from SQLite
            if 'metadata' in vr and 'memory_id' in vr['metadata']:
                memories = self.sqlite.get_memories(category, limit)
                for mem in memories:
                    if mem['id'] == vr['metadata']['memory_id']:
                        results.append({
                            'content': mem['content'],
                            'category': mem['category'],
                            'relevance': 1 - vr.get('distance', 0),
                            'confidence': mem['confidence']
                        })
        
        # Cache results
        if results:
            self.cache.set(f"search:{query[:30]}", results, 60)
        
        return results
    
    def remember_error(self, error: str, solution: str):
        """Store error solution"""
        self.store(
            content={'error': error, 'solution': solution},
            category="errors",
            tags=['debug', 'fix']
        )
    
    def get_similar_error(self, error: str) -> Optional[Dict]:
        """Find similar past error"""
        results = self.retrieve(error, category="errors", limit=1)
        return results[0] if results else None
    
    def add_skill(self, agent: str, skill: str, description: str):
        """Add skill to agent"""
        self.store(
            content={
                'agent': agent,
                'skill': skill,
                'description': description
            },
            category="skills",
            tags=[agent, 'skill']
        )
    
    def get_agent_skills(self, agent: str) -> List[Dict]:
        """Get agent skills"""
        return self.retrieve(agent, category="skills", limit=20)
    
    def get_stats(self) -> Dict:
        return {
            "sqlite": "connected",
            "chroma_collections": len(self.vector.collections),
            "cache_size": self.cache.get_stats()['size'],
            "categories": self.categories
        }

# Initialize
memory = MemoryManager()
