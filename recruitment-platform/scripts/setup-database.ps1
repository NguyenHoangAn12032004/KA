#!/usr/bin/env pwsh

param(
    [string]$DatabaseName = "recruitment_platform",
    [string]$Username = "postgres",
    [string]$Host = "localhost",
    [int]$Port = 5432
)

Write-Host "🔧 Setup Recruitment Platform Database" -ForegroundColor Green
Write-Host ""

# Function to check if command exists
function Test-Command($command) {
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Check if psql is available
if (-not (Test-Command "psql")) {
    Write-Host "❌ psql không được tìm thấy. Đảm bảo PostgreSQL đã được cài đặt và psql trong PATH." -ForegroundColor Red
    Write-Host "💡 Thêm PostgreSQL bin folder vào PATH: C:\Program Files\PostgreSQL\<version>\bin" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Thông tin Database:" -ForegroundColor Cyan
Write-Host "   Host: $Host" -ForegroundColor White
Write-Host "   Port: $Port" -ForegroundColor White  
Write-Host "   Username: $Username" -ForegroundColor White
Write-Host "   Database: $DatabaseName" -ForegroundColor White
Write-Host ""

# Prompt for password
$password = Read-Host "🔐 Nhập password cho user '$Username'" -AsSecureString
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $plainPassword

Write-Host "🔍 Kiểm tra kết nối PostgreSQL..." -ForegroundColor Yellow

# Test connection
try {
    $testResult = psql -h $Host -p $Port -U $Username -d postgres -c "SELECT version();" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Kết nối PostgreSQL thành công!" -ForegroundColor Green
    } else {
        Write-Host "❌ Không thể kết nối PostgreSQL: $testResult" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Lỗi kết nối PostgreSQL: $_" -ForegroundColor Red
    exit 1
}

# Check if database exists
Write-Host "🔍 Kiểm tra database '$DatabaseName'..." -ForegroundColor Yellow
$dbExists = psql -h $Host -p $Port -U $Username -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DatabaseName';" 2>$null

if ($dbExists -eq "1") {
    Write-Host "⚠️  Database '$DatabaseName' đã tồn tại." -ForegroundColor Yellow
    $overwrite = Read-Host "Bạn có muốn xóa và tạo lại? (y/N)"
    
    if ($overwrite -eq "y" -or $overwrite -eq "Y") {
        Write-Host "🗑️  Xóa database cũ..." -ForegroundColor Red
        psql -h $Host -p $Port -U $Username -d postgres -c "DROP DATABASE IF EXISTS $DatabaseName;" | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Đã xóa database cũ" -ForegroundColor Green
        } else {
            Write-Host "❌ Không thể xóa database cũ" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "⏭️  Sử dụng database hiện tại" -ForegroundColor Blue
        $skipCreate = $true
    }
}

# Create database if needed
if (-not $skipCreate) {
    Write-Host "🏗️  Tạo database '$DatabaseName'..." -ForegroundColor Blue
    psql -h $Host -p $Port -U $Username -d postgres -c "CREATE DATABASE $DatabaseName;" | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database '$DatabaseName' đã được tạo!" -ForegroundColor Green
    } else {
        Write-Host "❌ Không thể tạo database" -ForegroundColor Red
        exit 1
    }
}

# Create .env file for backend
Write-Host "📝 Tạo file cấu hình .env..." -ForegroundColor Blue

$envContent = @"
# Database Configuration
DATABASE_URL="postgresql://$Username`:$plainPassword@$Host`:$Port/$DatabaseName"

# Server Configuration
PORT=8080
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-very-secure-jwt-secret-here-$(Get-Random)
JWT_EXPIRES_IN=24h

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here

# Security Configuration
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Upload Configuration
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,application/pdf

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log
"@

$envPath = Join-Path $PWD "backend\.env"
$envContent | Out-File -FilePath $envPath -Encoding UTF8

Write-Host "✅ File .env đã được tạo tại: $envPath" -ForegroundColor Green

# Setup backend dependencies and database
Write-Host "📦 Cài đặt backend dependencies..." -ForegroundColor Blue
Set-Location "backend"

try {
    npm install | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend dependencies đã được cài đặt" -ForegroundColor Green
    } else {
        Write-Host "❌ Lỗi cài đặt dependencies" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Lỗi: $_" -ForegroundColor Red
    exit 1
}

# Run Prisma migrations
Write-Host "🗃️  Chạy database migrations..." -ForegroundColor Blue
try {
    npx prisma migrate dev --name init | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database schema đã được tạo" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Migration có thể đã chạy trước đó" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Migration warning: $_" -ForegroundColor Yellow
}

# Generate Prisma client
Write-Host "🔧 Tạo Prisma client..." -ForegroundColor Blue
npx prisma generate | Out-Null

# Seed database (optional)
$seedData = Read-Host "🌱 Bạn có muốn tạo dữ liệu mẫu? (y/N)"
if ($seedData -eq "y" -or $seedData -eq "Y") {
    Write-Host "🌱 Tạo dữ liệu mẫu..." -ForegroundColor Blue
    npx prisma db seed | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dữ liệu mẫu đã được tạo" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Không thể tạo dữ liệu mẫu (có thể chưa có seed script)" -ForegroundColor Yellow
    }
}

Set-Location ".."

# Setup frontend dependencies  
Write-Host "🌐 Cài đặt frontend dependencies..." -ForegroundColor Blue
Set-Location "frontend"

try {
    npm install | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend dependencies đã được cài đặt" -ForegroundColor Green
    } else {
        Write-Host "❌ Lỗi cài đặt frontend dependencies" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Lỗi: $_" -ForegroundColor Red
}

Set-Location ".."

# Clear password from environment
$env:PGPASSWORD = ""

Write-Host ""
Write-Host "🎉 Setup hoàn tất!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Thông tin:" -ForegroundColor Cyan
Write-Host "   Database: $DatabaseName" -ForegroundColor White
Write-Host "   Backend Config: backend\.env" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Để khởi động hệ thống:" -ForegroundColor Yellow
Write-Host "   .\start-dev.ps1" -ForegroundColor White
Write-Host ""
Write-Host "⌨️  Nhấn bất kỳ phím nào để thoát..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
