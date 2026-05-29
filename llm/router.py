# llm/router.py
import json
import os
import subprocess
from typing import Optional, Dict, Any
from .github_copilot import GitHubCopilotClient
from .gemini_cli import GeminiCLIClient
import openai
import anthropic

class LLMRouter:
    def __init__(self):
        self.api_keys = {
            "deepseek": os.getenv("DEEPSEEK_API_KEY", ""),
            "claude": os.getenv("CLAUDE_API_KEY", ""),
            "openai": os.getenv("OPENAI_API_KEY", ""),
            "gemini": os.getenv("GEMINI_API_KEY", "")
        }
        self.current_provider = "copilot"  # Default
        
        self.copilot = GitHubCopilotClient()
        self.gemini_cli = GeminiCLIClient()

    def update_keys(self, keys: Dict[str, str]):
        self.api_keys.update(keys)

    def set_provider(self, provider: str):
        self.current_provider = provider

    async def chat(self, message: str) -> str:
        provider = self.current_provider
        
        try:
            if provider == "copilot":
                if self.copilot.available:
                    return await self.copilot.chat(message)
                return "GitHub Copilot CLI not available. Please authorize in settings."
            
            elif provider == "gemini_cli":
                if self.gemini_cli.available:
                    return await self.gemini_cli.chat(message)
                return "Gemini CLI not available. Please authorize in settings."
            
            elif provider == "openai":
                key = self.api_keys.get("openai")
                if not key: return "OpenAI API key missing."
                client = openai.OpenAI(api_key=key)
                response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=[{"role": "user", "content": message}]
                )
                return response.choices[0].message.content
            
            elif provider == "claude":
                key = self.api_keys.get("claude")
                if not key: return "Claude API key missing."
                client = anthropic.Anthropic(api_key=key)
                response = client.messages.create(
                    model="claude-3-5-sonnet-20240620",
                    max_tokens=1024,
                    messages=[{"role": "user", "content": message}]
                )
                return response.content[0].text
            
            elif provider == "deepseek":
                key = self.api_keys.get("deepseek")
                if not key: return "DeepSeek API key missing."
                client = openai.OpenAI(api_key=key, base_url="https://api.deepseek.com")
                response = client.chat.completions.create(
                    model="deepseek-chat",
                    messages=[{"role": "user", "content": message}]
                )
                return response.choices[0].message.content
            
            elif provider == "gemini":
                key = self.api_keys.get("gemini")
                if not key: return "Gemini API key missing."
                # Simplified via openai-compatible or direct
                client = openai.OpenAI(
                    api_key=key,
                    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
                )
                response = client.chat.completions.create(
                    model="gemini-1.5-flash",
                    messages=[{"role": "user", "content": message}]
                )
                return response.choices[0].message.content

            return f"Unknown provider: {provider}"
        
        except Exception as e:
            return f"LLM Error ({provider}): {str(e)}"
