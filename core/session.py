from typing import Dict, Any, List, Optional
from datetime import datetime

class SessionManager:
    """Manages internal state for ONYX (FastAPI version)"""
    
    def __init__(self):
        self._state = {}
        self._ensure_session_keys()
    
    def _ensure_session_keys(self):
        """Initialize all required session state keys"""
        # Initialize defaults
        defaults = {
            "messages": [],  # Chat history
            "task_id": None,
            "mode": "auto",
            "artifacts": [],
            "terminal_output": "",
            "active_tasks": [],
            "task_history": [],
            "system_status": "idle",
            "last_error": None,
            "current_agent": None,
            "agent_reasoning": [],
            "voice_active": False,
            "transcribed_text": "",
            "voice_commands": [],
            "screen_active": False,
            "camera_active": False,
            "log_level": "INFO",
        }
        
        for key, default_value in defaults.items():
            if key not in self._state:
                self._state[key] = default_value
    
    # Chat management
    def add_message(self, role: str, content: str, timestamp: Optional[str] = None) -> dict:
        """Add message to chat history"""
        message = {
            "role": role,
            "content": content,
            "timestamp": timestamp or datetime.now().isoformat()
        }
        self._state["messages"].append(message)
        return message
    
    def get_messages(self) -> list:
        """Get all chat messages"""
        return self._state.get("messages", [])
    
    def clear_messages(self):
        """Clear chat history"""
        self._state["messages"] = []
    
    def get_message_count(self) -> int:
        """Get total message count"""
        return len(self.get_messages())
    
    # Artifact management
    def add_artifact(self, artifact_type: str, content: str, language: str = None) -> dict:
        """Add code/document artifact"""
        artifact = {
            "type": artifact_type,
            "content": content,
            "language": language or "python",
            "timestamp": datetime.now().isoformat()
        }
        self._state["artifacts"].append(artifact)
        return artifact
    
    def get_artifacts(self) -> list:
        """Get all artifacts"""
        return self._state.get("artifacts", [])
    
    def get_artifacts_by_type(self, artifact_type: str) -> list:
        """Filter artifacts by type"""
        return [a for a in self.get_artifacts() if a.get("type") == artifact_type]
    
    def clear_artifacts(self):
        """Clear all artifacts"""
        self._state["artifacts"] = []
    
    def get_artifact_count(self) -> int:
        """Get total artifact count"""
        return len(self.get_artifacts())
    
    # Terminal management
    def add_terminal_output(self, output: str):
        """Append to terminal output"""
        self._state["terminal_output"] += output + "\n"
    
    def get_terminal_output(self) -> str:
        """Get full terminal output"""
        return self._state.get("terminal_output", "")
    
    def clear_terminal(self):
        """Clear terminal output"""
        self._state["terminal_output"] = ""
    
    # Task management
    def start_task(self, task_id: str):
        """Mark task as active"""
        self._state["task_id"] = task_id
        if task_id not in self._state["active_tasks"]:
            self._state["active_tasks"].append(task_id)
        self._state["system_status"] = "processing"
    
    def complete_task(self, task_id: str):
        """Mark task as completed"""
        if task_id in self._state["active_tasks"]:
            self._state["active_tasks"].remove(task_id)
        if task_id not in self._state["task_history"]:
            self._state["task_history"].append(task_id)
        if not self._state["active_tasks"]:
            self._state["system_status"] = "idle"
    
    def get_active_tasks_count(self) -> int:
        """Get count of active tasks"""
        return len(self._state.get("active_tasks", []))
    
    def get_task_history(self) -> list:
        """Get all completed task IDs"""
        return self._state.get("task_history", [])
    
    # Status management
    def set_system_status(self, status: str):
        """Update system status"""
        if status in ["idle", "processing", "waiting_approval", "error"]:
            self._state["system_status"] = status
    
    def get_system_status(self) -> str:
        """Get current system status"""
        return self._state.get("system_status", "idle")
    
    def set_error(self, error_msg: str):
        """Set last error message"""
        self._state["last_error"] = error_msg
        self._state["system_status"] = "error"
    
    def clear_error(self):
        """Clear error message"""
        self._state["last_error"] = None
    
    # Agent management
    def set_current_agent(self, agent_name: Optional[str]):
        """Set currently active agent"""
        self._state["current_agent"] = agent_name
    
    def get_current_agent(self) -> Optional[str]:
        """Get currently active agent"""
        return self._state.get("current_agent")
    
    def add_reasoning(self, agent_name: str, thinking: str):
        """Add transparent agent reasoning"""
        reasoning_entry = {
            "agent": agent_name,
            "thinking": thinking,
            "timestamp": datetime.now().isoformat()
        }
        if "agent_reasoning" not in self._state:
            self._state["agent_reasoning"] = []
        self._state["agent_reasoning"].append(reasoning_entry)
        if len(self._state["agent_reasoning"]) > 50:
            self._state["agent_reasoning"] = self._state["agent_reasoning"][-50:]
    
    def get_reasoning_history(self) -> list:
        """Get all reasoning entries"""
        return self._state.get("agent_reasoning", [])
    
    def clear_reasoning(self):
        """Clear reasoning history"""
        self._state["agent_reasoning"] = []
    
    # Mode management
    def set_mode(self, mode: str):
        """Set execution mode (auto or manual)"""
        if mode in ["auto", "manual"]:
            self._state["mode"] = mode
    
    def get_mode(self) -> str:
        """Get current execution mode"""
        return self._state.get("mode", "auto")
    
    def is_auto_mode(self) -> bool:
        """Check if in auto mode"""
        return self.get_mode() == "auto"
    
    # Voice management
    def set_voice_active(self, active: bool):
        """Set voice listening status"""
        self._state["voice_active"] = active
    
    def is_voice_active(self) -> bool:
        """Check if voice is active"""
        return self._state.get("voice_active", False)
    
    def set_transcribed_text(self, text: str):
        """Set transcribed voice text"""
        self._state["transcribed_text"] = text
    
    def add_voice_command(self, command: str):
        """Add voice command to history"""
        if "voice_commands" not in self._state:
            self._state["voice_commands"] = []
        self._state["voice_commands"].append({
            "command": command,
            "timestamp": datetime.now().isoformat()
        })
        if len(self._state["voice_commands"]) > 10:
            self._state["voice_commands"] = self._state["voice_commands"][-10:]
    
    def get_voice_commands(self) -> list:
        """Get voice command history"""
        return self._state.get("voice_commands", [])
    
    # Screen/Camera management
    def set_screen_active(self, active: bool):
        """Set screen capture status"""
        self._state["screen_active"] = active
    
    def is_screen_active(self) -> bool:
        """Check if screen capture is active"""
        return self._state.get("screen_active", False)
    
    def set_camera_active(self, active: bool):
        """Set camera capture status"""
        self._state["camera_active"] = active
    
    def is_camera_active(self) -> bool:
        """Check if camera capture is active"""
        return self._state.get("camera_active", False)
    
    # Logging
    def set_log_level(self, level: str):
        """Set logging verbosity level"""
        if level in ["DEBUG", "INFO", "WARNING", "ERROR"]:
            self._state["log_level"] = level
    
    def get_log_level(self) -> str:
        """Get current log level"""
        return self._state.get("log_level", "INFO")
    
    # Summary and state queries
    def get_state_summary(self) -> Dict[str, Any]:
        """Get complete state snapshot"""
        return {
            "mode": self.get_mode(),
            "system_status": self.get_system_status(),
            "active_tasks": self.get_active_tasks_count(),
            "total_messages": self.get_message_count(),
            "total_artifacts": self.get_artifact_count(),
            "current_agent": self.get_current_agent(),
            "last_error": self._state.get("last_error"),
            "voice_active": self.is_voice_active(),
            "screen_active": self.is_screen_active(),
            "camera_active": self.is_camera_active(),
            "log_level": self.get_log_level(),
        }
    
    def reset_session(self):
        """Full session reset to defaults"""
        self._state = {}
        self._ensure_session_keys()

# Global singleton instance
session_manager = SessionManager()
