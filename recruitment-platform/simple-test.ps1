# Simple API Test Script
Write-Host "Testing Recruitment Platform API..." -ForegroundColor Green

# Test root endpoint
try {
    Write-Host "Testing root endpoint..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "http://localhost:5000/" -UseBasicParsing
    Write-Host "Success: Root endpoint returned status $($response.StatusCode)" -ForegroundColor Green
    Write-Host $response.Content
} catch {
    Write-Host "Failed to test root endpoint: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" + "="*50 + "`n"

# Test login endpoint
try {
    Write-Host "Testing admin login..." -ForegroundColor Yellow
    $loginBody = '{"email":"admin@recruitment.com","password":"admin123"}'
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
    Write-Host "Success: Login returned status $($response.StatusCode)" -ForegroundColor Green
    Write-Host $response.Content
} catch {
    Write-Host "Failed to test login: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" + "="*50 + "`n"

# Test jobs endpoint
try {
    Write-Host "Testing jobs endpoint..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/jobs" -UseBasicParsing
    Write-Host "Success: Jobs endpoint returned status $($response.StatusCode)" -ForegroundColor Green
    Write-Host $response.Content
} catch {
    Write-Host "Failed to test jobs: $($_.Exception.Message)" -ForegroundColor Red
}
