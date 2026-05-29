# main.py
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict
import asyncio
import uuid
import json
from datetime import datetime
import subprocess

from llm.router import LLMRouter
from agents.supervisor import SupervisorAgent
from core.graph import OnyxGraph
from core.session import session_manager
from core.state import WorkflowState

app = FastAPI(title="Onyx API", version="0.1")

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
llm_router = LLMRouter()
supervisor = SupervisorAgent(llm_router=llm_router)
workflow = OnyxGraph()

class TaskRequest(BaseModel):
    input: str
    mode: Optional[str] = "auto"

class ConfigKeysRequest(BaseModel):
    keys: Dict[str, str]

class ConfigProviderRequest(BaseModel):
    provider: str

@app.post("/api/auth/copilot")
async def auth_copilot():
    """Trigger GitHub Copilot CLI Auth in a new visible window"""
    subprocess.Popen(
        ["cmd", "/c", "start", "cmd", "/k", "gh auth login --web -h github.com -s read:user,repo,workflow"], 
        shell=True
    )
    return {"status": "triggered"}

@app.post("/api/auth/gemini")
async def auth_gemini():
    """Trigger Gemini CLI Auth in a new visible window"""
    subprocess.Popen(
        ["cmd", "/c", "start", "cmd", "/k", "gemini-cli auth login"], 
        shell=True
    )
    return {"status": "triggered"}

@app.post("/api/config/keys")
async def update_keys(request: ConfigKeysRequest):
    """Update LLM API keys"""
    llm_router.update_keys(request.keys)
    return {"status": "updated"}

@app.post("/api/config/provider")
async def set_provider(request: ConfigProviderRequest):
    """Set the active LLM provider"""
    llm_router.set_provider(request.provider)
    return {"status": "provider_set", "provider": request.provider}

@app.get("/api/status")
async def get_status():
    """Get current system status"""
    return session_manager.get_state_summary()

@app.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket):
    """WebSocket endpoint for real-time task streaming"""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "task":
                task_input = message.get("input")
                # Add user message to session
                session_manager.add_message("user", task_input)
                
                # Execute via Supervisor (REAL LLM CALL)
                result = await supervisor.execute_task(task_input)
                
                # Add assistant response to session
                if result.get("status") == "completed":
                    session_manager.add_message("assistant", result.get("response"))
                
                await websocket.send_json({
                    "type": "task_result",
                    "data": result
                })
            
            elif message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()
