# llm/gemini_cli.py
import subprocess
import json

class GeminiCLIClient:
    def __init__(self):
        self.available = self._check_availability()
    
    def _check_availability(self):
        try:
            result = subprocess.run(
                ["gemini-cli", "--version"],
                capture_output=True
            )
            return result.returncode == 0
        except FileNotFoundError:
            return False
    
    async def chat(self, message: str) -> str:
        result = subprocess.run(
            ["gemini-cli", "chat", "--message", message, "--output", "json"],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            data = json.loads(result.stdout)
            return data.get("text", "")
        return f"Error: {result.stderr}"
