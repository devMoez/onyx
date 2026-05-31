# tools/skill_tools.py
import subprocess
import os
import json
from typing import Dict, Any, List, Callable
from enum import Enum

class ToolCategory:
    BROWSER = "browser"
    FILE = "file"
    CODE = "code"
    SHELL = "shell"

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
    
    def _register_default_tools(self):
        # File tools
        self.register(Tool(
            "read_file", ToolCategory.FILE,
            "Read file contents",
            lambda path: open(path, 'r', encoding='utf-8').read(),
            "low"
        ))
        
        self.register(Tool(
            "write_file", ToolCategory.FILE,
            "Write to file",
            lambda path, content: open(path, 'w', encoding='utf-8').write(content),
            "medium"
        ))
        
        self.register(Tool(
            "list_dir", ToolCategory.FILE,
            "List directory contents",
            lambda path: os.listdir(path),
            "low"
        ))
        
        self.register(Tool(
            "create_dir", ToolCategory.FILE,
            "Create directory",
            lambda path: os.makedirs(path, exist_ok=True),
            "medium"
        ))
        
        # Shell tools
        self.register(Tool(
            "run_cmd", ToolCategory.SHELL,
            "Run shell command",
            lambda cmd: subprocess.run(cmd, shell=True, capture_output=True, text=True).stdout,
            "high"
        ))
        
        self.register(Tool(
            "install_pip", ToolCategory.SHELL,
            "Install Python package",
            lambda pkg: subprocess.run(f"pip install {pkg}", shell=True, capture_output=True),
            "medium"
        ))
        
        # Code tools
        self.register(Tool(
            "exec_python", ToolCategory.CODE,
            "Execute Python code",
            lambda code: exec(code),
            "high"
        ))
        
        # JSON tools
        self.register(Tool(
            "parse_json", ToolCategory.CODE,
            "Parse JSON string",
            lambda data: json.loads(data),
            "low"
        ))
        
        self.register(Tool(
            "format_json", ToolCategory.CODE,
            "Format JSON data",
            lambda data: json.dumps(data, indent=2),
            "low"
        ))
    
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
    
    def list_all(self) -> Dict[str, str]:
        return {name: tool.description for name, tool in self.tools.items()}

# Initialize
tools = ToolRegistry()
