# Sample Data Creation Script
# Run this after both servers are running

Write-Host "`n=== Creating Sample Data for Rental Management System ===" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173`n" -ForegroundColor Yellow

# Step 1: Login
Write-Host "Step 1: Logging in..." -ForegroundColor Cyan
try {
    $loginBody = @{
        email = "admin@test.com"
        password = "Admin123!"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    $token = $loginResponse.token
    Write-Host "Login successful!" -ForegroundColor Green
    Write-Host "User: $($loginResponse.data.user.name) ($($loginResponse.data.user.email))`n" -ForegroundColor Gray
} catch {
    Write-Host "Login failed: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Create Categories
Write-Host "Step 2: Creating categories..." -ForegroundColor Cyan
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$categories = @(
    @{ name = "Electronics"; description = "Electronic equipment and devices" },
    @{ name = "Furniture"; description = "Office and event furniture" },
    @{ name = "Event Equipment"; description = "Equipment for events and conferences" }
)

foreach ($cat in $categories) {
    try {
        $categoryBody = $cat | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/products/categories" -Method POST -Headers $headers -Body $categoryBody
        Write-Host "  - Created category: $($cat.name)" -ForegroundColor Green
    } catch {
        Write-Host "  - Failed to create category $($cat.name): $_" -ForegroundColor Yellow
    }
}

# Step 3: Create Products
Write-Host "`nStep 3: Creating products..." -ForegroundColor Cyan

$products = @(
    @{
        name = "MacBook Pro 16-inch"
        description = "High-performance laptop perfect for professional work and creative projects"
        category = "Electronics"
        rentalPrice = 75.00
        quantity = 8
        specifications = @{
            processor = "Apple M2 Pro"
            ram = "16GB"
            storage = "512GB SSD"
            screen = "16-inch Retina Display"
        }
    },
    @{
        name = "4K Professional Projector"
        description = "Ultra HD projector ideal for presentations and events"
        category = "Electronics"
        rentalPrice = 95.00
        quantity = 5
        specifications = @{
            resolution = "4K UHD (3840x2160)"
            brightness = "5000 lumens"
            connectivity = "HDMI, USB-C, Wireless"
        }
    },
    @{
        name = "Executive Standing Desk"
        description = "Adjustable height desk for modern workspaces"
        category = "Furniture"
        rentalPrice = 35.00
        quantity = 12
        specifications = @{
            dimensions = "72x30 inches"
            heightRange = "28-48 inches"
            material = "Bamboo top with steel frame"
        }
    }
)

foreach ($prod in $products) {
    try {
        $productBody = $prod | ConvertTo-Json -Depth 3
        $result = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/products" -Method POST -Headers $headers -Body $productBody
        Write-Host "  - Created product: $($prod.name) ($$$($prod.rentalPrice)/day)" -ForegroundColor Green
    } catch {
        Write-Host "  - Failed to create product $($prod.name): $_" -ForegroundColor Yellow
    }
}

# Step 4: Create Customers
Write-Host "`nStep 4: Creating customers..." -ForegroundColor Cyan

$customers = @(
    @{
        name = "Tech Innovations Inc"
        email = "contact@techinnovations.com"
        phone = "+1-555-0101"
        customerType = "business"
        address = "123 Innovation Drive, San Francisco, CA 94105"
    },
    @{
        name = "Sarah Johnson"
        email = "sarah.johnson@email.com"
        phone = "+1-555-0202"
        customerType = "individual"
        address = "456 Oak Street, Portland, OR 97201"
    },
    @{
        name = "Event Masters LLC"
        email = "info@eventmasters.com"
        phone = "+1-555-0303"
        customerType = "business"
        address = "789 Event Plaza, Austin, TX 78701"
    }
)

foreach ($cust in $customers) {
    try {
        $customerBody = $cust | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/customers" -Method POST -Headers $headers -Body $customerBody
        Write-Host "  - Created customer: $($cust.name) ($($cust.customerType))" -ForegroundColor Green
    } catch {
        Write-Host "  - Failed to create customer $($cust.name): $_" -ForegroundColor Yellow
    }
}

# Step 5: Test Dashboard
Write-Host "`nStep 5: Testing dashboard statistics..." -ForegroundColor Cyan
try {
    $stats = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/dashboard/stats" -Method GET -Headers $headers
    Write-Host "Dashboard Stats Retrieved Successfully!" -ForegroundColor Green
    Write-Host "  - Total Customers: $($stats.totalCustomers)" -ForegroundColor Gray
    Write-Host "  - Total Revenue: $$$($stats.totalRevenue)" -ForegroundColor Gray
    Write-Host "  - Active Rentals: $($stats.activeRentals)" -ForegroundColor Gray
} catch {
    Write-Host "Failed to retrieve dashboard stats: $_" -ForegroundColor Yellow
}

Write-Host "`n=== Sample Data Creation Complete! ===" -ForegroundColor Green
Write-Host "`nYou can now:" -ForegroundColor Cyan
Write-Host "  1. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host "  2. Login with: admin@test.com / Admin123!" -ForegroundColor White
Write-Host "  3. View the products, customers, and dashboard" -ForegroundColor White
Write-Host "`nHappy testing!" -ForegroundColor Yellow
