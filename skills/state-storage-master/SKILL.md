---
name: state-storage-master
description: Advanced management of application state and data storage using SQLite and Redis. Use when implementing persistent storage, caching layers, or session management.
---

# State & Storage Master (SQLite & Redis)

## SQLite (Relational Storage)
- **WAL Mode**: Enable Write-Ahead Logging for better concurrency.
- **Indexing**: Always index frequently queried columns (IDs, timestamps).
- **Connection**: Use a singleton pattern or `Depends` for async session management.

## Redis (Cache & Session)
- **TTL**: Always set Time-To-Live for cached items to prevent memory bloat.
- **Data Types**: Use Hashes for objects and Lists/Sets for queues or unique identifiers.
- **Pub/Sub**: Use for real-time notifications across backend instances.

## Pattern Selection
- Use **Redis** for transient, high-speed data (sessions, lock flags).
- Use **SQLite** for structured, persistent application data.
- Use **ChromaDB** only for vector/semantic data.
