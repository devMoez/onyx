@echo off
REM ONYX System Startup Script for Windows - AUTO-RELOAD MODE

echo.
echo ========================================
echo   ONYX - Autonomous AI System
echo   Mode: Development (Auto-Reload)
echo ========================================
echo.

REM Start Backend with --reload
echo [1/2] Starting FastAPI Backend (Port 8000)...
start /B "ONYX Backend" C:\Users\moezf\AppData\Local\Python\pythoncore-3.14-64\python.exe -m uvicorn main:app --host localhost --port 8000 --reload

REM Wait for backend
timeout /t 3 >nul

REM Start Frontend
echo [2/2] Starting React Frontend (Port 3000)...
cd onyx-frontend
start /B "ONYX Frontend" npm run dev

echo.
echo 🚀 ONYX System is running!
echo   🖥️  Dashboard: http://localhost:3000
echo   🔌 Backend API: http://localhost:8000
echo.
echo   [!] Note: Changes to Python or React files will restart the servers automatically.
echo.
pause
