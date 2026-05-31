#!/bin/bash
# ONYX System Startup Script for Linux/Mac - AUTO-RELOAD MODE

echo -e "\n========================================"
echo "  ONYX - Autonomous AI System"
echo "  Mode: Development (Auto-Reload)"
echo -e "========================================\n"

# Start Backend with --reload
echo "[1/2] Starting FastAPI Backend (Port 8000)..."
python3 -m uvicorn main:app --host localhost --port 8000 --reload &

# Wait for backend
sleep 3

# Start Frontend
echo "[2/2] Starting React Frontend (Port 3000)..."
cd onyx-frontend && npm run dev &

echo -e "\n🚀 ONYX System is running!"
echo "  🖥️  Dashboard: http://localhost:3000"
echo "  🔌 Backend API: http://localhost:8000"
echo -e "\n  [!] Note: Changes to Python or React files will restart the servers automatically.\n"

# Keep script running
wait
