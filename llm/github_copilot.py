# llm/github_copilot.py
import subprocess
import json

class GitHubCopilotClient:
    def __init__(self):
        self.available = self._check_availability()
    
    def _check_availability(self):
        try:
            result = subprocess.run(
                ["copilot", "--version"],
                capture_output=True
            )
            return result.returncode == 0
        except FileNotFoundError:
            return False
    
    async def chat(self, message: str) -> str:
        """Send message to GitHub Copilot CLI"""
        result = subprocess.run(
            ["copilot", "chat", "--message", message, "--format", "json"],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            data = json.loads(result.stdout)
            return data.get("response", "")
        return f"Error: {result.stderr}"
