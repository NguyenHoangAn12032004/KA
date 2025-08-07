#!/usr/bin/env pwsh

Write-Host "🚀 Khởi động Recruitment Platform Development Environment" -ForegroundColor Green
Write-Host ""

# Function to check if command exists
function Test-Command($command) {
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Check prerequisites
Write-Host "📋 Kiểm tra yêu cầu hệ thống..." -ForegroundColor Yellow

if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js không được tìm thấy. Vui lòng cài đặt Node.js từ https://nodejs.org/" -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "npm")) {
    Write-Host "❌ npm không được tìm thấy." -ForegroundColor Red
    exit 1
}

$nodeVersion = node --version
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green

# Check if PostgreSQL is running
Write-Host "🔍 Kiểm tra PostgreSQL..." -ForegroundColor Yellow
$pgProcess = Get-Process -Name postgres -ErrorAction SilentlyContinue
if ($pgProcess) {
    Write-Host "✅ PostgreSQL đang chạy" -ForegroundColor Green
} else {
    Write-Host "⚠️  PostgreSQL không được tìm thấy. Đảm bảo PostgreSQL đã được cài đặt và đang chạy." -ForegroundColor Yellow
}

# Check Redis (optional)
Write-Host "🔍 Kiểm tra Redis (tùy chọn)..." -ForegroundColor Yellow
$redisProcess = Get-Process -Name redis-server -ErrorAction SilentlyContinue
if ($redisProcess) {
    Write-Host "✅ Redis đang chạy" -ForegroundColor Green
} else {
    Write-Host "⚠️  Redis không được tìm thấy. Hệ thống sẽ hoạt động không có cache." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Khởi động services..." -ForegroundColor Cyan

# Start Backend
Write-Host "📦 Khởi động Backend Server..." -ForegroundColor Blue
Start-Process powershell -ArgumentList @(
    "-NoExit", 
    "-WindowStyle", "Normal",
    "-Command", 
    "cd '$PWD\backend'; Write-Host '🔥 Starting Backend on http://localhost:8080' -ForegroundColor Green; npm run dev"
)

# Wait for backend to start
Write-Host "⏳ Đợi Backend khởi động..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if backend is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Backend đã sẵn sàng!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend có thể cần thêm thời gian để khởi động..." -ForegroundColor Yellow
}

# Start Frontend
Write-Host "🌐 Khởi động Frontend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList @(
    "-NoExit", 
    "-WindowStyle", "Normal",
    "-Command", 
    "cd '$PWD\frontend'; Write-Host '🎨 Starting Frontend on http://localhost:3000' -ForegroundColor Green; npm start"
)

Write-Host ""
Write-Host "🎉 Hệ thống đang khởi động!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:8080" -ForegroundColor White
Write-Host "   API Docs: http://localhost:8080/api/health" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Để dừng servers, đóng các terminal windows đã mở" -ForegroundColor Gray
Write-Host ""
Write-Host "⌨️  Nhấn bất kỳ phím nào để thoát..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
