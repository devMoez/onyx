"""
ONYX Mock Backend Server - For Frontend Development/Demo

This provides mock endpoints to demonstrate the frontend without needing
the full FastAPI setup. Can be replaced with the real backend later.
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import asyncio
from datetime import datetime
from typing import Dict, Any
import threading
import time

class OnyxMockHandler(SimpleHTTPRequestHandler):
    """Mock handler for ONYX API endpoints"""
    
    # Mock data storage
    messages = []
    artifacts = []
    terminal_output = []
    mode = "AUTO"
    
    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/api/mode':
            self.send_json_response({"mode": self.mode})
        elif self.path == '/api/status':
            self.send_json_response({
                "status": "running",
                "agents": ["ProgrammerAgent", "ResearcherAgent", "AnalyzerAgent", "ExecutorAgent"],
                "memory": {"size": 42, "categories": 6},
                "mode": self.mode,
                "uptime": 123.45
            })
        elif self.path == '/api/screen/capture':
            # Return a small placeholder PNG in base64
            self.send_json_response({
                "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            })
        else:
            self.send_error(404)
    
    def do_POST(self):
        """Handle POST requests"""
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        
        if self.path == '/api/mode/set':
            try:
                data = json.loads(body)
                self.mode = data.get('mode', 'AUTO')
                self.send_json_response({"status": "ok", "mode": self.mode})
            except:
                self.send_error(400)
        elif self.path == '/api/voice/listen':
            self.send_json_response({
                "transcript": "Create a simple hello world program",
                "confidence": 0.95
            })
        elif self.path == '/api/voice/speak':
            try:
                data = json.loads(body)
                self.send_json_response({"status": "speaking", "text": data.get('text', '')})
            except:
                self.send_error(400)
        else:
            self.send_error(404)
    
    def send_json_response(self, data: Dict[str, Any], status: int = 200):
        """Send JSON response"""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()


def run_mock_server(port: int = 8000):
    """Run the mock backend server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, OnyxMockHandler)
    print(f"🔌 Mock Backend Server running on http://localhost:{port}")
    print(f"✓ API endpoints available for development")
    print()
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n⚠️ Mock server stopped")
        httpd.shutdown()


if __name__ == '__main__':
    run_mock_server()
