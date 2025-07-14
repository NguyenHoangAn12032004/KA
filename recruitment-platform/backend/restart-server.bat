@echo off
echo Checking for existing node processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Starting development server...
cd /d C:\KA\recruitment-platform\backend
npm run dev
