# ONYX - Autonomous Multi-Agent AI System

## Phase 4 Build Complete ✅

A fully autonomous, multi-agent AI system with:
- **React + Framer Motion** professional UI
- **FastAPI** backend with WebSocket support
- **Multi-Agent Orchestration** (Programmer, Researcher, Analyzer, Executor)
- **Intelligent Memory** system with semantic search
- **Learning System** for continuous improvement
- **Real-time** screen capture and voice control

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm

### Installation

```bash
cd C:\onyx

# Install Python dependencies
pip install -r requirements.txt

# Install Frontend dependencies
cd frontend
npm install
cd ..
```

### Running ONYX

#### On Windows:
```bash
start.bat
```

#### On Linux/Mac:
```bash
chmod +x start.sh
./start.sh
```

#### Or manually:

**Terminal 1 - Backend:**
```bash
cd C:\onyx
python -m uvicorn main:app --host localhost --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd C:\onyx\frontend
npm run dev
```

Then open: http://localhost:3000

## Architecture

### Backend (FastAPI)
- **Agents**: Programmer, Researcher, Analyzer, Executor
- **Swarm**: Multi-agent coordination with load balancing
- **Memory**: Chroma vector DB + SQLite categorized storage
- **Learning**: Failure analysis and continuous improvement
- **Safety**: Risk assessment and approval workflows

### Frontend (React + Framer Motion)
- **5 Tabs**: Chat, Artifacts, Terminal, Screen, Voice
- **Real-time Updates**: WebSocket streaming
- **Smooth Animations**: Framer Motion transitions
- **Dark Theme**: Professional modern UI

## API Endpoints

### WebSocket
- `ws://localhost:8000/ws/stream` - Real-time message streaming

### REST API
- `POST /api/task/submit` - Submit a task
- `GET /api/mode` - Get current mode
- `POST /api/mode/set` - Set AUTO/MANUAL mode
- `GET /api/status` - Get system status
- `GET /api/screen/capture` - Capture screen
- `POST /api/voice/listen` - Speech recognition
- `POST /api/voice/speak` - Text to speech

### Documentation
- `http://localhost:8000/docs` - Interactive API docs (Swagger UI)

## Features

### 🤖 Agents
- **ProgrammerAgent**: Code generation with research→plan→code→test→optimize
- **ResearcherAgent**: Information gathering and analysis
- **AnalyzerAgent**: Code quality analysis and testing
- **ExecutorAgent**: Command execution and package management
- **SupervisorAgent**: Task decomposition and agent coordination

### 🧠 Intelligence
- **Semantic Memory**: Fast (<100ms) retrieval with categorization
- **Pattern Recognition**: Learn from failures and successes
- **Auto-Improvement**: Self-learning feedback loops
- **Knowledge Base**: Persistent learning across sessions

### 🎮 Interface
- **Chat Tab**: Real-time message streaming
- **Artifacts Tab**: Generated code, files, images
- **Terminal Tab**: Live command output
- **Screen Tab**: Real-time screen capture
- **Voice Tab**: Speech recognition and TTS

### ⚙️ System
- **Auto Mode**: Execute tasks autonomously
- **Manual Mode**: Require approval for risky actions
- **Session Management**: Persistent state across reconnections
- **WebSocket Streaming**: Real-time updates

## Development

### Project Structure
```
C:\onyx\
├── agents/              # AI agents (base, programmer, specialized, swarm, learning, supervisor)
├── core/                # Core components (session, state, safety, graph)
├── memory/              # Memory system (chroma_handler, memory_manager)
├── tools/               # Tool management (registry, vision, audio)
├── llm/                 # LLM routing
├── frontend/            # React dashboard
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── index.html
│   └── package.json
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── start.bat            # Windows startup script
└── start.sh             # Linux/Mac startup script
```

### Component Overview

**Backend Components** (231 KB Python code):
- 5 AI agents with async execution
- Multi-agent swarm coordination
- Categorized memory with caching
- Dynamic tool registry
- Vision and audio capture
- Safety and risk assessment

**Frontend Components** (React + TypeScript):
- 5 interactive tabs
- Real-time WebSocket messaging
- Smooth animations with Framer Motion
- Responsive dark theme UI

## Configuration

### Backend Config (config.py)
- `OLLAMA_URL`: Local LLM endpoint
- `CACHE_TTL`: Memory cache duration
- `MAX_HISTORY`: Memory history size
- `LOG_LEVEL`: Logging verbosity

### Frontend Config (vite.config.ts)
- API proxy to http://localhost:8000
- WebSocket proxy to ws://localhost:8000
- Development server on port 3000

## Testing

Run the integration test suite:
```bash
cd C:\onyx
pytest tests/test_phase4_integration.py -v
```

## Troubleshooting

### Port already in use
```bash
# Find process using port 8000 or 3000
netstat -ano | findstr :8000
# Kill process
taskkill /PID <PID> /F
```

### Python module not found
```bash
pip install -r requirements.txt --force-reinstall
```

### Frontend won't connect
- Check backend is running on http://localhost:8000
- Check CORS configuration in main.py
- Clear browser cache (Ctrl+Shift+Del)

## License

ONYX - Autonomous AI System v1.0

---

**Built with** ❤️ using Python, FastAPI, React, and Framer Motion
