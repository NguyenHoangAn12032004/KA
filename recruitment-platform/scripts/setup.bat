@echo off
REM Setup script for Windows

echo 🚀 Setting up Recruitment Platform...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js is installed

REM Install root dependencies
echo 📦 Installing root dependencies...
call npm install

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
cd ..

REM Install frontend dependencies  
echo 📦 Installing frontend dependencies...
cd frontend
call npm install
cd ..

REM Copy environment file
echo ⚙️ Setting up environment variables...
copy backend\.env.example backend\.env

echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Edit backend\.env with your database credentials
echo 2. Run 'npm run dev' to start development servers  
echo 3. Or run 'docker-compose up' to start with Docker

pause
