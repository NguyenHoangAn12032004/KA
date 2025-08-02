@echo off
echo Restarting Analytics API...

:: Kill existing analytics API processes
tasklist /fi "imagename eq node.exe" /fo table | find "simple-analytics-api" >nul
if %errorlevel% equ 0 (
    echo Stopping existing analytics API...
    FOR /F "tokens=2" %%A IN ('tasklist /fi "imagename eq node.exe" /fo list ^| find "PID:"') DO (
        taskkill /F /PID %%A >nul 2>&1
    )
    timeout /t 2 >nul
)

:: Start analytics API
echo Starting Analytics API with trends support...
cd /d "C:\KA\recruitment-platform\backend"
start "Analytics API" node simple-analytics-api.js

echo Analytics API restarted successfully!
timeout /t 3
