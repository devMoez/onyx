@echo off
REM ONYX System Startup Script for Windows

echo.
echo ========================================
echo   ONYX - Autonomous AI System
echo   Starting Phase 4 Build...
echo ========================================
echo.

REM Check if node is installed
where /q npm
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js from https://nodejs.org
    exit /b 1
)

REM Check if Python is installed
where /q python
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.11+
    exit /b 1
)

echo ✓ Dependencies found
echo.

REM Start Backend
echo 📦 Starting FastAPI Backend...
cd /d C:\onyx
start "ONYX Backend" cmd /k "python -m uvicorn main:app --host localhost --port 8000 --reload"

REM Wait for backend to start
timeout /t 3 /nobreak

REM Start Frontend
echo.
echo ⚛️  Starting React Frontend...
cd /d C:\onyx\frontend
if not exist node_modules (
    echo 📥 Installing dependencies...
    call npm install -q
)
start "ONYX Frontend" cmd /k "npm run dev"

REM Wait a moment and open browser
timeout /t 3 /nobreak

echo.
echo ========================================
echo   ✅ ONYX System Started!
echo ========================================
echo.
echo   📊 Dashboard: http://localhost:3000
echo   🔌 Backend API: http://localhost:8000
echo   📚 API Docs: http://localhost:8000/docs
echo.
echo   Press Ctrl+C to stop
echo ========================================
echo.

REM Open in browser
start http://localhost:3000
