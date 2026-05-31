# llm/router.py
import json
import os
import subprocess
import requests
from typing import Optional, Dict, Any, List
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
            "gemini": os.getenv("GEMINI_API_KEY", ""),
            "cloudflare_token": os.getenv("CLOUDFLARE_API_TOKEN", ""),
            "cloudflare_account_id": os.getenv("CLOUDFLARE_ACCOUNT_ID", "")
        }
        self.models = {
            "openai": "gpt-4o",
            "claude": "claude-3-5-sonnet-20240620",
            "deepseek": "deepseek-chat",
            "gemini": "gemini-1.5-flash",
            "cloudflare": "@cf/meta/llama-3-8b-instruct"
        }
        self.current_provider = "copilot"
        self.copilot = GitHubCopilotClient()
        self.gemini_cli = GeminiCLIClient()

    def update_keys(self, keys: Dict[str, str]):
        self.api_keys.update(keys)

    def update_models(self, models: Dict[str, str]):
        self.models.update(models)

    def set_provider(self, provider: str):
        self.current_provider = provider

    def list_models(self, provider: str) -> List[str]:
        """Fetch available models for a given provider"""
        try:
            if provider == "openai":
                client = openai.OpenAI(api_key=self.api_keys.get("openai"))
                return [m.id for m in client.models.list() if "gpt" in m.id]
            elif provider == "gemini":
                # Static list for Gemini as SDK listing is often restricted
                return ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"]
            elif provider == "claude":
                return ["claude-3-5-sonnet-20240620", "claude-3-opus-20240229", "claude-3-haiku-20240307"]
            elif provider == "cloudflare":
                # Assuming standard meta llama models for now
                return ["@cf/meta/llama-3-8b-instruct", "@cf/meta/llama-3-70b-instruct", "@cf/mistral/mistral-7b-instruct-v0.1"]
            elif provider == "deepseek":
                return ["deepseek-chat", "deepseek-coder"]
            return ["default"]
        except Exception:
            return ["default"]

    async def chat(self, message: str) -> str:
        provider = self.current_provider
        
        try:
            if provider == "copilot":
                if self.copilot.available: return await self.copilot.chat(message)
                return "GitHub Copilot CLI not available/authenticated. Please authorize in Settings."
            
            elif provider == "gemini_cli":
                if self.gemini_cli.available: return await self.gemini_cli.chat(message)
                return "Gemini CLI not available/authenticated. Please check your credentials."
            
            elif provider == "openai":
                key = self.api_keys.get("openai")
                if not key: return "OpenAI API key missing. Please enter it in Settings."
                client = openai.OpenAI(api_key=key)
                try:
                    response = client.chat.completions.create(
                        model=self.models.get("openai", "gpt-4o"),
                        messages=[{"role": "user", "content": message}]
                    )
                    return response.choices[0].message.content
                except openai.RateLimitError:
                    return "OpenAI Error: Quota exceeded or rate limit hit."
                except openai.AuthenticationError:
                    return "OpenAI Error: Invalid API key."
                except Exception as e:
                    return f"OpenAI Error: {str(e)}"
            
            elif provider == "claude":
                key = self.api_keys.get("claude")
                if not key: return "Claude API key missing. Please enter it in Settings."
                client = anthropic.Anthropic(api_key=key)
                try:
                    response = client.messages.create(
                        model=self.models.get("claude", "claude-3-5-sonnet-20240620"),
                        max_tokens=1024,
                        messages=[{"role": "user", "content": message}]
                    )
                    return response.content[0].text
                except anthropic.RateLimitError:
                    return "Claude Error: Quota exceeded or rate limit hit."
                except anthropic.AuthenticationError:
                    return "Claude Error: Invalid API key."
                except Exception as e:
                    return f"Claude Error: {str(e)}"
            
            elif provider == "deepseek":
                key = self.api_keys.get("deepseek")
                if not key: return "DeepSeek API key missing. Please enter it in Settings."
                client = openai.OpenAI(api_key=key, base_url="https://api.deepseek.com")
                try:
                    response = client.chat.completions.create(
                        model=self.models.get("deepseek", "deepseek-chat"),
                        messages=[{"role": "user", "content": message}]
                    )
                    return response.choices[0].message.content
                except Exception as e:
                    return f"DeepSeek Error: {str(e)}"
            
            elif provider == "gemini":
                key = self.api_keys.get("gemini")
                if not key: return "Gemini API key missing. Please enter it in Settings."
                client = openai.OpenAI(
                    api_key=key,
                    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
                )
                try:
                    response = client.chat.completions.create(
                        model=self.models.get("gemini", "gemini-1.5-flash"),
                        messages=[{"role": "user", "content": message}]
                    )
                    return response.choices[0].message.content
                except Exception as e:
                    return f"Gemini API Error: {str(e)}"
            
            elif provider == "cloudflare":
                token = self.api_keys.get("cloudflare_token")
                account_id = self.api_keys.get("cloudflare_account_id")
                if not token or not account_id: return "Cloudflare credentials missing."
                
                model = self.models.get("cloudflare", "@cf/meta/llama-3-8b-instruct")
                url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{model}"
                
                print(f"DEBUG: Cloudflare URL: {url}")
                try:
                    response = requests.post(
                        url,
                        headers={"Authorization": f"Bearer {token}"},
                        json={"messages": [{"role": "user", "content": message}]},
                        timeout=30
                    )
                    
                    print(f"DEBUG: Cloudflare Status: {response.status_code}")
                    if response.status_code == 401:
                        return "Cloudflare Error: Unauthorized (Invalid Token)."
                    elif response.status_code == 429:
                        return "Cloudflare Error: Rate limit exceeded."
                    elif response.status_code != 200:
                        return f"Cloudflare API Error ({response.status_code}): {response.text}"
                        
                    data = response.json()
                    if "result" in data and "response" in data["result"]:
                        return data["result"]["response"]
                    return f"Unexpected Cloudflare response format."
                except requests.exceptions.Timeout:
                    return "Cloudflare Error: Connection timed out."
                except Exception as e:
                    return f"Cloudflare Connection Error: {str(e)}"

            return f"Unknown provider: {provider}"
        
        except Exception as e:
            return f"LLM Routing Error ({provider}): {str(e)}"
