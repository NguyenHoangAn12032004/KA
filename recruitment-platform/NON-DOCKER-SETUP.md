# Hướng Dẫn Chạy Hệ Thống Không Cần Docker

## Yêu Cầu Hệ Thống

- Node.js (version 18+)
- PostgreSQL (phiên bản 12+)
- npm hoặc yarn

## Bước 1: Cài Đặt PostgreSQL

### Tải và Cài Đặt PostgreSQL
1. Tải PostgreSQL từ: https://www.postgresql.org/download/windows/
2. Cài đặt và ghi nhớ:
   - Username: postgres
   - Password: (mật khẩu bạn đặt)
   - Port: 5432

### Tạo Database
```sql
-- Kết nối với PostgreSQL bằng pgAdmin hoặc psql
CREATE DATABASE recruitment_platform;
```

## Bước 2: Cấu Hình Environment

Tạo file `.env` trong thư mục `backend`:
```env
# Database Configuration
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/recruitment_platform"

# Server Configuration
PORT=8080
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-very-secure-jwt-secret-here
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
```

## Bước 3: Cài Đặt và Chạy Backend

```powershell
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Chạy migrations
npx prisma migrate dev

# Tạo sample data (tùy chọn)
npx prisma db seed

# Chạy server
npm run dev
```

Backend sẽ chạy tại: http://localhost:8080

## Bước 4: Cài Đặt và Chạy Frontend

Mở terminal mới:

```powershell
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm start
```

Frontend sẽ chạy tại: http://localhost:3000

## Bước 5: Cấu Hình Redis (Tùy Chọn)

Redis sẽ tăng hiệu suất hệ thống nhưng không bắt buộc.

### Cách 1: Tải Redis từ GitHub
1. Tải Redis cho Windows: https://github.com/tporadowski/redis/releases
2. Giải nén và chạy `redis-server.exe`

### Cách 2: Sử dụng WSL
```powershell
# Cài đặt WSL nếu chưa có
wsl --install Ubuntu

# Trong WSL terminal
sudo apt update
sudo apt install redis-server
redis-server
```

### Nếu không có Redis
Hệ thống sẽ tự động detect và hoạt động bình thường không có cache.

## Kiểm Tra Hệ Thống

### Health Check
```
GET http://localhost:8080/api/health
```

### Test API
```
GET http://localhost:8080/api/users
```

### Test Frontend
Truy cập: http://localhost:3000

## Script Tự Động (Tùy Chọn)

Tạo file `start-dev.ps1`:
```powershell
# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Wait a bit
Start-Sleep -Seconds 3

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"

Write-Host "Hệ thống đang khởi động..."
Write-Host "Backend: http://localhost:8080"
Write-Host "Frontend: http://localhost:3000"
```

Chạy:
```powershell
.\start-dev.ps1
```

## Troubleshooting

### Lỗi Database Connection
- Kiểm tra PostgreSQL đã chạy
- Kiểm tra DATABASE_URL trong .env
- Chạy: `npx prisma db push`

### Lỗi Port đã sử dụng
```powershell
# Kiểm tra port đang sử dụng
netstat -ano | findstr :8080
netstat -ano | findstr :3000

# Kill process nếu cần
taskkill /PID <process_id> /F
```

### Lỗi Dependencies
```powershell
# Xóa node_modules và cài lại
rm -rf node_modules
rm package-lock.json
npm install
```

## Tính Năng Hoạt Động

✅ API Authentication & Authorization
✅ Real-time Notifications (Socket.IO)
✅ AI Features (Gemini Integration)
✅ Progressive Web App (PWA)
✅ Advanced Security & Rate Limiting
✅ Request Logging & Monitoring
✅ Health Checks
✅ File Upload
⚠️ Redis Caching (tùy chọn)

## Ghi Chú

- Hệ thống sẽ hoạt động đầy đủ tính năng ngay cả khi không có Redis
- Các tính năng AI cần GEMINI_API_KEY hợp lệ
- PWA features sẽ hoạt động khi truy cập qua HTTPS trong production
