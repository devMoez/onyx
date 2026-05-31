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
    models: Optional[Dict[str, str]] = None

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

@app.post("/api/config/keys")
async def update_keys(request: ConfigKeysRequest):
    """Update LLM API keys and models"""
    llm_router.update_keys(request.keys)
    if request.models:
        llm_router.update_models(request.models)
    return {"status": "updated"}

@app.post("/api/config/provider")
async def set_provider(request: ConfigProviderRequest):
    """Set the active LLM provider"""
    llm_router.set_provider(request.provider)
    return {"status": "provider_set", "provider": request.provider}

import subprocess
import os
@app.get("/api/auth/status")
async def check_auth_status():
    """Check CLI auth status"""
    # Check for gh auth
    copilot_ok = os.path.exists(os.path.expanduser("~/.config/gh/hosts.yml"))
    return {"copilot": copilot_ok, "gemini": False}

@app.get("/api/models/{provider}")
async def get_models(provider: str):
    """Fetch available models for a provider"""
    return {"models": llm_router.list_models(provider)}


import base64
from io import BytesIO
import pyautogui

@app.get("/api/screen/capture")
async def capture_screen():
    """Capture screen and return as base64 image"""
    try:
        screenshot = pyautogui.screenshot()
        buffered = BytesIO()
        screenshot.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return {"image_base64": img_str}
    except Exception as e:
        return {"error": str(e)}

@app.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket):
    """WebSocket endpoint for real-time task streaming"""
    await websocket.accept()
    print("DEBUG: WebSocket connected")
    try:
        while True:
            data = await websocket.receive_text()
            print(f"DEBUG: Received WebSocket data: {data}")
            message = json.loads(data)
            
            if message.get("type") == "task":
                task_input = message.get("input")
                print(f"DEBUG: Executing task: {task_input}")
                
                # Add user message to session
                session_manager.add_message("user", task_input)
                
                # Execute via Supervisor (REAL LLM CALL)
                try:
                    result = await supervisor.execute_task(task_input)
                    print(f"DEBUG: Task result: {result}")
                    
                    # Add assistant response to session
                    if result.get("status") == "completed":
                        session_manager.add_message("assistant", result.get("response"))
                    else:
                        # Add error message to chat as assistant message for visibility
                        session_manager.add_message("assistant", f"SYSTEM ERROR: {result.get('error', 'Unknown failure')}")
                    
                    await websocket.send_json({
                        "type": "task_result",
                        "data": result
                    })
                except Exception as task_e:
                    error_msg = f"INTERNAL SYSTEM ERROR: {str(task_e)}"
                    print(f"DEBUG: Task execution exception: {error_msg}")
                    await websocket.send_json({
                        "type": "task_result",
                        "data": {"status": "error", "error": error_msg}
                    })
            
            elif message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()
