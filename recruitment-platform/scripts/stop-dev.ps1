#!/usr/bin/env pwsh

Write-Host "🛑 Dừng Recruitment Platform Development Environment" -ForegroundColor Red
Write-Host ""

# Function to kill processes by port
function Stop-ProcessByPort($port) {
    try {
        $connections = netstat -ano | Select-String ":$port "
        foreach ($connection in $connections) {
            $parts = $connection.ToString().Split(' ', [StringSplitOptions]::RemoveEmptyEntries)
            if ($parts.Length -gt 4) {
                $pid = $parts[-1]
                $processName = (Get-Process -Id $pid -ErrorAction SilentlyContinue).ProcessName
                if ($processName) {
                    Write-Host "🔸 Dừng $processName (PID: $pid) trên port $port" -ForegroundColor Yellow
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                }
            }
        }
    } catch {
        Write-Host "⚠️  Không thể dừng process trên port $port" -ForegroundColor Yellow
    }
}

# Stop Frontend (port 3000)
Write-Host "🌐 Dừng Frontend Server..." -ForegroundColor Blue
Stop-ProcessByPort 3000

# Stop Backend (port 8080)
Write-Host "📦 Dừng Backend Server..." -ForegroundColor Blue
Stop-ProcessByPort 8080

# Stop any remaining Node processes related to the project
Write-Host "🔍 Dừng các Node.js processes còn lại..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -like "*recruitment*" -or 
    $_.Path -like "*recruitment-platform*"
}

foreach ($process in $nodeProcesses) {
    Write-Host "🔸 Dừng Node.js process (PID: $($process.Id))" -ForegroundColor Yellow
    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
}

# Clean up any PowerShell windows that might be running dev servers
$psProcesses = Get-Process -Name powershell -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -like "*npm*" -or 
    $_.MainWindowTitle -like "*dev*" -or
    $_.MainWindowTitle -like "*recruitment*"
}

foreach ($process in $psProcesses) {
    if ($process.Id -ne $PID) {  # Don't kill current script
        Write-Host "🔸 Dừng PowerShell process (PID: $($process.Id))" -ForegroundColor Yellow
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "✅ Đã dừng tất cả development servers" -ForegroundColor Green
Write-Host ""

# Check if ports are free
Write-Host "📊 Kiểm tra trạng thái ports..." -ForegroundColor Cyan

$port3000 = netstat -ano | Select-String ":3000 " | Measure-Object
$port8080 = netstat -ano | Select-String ":8080 " | Measure-Object

if ($port3000.Count -eq 0) {
    Write-Host "✅ Port 3000 (Frontend) đã được giải phóng" -ForegroundColor Green
} else {
    Write-Host "⚠️  Port 3000 vẫn đang được sử dụng" -ForegroundColor Yellow
}

if ($port8080.Count -eq 0) {
    Write-Host "✅ Port 8080 (Backend) đã được giải phóng" -ForegroundColor Green
} else {
    Write-Host "⚠️  Port 8080 vẫn đang được sử dụng" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "💡 Nếu ports vẫn bị chiếm dụng, thử restart lại máy tính" -ForegroundColor Gray
Write-Host ""
Write-Host "⌨️  Nhấn bất kỳ phím nào để thoát..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
