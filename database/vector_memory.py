# database/vector_memory.py
import chromadb
from chromadb.config import Settings
from pathlib import Path
from typing import List, Dict, Any
import hashlib

class VectorMemory:
    def __init__(self, persist_dir: str = "data/chroma_db"):
        self.persist_dir = persist_dir
        Path(persist_dir).mkdir(parents=True, exist_ok=True)
        
        # Windows-compatible ChromaDB
        self.client = chromadb.PersistentClient(
            path=persist_dir,
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        
        self.collections = {}
        self._init_collections()
    
    def _init_collections(self):
        collection_names = ["memories", "code_patterns", "errors", "skills"]
        
        for name in collection_names:
            try:
                self.collections[name] = self.client.get_collection(name)
            except:
                self.collections[name] = self.client.create_collection(name=name)
        
        print(f"✅ ChromaDB initialized with {len(self.collections)} collections")
    
    def add(self, collection: str, text: str, metadata: Dict = None, id: str = None):
        if collection not in self.collections:
            raise ValueError(f"Collection {collection} not found")
        
        if not id:
            id = hashlib.md5(text.encode()).hexdigest()
        
        self.collections[collection].add(
            ids=[id],
            documents=[text],
            metadatas=[metadata or {}]
        )
        return id
    
    def search(self, collection: str, query: str, limit: int = 5) -> List[Dict]:
        if collection not in self.collections:
            return []
        
        results = self.collections[collection].query(
            query_texts=[query],
            n_results=limit
        )
        
        formatted = []
        if results['ids'] and results['ids'][0]:
            for i in range(len(results['ids'][0])):
                formatted.append({
                    'id': results['ids'][0][i],
                    'text': results['documents'][0][i] if results['documents'] else '',
                    'metadata': results['metadatas'][0][i] if results['metadatas'] else {},
                    'distance': results['distances'][0][i] if results['distances'] else 1.0
                })
        
        return formatted
    
    def delete(self, collection: str, id: str):
        if collection in self.collections:
            self.collections[collection].delete(ids=[id])
    
    def count(self, collection: str) -> int:
        if collection in self.collections:
            return self.collections[collection].count()
        return 0

# Initialize
vector_memory = VectorMemory()
