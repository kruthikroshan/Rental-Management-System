# Test script for Rental Management API
# Make sure the server is running before executing this script

Write-Host "🧪 Testing Rental Management API Endpoints" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get
    Write-Host "✅ Health Check PASSED" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    $response | ConvertTo-Json | Write-Host
} catch {
    Write-Host "❌ Health Check FAILED: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Root Endpoint
Write-Host "2. Testing Root Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/" -Method Get
    Write-Host "✅ Root Endpoint PASSED" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    $response | ConvertTo-Json | Write-Host
} catch {
    Write-Host "❌ Root Endpoint FAILED: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: User Registration
Write-Host "3. Testing User Registration..." -ForegroundColor Yellow
try {
    $body = @{
        name = "Test User"
        email = "test$(Get-Random)@example.com"
        password = "Test123!"
        role = "customer"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ User Registration PASSED" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    $response | ConvertTo-Json -Depth 5 | Write-Host
    
    # Save token for later tests
    $global:token = $response.token
} catch {
    Write-Host "❌ User Registration FAILED: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: User Login
Write-Host "4. Testing User Login..." -ForegroundColor Yellow
try {
    $body = @{
        email = "admin@example.com"
        password = "admin123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ User Login PASSED" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    $response | ConvertTo-Json -Depth 5 | Write-Host
    
    # Save token for authenticated requests
    $global:authToken = $response.token
} catch {
    Write-Host "⚠️  User Login FAILED (expected if no admin user exists): $_" -ForegroundColor Yellow
}
Write-Host ""

# Test 5: Dashboard Stats (requires authentication)
if ($global:authToken) {
    Write-Host "5. Testing Dashboard Stats..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $global:authToken"
        }
        $response = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/stats" -Method Get -Headers $headers
        Write-Host "✅ Dashboard Stats PASSED" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Gray
        $response | ConvertTo-Json -Depth 5 | Write-Host
    } catch {
        Write-Host "❌ Dashboard Stats FAILED: $_" -ForegroundColor Red
    }
    Write-Host ""
} else {
    Write-Host "5. Skipping Dashboard Stats (no auth token)" -ForegroundColor Gray
    Write-Host ""
}

# Test 6: Products List (public endpoint)
Write-Host "6. Testing Products List..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method Get
    Write-Host "✅ Products List PASSED" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    $response | ConvertTo-Json -Depth 3 | Write-Host
} catch {
    Write-Host "❌ Products List FAILED: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🎉 API Testing Complete!" -ForegroundColor Cyan
