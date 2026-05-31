# tools/tool_registry.py
import subprocess
import os
import json
from typing import Dict, Any, List, Callable
from tools.vision import VisionTools
from tools.audio import AudioTools
from tools.web import WebTools

class ToolCategory:
    BROWSER = "browser"
    FILE = "file"
    CODE = "code"
    SHELL = "shell"
    VISION = "vision"
    AUDIO = "audio"

class Tool:
    def __init__(self, name: str, category: str, description: str, func: Callable, risk: str = "low"):
        self.name = name
        self.category = category
        self.description = description
        self.func = func
        self.risk = risk

class ToolRegistry:
    def __init__(self):
        self.tools = {}
        self._register_default_tools()
        self._register_advanced_tools()
    
    def _register_default_tools(self):
        # File tools
        self.register(Tool("read_file", ToolCategory.FILE, "Read file contents", lambda path: open(path, 'r', encoding='utf-8').read(), "low"))
        self.register(Tool("write_file", ToolCategory.FILE, "Write to file", lambda path, content: open(path, 'w', encoding='utf-8').write(content), "medium"))
        
        # Shell tools
        self.register(Tool("run_cmd", ToolCategory.SHELL, "Run shell command", lambda cmd: subprocess.run(cmd, shell=True, capture_output=True, text=True).stdout, "high"))
        
        # Code tools
        self.register(Tool("exec_python", ToolCategory.CODE, "Execute Python code", lambda code: exec(code), "high"))
    
    def _register_advanced_tools(self):
        vision = VisionTools()
        audio = AudioTools()
        web = WebTools()
        
        # Vision
        self.register(Tool("screenshot", ToolCategory.VISION, "Capture screen", vision.screenshot, "medium"))
        self.register(Tool("capture_camera", ToolCategory.VISION, "Capture camera", vision.capture_camera, "medium"))
        self.register(Tool("mouse_click", ToolCategory.VISION, "Click mouse", vision.mouse_click, "medium"))
        
        # Audio
        self.register(Tool("speak", ToolCategory.AUDIO, "Text to speech", audio.speak, "low"))
        self.register(Tool("listen", ToolCategory.AUDIO, "Speech to text", audio.listen, "low"))
        
        # Web
        self.register(Tool("scrape_url", ToolCategory.BROWSER, "Scrape website", web.scrape_url, "high"))
    
    def register(self, tool: Tool):
        self.tools[tool.name] = tool
        print(f"✅ Registered tool: {tool.name}")
    
    def get(self, name: str) -> Tool:
        return self.tools.get(name)
    
    def execute(self, name: str, **kwargs) -> Any:
        tool = self.get(name)
        if not tool:
            return f"Tool '{name}' not found"
        
        try:
            return tool.func(**kwargs)
        except Exception as e:
            return f"Error: {str(e)}"

# Initialize
tools = ToolRegistry()
