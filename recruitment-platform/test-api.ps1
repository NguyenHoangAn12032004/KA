# Test API using PowerShell
Write-Host "🚀 Testing Recruitment Platform API..." -ForegroundColor Green

try {
    # Test health endpoint
    Write-Host "`nTesting /health endpoint..." -ForegroundColor Yellow
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
    Write-Host "✅ Health check successful!" -ForegroundColor Green
    $healthResponse | ConvertTo-Json -Depth 3

    # Test root endpoint  
    Write-Host "`nTesting / endpoint..." -ForegroundColor Yellow
    $rootResponse = Invoke-RestMethod -Uri "http://localhost:5000/" -Method GET
    Write-Host "✅ Root endpoint successful!" -ForegroundColor Green
    $rootResponse | ConvertTo-Json -Depth 3

    # Test login with demo admin
    Write-Host "`nTesting admin login..." -ForegroundColor Yellow
    $loginData = @{
        email = "admin@recruitment.com"
        password = "admin123"
    }
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ Admin login successful!" -ForegroundColor Green
    Write-Host "Token received: $($loginResponse.data.token.Substring(0,20))..." -ForegroundColor Cyan

    # Test get jobs
    Write-Host "`nTesting jobs endpoint..." -ForegroundColor Yellow
    $jobsResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/jobs" -Method GET
    Write-Host "✅ Jobs endpoint successful!" -ForegroundColor Green
    Write-Host "Found $($jobsResponse.data.Count) jobs" -ForegroundColor Cyan

    Write-Host "`n🎉 All API tests passed!" -ForegroundColor Green

} catch {
    Write-Host "❌ API test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the backend server is running on http://localhost:5000" -ForegroundColor Yellow
}
