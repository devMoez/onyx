# tools/tool_manager.py
import subprocess
import sys
import importlib
from typing import Dict, List, Any, Optional

class ToolManager:
    def __init__(self):
        self.tools = {}
        self.installed_packages = set()
        self._load_installed()
    
    def _load_installed(self):
        """Load list of installed pip packages"""
        try:
            result = subprocess.run(
                [sys.executable, "-m", "pip", "list", "--format=freeze"],
                capture_output=True,
                text=True
            )
            for line in result.stdout.split("\n"):
                if "==" in line:
                    pkg_name = line.split("==")[0].lower()
                    self.installed_packages.add(pkg_name)
        except:
            pass
    
    def is_installed(self, package_name: str) -> bool:
        """Check if a package is installed"""
        return package_name.lower() in self.installed_packages
    
    def install_package(self, package_name: str) -> bool:
        """Install a pip package automatically"""
        if self.is_installed(package_name):
            return True
        
        try:
            subprocess.run(
                [sys.executable, "-m", "pip", "install", package_name],
                capture_output=True,
                text=True,
                check=True
            )
            self.installed_packages.add(package_name.lower())
            return True
        except subprocess.CalledProcessError:
            return False
    
    def register_tool(self, name: str, tool_class, dependencies: List[str] = None):
        """Register a tool with optional dependency installation"""
        if dependencies:
            for dep in dependencies:
                if not self.is_installed(dep):
                    print(f"[ToolManager] Installing dependency: {dep}")
                    self.install_package(dep)
        
        self.tools[name] = tool_class
        print(f"[ToolManager] Registered tool: {name}")
    
    def get_tool(self, name: str):
        return self.tools.get(name)
    
    def list_tools(self) -> List[str]:
        return list(self.tools.keys())
    
    def execute_tool(self, name: str, **kwargs) -> Any:
        """Execute a registered tool"""
        tool = self.get_tool(name)
        if not tool:
            raise ValueError(f"Tool '{name}' not found")
        
        return tool(**kwargs)
    
    def get_stats(self) -> Dict:
        return {
            "registered_tools": len(self.tools),
            "installed_packages": len(self.installed_packages)
        }
