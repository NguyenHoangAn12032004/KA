@echo off
echo === Restarting Backend and Frontend ===

echo.
echo [1/4] Stopping any running servers...
taskkill /f /im node.exe >nul 2>&1

echo.
echo [2/4] Starting Backend...
start cmd /k "cd backend && npm run dev"

echo.
echo [3/4] Starting Frontend...
start cmd /k "cd frontend && npm start"

echo.
echo [4/4] Opening test dashboard...
timeout /t 5 >nul
start "" "http://localhost:5000/test-dashboard.html"

echo.
echo === All services started ===
echo. 