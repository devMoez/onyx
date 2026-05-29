---
name: chromadb-expert
description: Expert guidance for vector database management and RAG workflows using ChromaDB. Use when implementing semantic search, document embeddings, or agentic memory.
---

# ChromaDB & Vector Expert

## Vector Operations
- **Embeddings**: Use high-quality models (e.g., OpenAI, HuggingFace) consistent across ingestion and query.
- **Collections**: Group related data into specific collections. Use descriptive names.
- **Metadata Filtering**: Use metadata heavily to scope searches (e.g., `user_id`, `file_type`).

## RAG Patterns
- **Chunking**: Use `RecursiveCharacterTextSplitter` with appropriate `chunk_size` and `overlap`.
- **Retrieval**: Implement hybrid search if possible. Use `top_k` appropriately to balance context window vs relevance.
- **Persistence**: Ensure ChromaDB is initialized with a persistent client (`PersistentClient`).
