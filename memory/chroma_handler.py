import chromadb
from chromadb.config import Settings
from config import Config
from typing import List, Dict, Any, Optional
import os

class ChromaHandler:
    """Manages Chroma vector database for semantic memory"""
    
    def __init__(self):
        self.persist_dir = Config.CHROMA_DIR
        self._ensure_dir()
        self.client = self._init_chroma()
        self.default_collection = "onyx_memory"
        self.collections = {}
    
    def _ensure_dir(self):
        """Ensure Chroma directory exists"""
        os.makedirs(self.persist_dir, exist_ok=True)
    
    def _init_chroma(self):
        """Initialize Chroma client with persistence"""
        settings = Settings(
            chroma_db_impl="duckdb+parquet",
            persist_directory=self.persist_dir,
            anonymized_telemetry=False,
        )
        
        client = chromadb.Client(settings)
        return client
    
    def get_or_create_collection(self, collection_name: str = None) -> chromadb.Collection:
        """Get or create a collection"""
        name = collection_name or self.default_collection
        
        if name not in self.collections:
            try:
                collection = self.client.get_collection(name=name)
            except:
                collection = self.client.create_collection(
                    name=name,
                    metadata={"hnsw:space": "cosine"}
                )
            self.collections[name] = collection
        
        return self.collections[name]
    
    def add_memory(self, collection_name: str, documents: List[str], metadatas: List[Dict[str, Any]], 
                   ids: Optional[List[str]] = None) -> List[str]:
        """Add documents to collection"""
        collection = self.get_or_create_collection(collection_name)
        
        if not ids:
            ids = [f"{collection_name}_{i}_{hash(doc) % 10000}" for i, doc in enumerate(documents)]
        
        collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        return ids
    
    def search_memory(self, collection_name: str, query: str, n_results: int = 5) -> Dict[str, Any]:
        """Search for similar memories"""
        collection = self.get_or_create_collection(collection_name)
        
        results = collection.query(
            query_texts=[query],
            n_results=n_results,
            include=["documents", "metadatas", "distances"]
        )
        
        # Convert distances to similarity scores (cosine: 0-2, invert to get similarity 0-1)
        similarities = []
        if results["distances"] and results["distances"][0]:
            similarities = [1 - (d / 2) for d in results["distances"][0]]
        
        return {
            "documents": results["documents"][0] if results["documents"] else [],
            "metadatas": results["metadatas"][0] if results["metadatas"] else [],
            "similarities": similarities,
            "ids": results["ids"][0] if results["ids"] else []
        }
    
    def update_memory(self, collection_name: str, ids: List[str], documents: List[str], 
                      metadatas: List[Dict[str, Any]]):
        """Update existing memories"""
        collection = self.get_or_create_collection(collection_name)
        
        collection.update(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
    
    def delete_memory(self, collection_name: str, ids: List[str]):
        """Delete memories from collection"""
        collection = self.get_or_create_collection(collection_name)
        collection.delete(ids=ids)
    
    def list_collections(self) -> List[str]:
        """List all collections"""
        return self.client.list_collections()
    
    def delete_collection(self, collection_name: str):
        """Delete entire collection"""
        try:
            self.client.delete_collection(name=collection_name)
            if collection_name in self.collections:
                del self.collections[collection_name]
        except Exception as e:
            print(f"Error deleting collection: {e}")
    
    def persist(self):
        """Persist data to disk"""
        self.client.persist()
    
    def close(self):
        """Close Chroma connection"""
        self.persist()

# Global instance
chroma_handler = ChromaHandler()
