#!/bin/bash

echo "🚀 Starting ONYX System..."
echo ""

# Backend
echo "📦 Starting FastAPI Backend on http://localhost:8000..."
cd C:\onyx
python main.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Frontend
echo "⚛️  Starting React Frontend on http://localhost:3000..."
cd C:\onyx\frontend
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ ONYX System Started!"
echo ""
echo "📊 Dashboard: http://localhost:3000"
echo "🔌 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop..."

wait $BACKEND_PID $FRONTEND_PID
