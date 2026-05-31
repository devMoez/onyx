# core/event_bus.py
import asyncio

class EventBus:
    """Asynchronous event bus for agent-to-agent communication."""
    def __init__(self):
        self.queue = asyncio.Queue()

    async def publish(self, event_type: str, data: Any):
        await self.queue.put({"type": event_type, "data": data})

    async def subscribe(self):
        return await self.queue.get()

# Global singleton
event_bus = EventBus()
