# Quick Sample Data Creation Commands
# Copy and paste these commands one section at a time

Write-Host "`n=== STEP 1: LOGIN AND GET TOKEN ===" -ForegroundColor Cyan
Write-Host "Run this first to get authenticated:" -ForegroundColor Yellow
Write-Host @'
$loginBody = @{email="admin@test.com"; password="Admin123!"} | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.tokens.accessToken
$headers = @{Authorization = "Bearer $token"}
Write-Host "Token obtained successfully!" -ForegroundColor Green
'@

Write-Host "`n=== STEP 2: CREATE PRODUCTS ===" -ForegroundColor Cyan
Write-Host "Run these one by one:" -ForegroundColor Yellow

Write-Host "`n# Product 1: MacBook Pro"
Write-Host @'
$p1 = @{name="MacBook Pro 16-inch"; description="High-performance laptop"; sku="LAPTOP-001"; dailyRate=75; weeklyRate=450; monthlyRate=1500; depositAmount=800; quantity=8; availableQuantity=8} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method Post -Body $p1 -Headers $headers -ContentType "application/json"
'@

Write-Host "`n# Product 2: Projector"
Write-Host @'
$p2 = @{name="4K HD Projector"; description="Professional 4K projector"; sku="PROJ-001"; dailyRate=95; weeklyRate=550; monthlyRate=1800; depositAmount=500; quantity=5; availableQuantity=5} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method Post -Body $p2 -Headers $headers -ContentType "application/json"
'@

Write-Host "`n# Product 3: Standing Desk"
Write-Host @'
$p3 = @{name="Standing Desk - Electric"; description="Motorized height-adjustable desk"; sku="DESK-001"; dailyRate=35; weeklyRate=200; monthlyRate=650; depositAmount=300; quantity=12; availableQuantity=12} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method Post -Body $p3 -Headers $headers -ContentType "application/json"
'@

Write-Host "`n=== STEP 3: CREATE CUSTOMERS ===" -ForegroundColor Cyan
Write-Host "Run these one by one:" -ForegroundColor Yellow

Write-Host "`n# Customer 1: Tech Company"
Write-Host @'
$c1 = @{name="Tech Innovations Inc."; email="contact@techinnovations.com"; phone="+1-555-0101"; address="456 Silicon Valley Blvd, San Francisco, CA"; customerType="business"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/customers" -Method Post -Body $c1 -Headers $headers -ContentType "application/json"
'@

Write-Host "`n# Customer 2: Individual"
Write-Host @'
$c2 = @{name="Sarah Johnson"; email="sarah.j@email.com"; phone="+1-555-0102"; address="789 Oak Street, New York, NY"; customerType="individual"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/customers" -Method Post -Body $c2 -Headers $headers -ContentType "application/json"
'@

Write-Host "`n=== STEP 4: TEST DASHBOARD ===" -ForegroundColor Cyan
Write-Host "Get dashboard stats:" -ForegroundColor Yellow
Write-Host @'
Invoke-RestMethod -Uri "http://localhost:3000/api/dashboard/stats" -Headers $headers
'@

Write-Host "`n=== DONE! ===" -ForegroundColor Green
Write-Host "Now open browser to http://localhost:5173 and login!" -ForegroundColor Cyan
