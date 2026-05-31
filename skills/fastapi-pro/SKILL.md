---
name: fastapi-pro
description: Professional FastAPI development for high-performance AI backends. Use when building async APIs, implementing Pydantic models, or integrating with LangGraph and SQL databases.
---

# FastAPI Professional

## Core Principles
- **Asynchronous**: Use `async def` for all I/O bound operations.
- **Type Safety**: Use Pydantic v2 for request/response validation. Define clear schemas.
- **Dependency Injection**: Use `Depends()` for database sessions, auth, and AI model loading.

## Performance & Scaling
- **Background Tasks**: Offload heavy AI processing to `BackgroundTasks` or Celery if persistence is needed.
- **CORS**: Always restrict `allow_origins` to known frontend domains.
- **WebSockets**: Implement robust heartbeats and JSON-based messaging protocols.

## Database Integration
- **SQLAlchemy 2.0+**: Use the async session pattern.
- **Migrations**: Always use Alembic for schema changes.
