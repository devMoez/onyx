import subprocess
import sys
import json
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass, asdict
from datetime import datetime
import os

@dataclass
class Tool:
    """Represents an ONYX tool"""
    name: str
    description: str
    category: str  # "system", "llm", "vision", "audio", "code", "web"
    installed: bool
    version: str = "1.0"
    dependencies: List[str] = None
    module: str = None  # Import path
    
    def __post_init__(self):
        if self.dependencies is None:
            self.dependencies = []

class ToolRegistry:
    """Manages tool discovery, installation, and usage"""
    
    def __init__(self):
        self.tools = {}
        self.installed_tools = {}
        self.installation_log = []
        self._register_builtin_tools()
    
    def _register_builtin_tools(self):
        """Register all built-in ONYX tools"""
        builtin_tools = [
            Tool(
                name="subprocess",
                description="Execute system commands",
                category="system",
                installed=True,
                module="subprocess"
            ),
            Tool(
                name="pyautogui",
                description="GUI automation for screen control",
                category="vision",
                installed=False,
                dependencies=["pyautogui>=0.9.54"],
                module="pyautogui"
            ),
            Tool(
                name="opencv",
                description="Computer vision and image processing",
                category="vision",
                installed=False,
                dependencies=["opencv-python>=4.9.0"],
                module="cv2"
            ),
            Tool(
                name="playwright",
                description="Web automation and scraping",
                category="web",
                installed=False,
                dependencies=["playwright>=1.42.0"],
                module="playwright"
            ),
            Tool(
                name="speech_recognition",
                description="Speech-to-text conversion",
                category="audio",
                installed=False,
                dependencies=["SpeechRecognition>=3.10.0"],
                module="speech_recognition"
            ),
            Tool(
                name="pyttsx3",
                description="Text-to-speech synthesis",
                category="audio",
                installed=False,
                dependencies=["pyttsx3>=2.90"],
                module="pyttsx3"
            ),
            Tool(
                name="requests",
                description="HTTP client for API calls",
                category="web",
                installed=False,
                dependencies=["requests>=2.31.0"],
                module="requests"
            ),
            Tool(
                name="beautifulsoup",
                description="HTML/XML parsing",
                category="web",
                installed=False,
                dependencies=["beautifulsoup4"],
                module="bs4"
            ),
            Tool(
                name="pillow",
                description="Image processing",
                category="vision",
                installed=False,
                dependencies=["pillow>=10.3.0"],
                module="PIL"
            ),
            Tool(
                name="mss",
                description="Fast screen capture",
                category="vision",
                installed=False,
                dependencies=["mss"],
                module="mss"
            ),
        ]
        
        for tool in builtin_tools:
            self.tools[tool.name] = tool
    
    def register_tool(self, tool: Tool):
        """Register a new tool"""
        self.tools[tool.name] = tool
    
    def get_tool(self, tool_name: str) -> Optional[Tool]:
        """Get tool by name"""
        return self.tools.get(tool_name)
    
    def list_tools(self, category: Optional[str] = None, installed_only: bool = False) -> List[Tool]:
        """List tools, optionally filtered by category"""
        tools = list(self.tools.values())
        
        if category:
            tools = [t for t in tools if t.category == category]
        
        if installed_only:
            tools = [t for t in tools if t.installed]
        
        return tools
    
    def install_tool(self, tool_name: str, verbose: bool = False) -> bool:
        """Install a tool and its dependencies"""
        tool = self.get_tool(tool_name)
        
        if not tool:
            self._log_installation(tool_name, "failed", "Tool not found")
            return False
        
        if tool.installed:
            self._log_installation(tool_name, "skipped", "Already installed")
            return True
        
        # Install dependencies
        for dep in tool.dependencies:
            try:
                if verbose:
                    print(f"Installing {dep}...")
                subprocess.run(
                    [sys.executable, "-m", "pip", "install", "--quiet", dep],
                    check=True,
                    capture_output=True
                )
            except subprocess.CalledProcessError as e:
                self._log_installation(tool_name, "failed", f"Failed to install {dep}: {str(e)}")
                return False
        
        # Mark as installed
        tool.installed = True
        self.installed_tools[tool_name] = tool
        self._log_installation(tool_name, "success", "All dependencies installed")
        
        return True
    
    def install_multiple(self, tool_names: List[str], verbose: bool = False) -> Dict[str, bool]:
        """Install multiple tools"""
        results = {}
        for tool_name in tool_names:
            results[tool_name] = self.install_tool(tool_name, verbose)
        return results
    
    def uninstall_tool(self, tool_name: str) -> bool:
        """Uninstall a tool"""
        tool = self.get_tool(tool_name)
        
        if not tool or not tool.installed:
            return False
        
        tool.installed = False
        if tool_name in self.installed_tools:
            del self.installed_tools[tool_name]
        
        self._log_installation(tool_name, "uninstalled", "Tool removed")
        return True
    
    def check_tool_availability(self, tool_name: str) -> bool:
        """Check if a tool can be imported"""
        tool = self.get_tool(tool_name)
        
        if not tool or not tool.module:
            return False
        
        try:
            __import__(tool.module)
            return True
        except ImportError:
            return False
    
    def get_installation_log(self) -> List[Dict]:
        """Get tool installation history"""
        return self.installation_log
    
    def _log_installation(self, tool_name: str, status: str, message: str):
        """Log installation attempt"""
        self.installation_log.append({
            "tool": tool_name,
            "status": status,  # "success", "failed", "skipped", "uninstalled"
            "message": message,
            "timestamp": datetime.now().isoformat()
        })
    
    def get_stats(self) -> Dict[str, Any]:
        """Get tool statistics"""
        total = len(self.tools)
        installed = len([t for t in self.tools.values() if t.installed])
        
        by_category = {}
        for tool in self.tools.values():
            if tool.category not in by_category:
                by_category[tool.category] = {"total": 0, "installed": 0}
            by_category[tool.category]["total"] += 1
            if tool.installed:
                by_category[tool.category]["installed"] += 1
        
        return {
            "total_tools": total,
            "installed_tools": installed,
            "not_installed": total - installed,
            "by_category": by_category,
            "log_entries": len(self.installation_log)
        }

# Global registry
tool_registry = ToolRegistry()
