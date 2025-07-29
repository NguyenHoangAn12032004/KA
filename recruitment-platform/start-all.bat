@echo off
echo ===================================================
echo Starting Recruitment Platform (Backend + Frontend)
echo ===================================================

echo.
echo [1/3] Running data synchronization...
cd backend
call node sync-jobs.js
echo.

echo [2/3] Starting backend server...
start cmd /k "cd backend && npm run dev"
echo.

echo [3/3] Starting frontend server...
start cmd /k "cd frontend && npm start"
echo.

echo ===================================================
echo All services started! Open http://localhost:3000
echo =================================================== 