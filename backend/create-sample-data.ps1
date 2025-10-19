# Sample Data Creation Script for Rental Management System
# This script creates sample products, categories, and customers

Write-Host "`nCreating Sample Data for Rental Management System" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Step 1: Login and get token
Write-Host "Step 1: Logging in..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@test.com"
        password = "Admin123!"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.tokens.accessToken
    $headers = @{Authorization = "Bearer $token"}
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "   User: $($loginResponse.data.user.name)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Create Categories
Write-Host "Step 2: Creating Product Categories..." -ForegroundColor Yellow

$categories = @(
    @{
        name = "Electronics"
        description = "Electronic devices and gadgets for rent"
        isActive = $true
    },
    @{
        name = "Furniture"
        description = "Office and home furniture rentals"
        isActive = $true
    },
    @{
        name = "Event Equipment"
        description = "Equipment for events, parties, and conferences"
        isActive = $true
    }
)

$createdCategories = @()
foreach ($category in $categories) {
    try {
        $categoryBody = $category | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/products/categories" -Method Post -Body $categoryBody -Headers $headers -ContentType "application/json"
        $createdCategories += $response.data
        Write-Host "   ✅ Created category: $($category.name)" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Category '$($category.name)' may already exist or error: $_" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 3: Create Products
Write-Host "Step 3: Creating Sample Products..." -ForegroundColor Yellow

$products = @(
    @{
        name = "MacBook Pro 16-inch"
        description = "High-performance laptop with M2 Pro chip, 16GB RAM, 512GB SSD. Perfect for development and creative work."
        sku = "LAPTOP-MBP-001"
        category = "Electronics"
        dailyRate = 75.00
        weeklyRate = 450.00
        monthlyRate = 1500.00
        depositAmount = 800.00
        quantity = 8
        availableQuantity = 8
        minRentalPeriod = 1
        maxRentalPeriod = 90
        condition = "excellent"
        specifications = @{
            processor = "Apple M2 Pro"
            ram = "16GB"
            storage = "512GB SSD"
            display = "16-inch Retina"
        }
        images = @("https://example.com/macbook.jpg")
        tags = @("laptop", "apple", "development", "creative")
    },
    @{
        name = "4K HD Projector"
        description = "Professional 4K UHD projector with 3000 lumens brightness. Ideal for presentations, events, and home theater."
        sku = "PROJ-4K-001"
        category = "Electronics"
        dailyRate = 95.00
        weeklyRate = 550.00
        monthlyRate = 1800.00
        depositAmount = 500.00
        quantity = 5
        availableQuantity = 5
        minRentalPeriod = 1
        maxRentalPeriod = 30
        condition = "excellent"
        specifications = @{
            resolution = "4K UHD (3840x2160)"
            brightness = "3000 lumens"
            connectivity = "HDMI, USB, WiFi"
        }
        images = @("https://example.com/projector.jpg")
        tags = @("projector", "4k", "presentation", "events")
    },
    @{
        name = "Standing Desk - Electric"
        description = "Motorized height-adjustable standing desk (48x30 inches). Memory presets for preferred heights."
        sku = "DESK-STAND-001"
        category = "Furniture"
        dailyRate = 35.00
        weeklyRate = 200.00
        monthlyRate = 650.00
        depositAmount = 300.00
        quantity = 12
        availableQuantity = 12
        minRentalPeriod = 7
        maxRentalPeriod = 180
        condition = "good"
        specifications = @{
            dimensions = "48x30 inches"
            heightRange = "28-48 inches"
            weightCapacity = "200 lbs"
            motor = "Electric dual motor"
        }
        images = @("https://example.com/standing-desk.jpg")
        tags = @("desk", "furniture", "office", "ergonomic")
    },
    @{
        name = "Conference Room Package"
        description = "Complete conference room setup: 10 ergonomic chairs, 8ft table, whiteboard, and flip chart."
        sku = "CONF-PKG-001"
        category = "Furniture"
        dailyRate = 150.00
        weeklyRate = 900.00
        monthlyRate = 3000.00
        depositAmount = 1000.00
        quantity = 3
        availableQuantity = 3
        minRentalPeriod = 1
        maxRentalPeriod = 90
        condition = "excellent"
        specifications = @{
            chairs = "10 ergonomic office chairs"
            table = "8ft conference table"
            extras = "Whiteboard and flip chart"
        }
        images = @("https://example.com/conference-package.jpg")
        tags = @("conference", "meeting", "office", "package")
    },
    @{
        name = "Professional Sound System"
        description = "Complete PA system with speakers, mixer, microphones, and cables. Perfect for events up to 200 people."
        sku = "SOUND-PRO-001"
        category = "Event Equipment"
        dailyRate = 125.00
        weeklyRate = 700.00
        monthlyRate = 2200.00
        depositAmount = 600.00
        quantity = 4
        availableQuantity = 4
        minRentalPeriod = 1
        maxRentalPeriod = 14
        condition = "excellent"
        specifications = @{
            speakers = "2x 15-inch powered speakers"
            mixer = "16-channel digital mixer"
            microphones = "4x wireless microphones"
            power = "2000W total"
        }
        images = @("https://example.com/sound-system.jpg")
        tags = @("audio", "sound", "events", "professional")
    },
    @{
        name = "LED Photography Lighting Kit"
        description = "Professional 3-light LED setup with stands, diffusers, and carrying case."
        sku = "LIGHT-LED-001"
        category = "Event Equipment"
        dailyRate = 45.00
        weeklyRate = 250.00
        monthlyRate = 800.00
        depositAmount = 200.00
        quantity = 6
        availableQuantity = 6
        minRentalPeriod = 1
        maxRentalPeriod = 30
        condition = "excellent"
        specifications = @{
            lights = "3x LED panels (100W each)"
            temperature = "3200K-5600K adjustable"
            stands = "3x light stands (up to 7ft)"
            extras = "Diffusers and carrying case"
        }
        images = @("https://example.com/lighting-kit.jpg")
        tags = @("lighting", "photography", "video", "led")
    }
)

$createdProducts = @()
foreach ($product in $products) {
    try {
        $productBody = $product | ConvertTo-Json -Depth 5
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method Post -Body $productBody -Headers $headers -ContentType "application/json"
        $createdProducts += $response.data
        Write-Host "   ✅ Created product: $($product.name)" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Product '$($product.name)' error: $_" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 4: Create Customers
Write-Host "Step 4: Creating Sample Customers..." -ForegroundColor Yellow

$customers = @(
    @{
        name = "Tech Innovations Inc."
        email = "contact@techinnovations.com"
        phone = "+1-555-0101"
        address = "456 Silicon Valley Blvd, San Francisco, CA 94102"
        customerType = "business"
        companyName = "Tech Innovations Inc."
        taxId = "12-3456789"
        creditLimit = 10000.00
        notes = "Regular client, always pays on time. Prefers monthly rentals."
    },
    @{
        name = "Sarah Johnson"
        email = "sarah.johnson@email.com"
        phone = "+1-555-0102"
        address = "789 Oak Street, Apt 4B, New York, NY 10001"
        customerType = "individual"
        creditLimit = 3000.00
        notes = "Freelance photographer, rents lighting equipment frequently."
    },
    @{
        name = "Event Masters LLC"
        email = "bookings@eventmasters.com"
        phone = "+1-555-0103"
        address = "321 Event Plaza, Suite 200, Chicago, IL 60601"
        customerType = "business"
        companyName = "Event Masters LLC"
        taxId = "98-7654321"
        creditLimit = 15000.00
        notes = "Event planning company. Large orders, needs quick turnaround."
    },
    @{
        name = "Michael Chen"
        email = "m.chen@workspace.com"
        phone = "+1-555-0104"
        address = "567 Downtown Ave, Seattle, WA 98101"
        customerType = "individual"
        creditLimit = 5000.00
        notes = "Remote worker, rents office furniture for home office setup."
    },
    @{
        name = "Digital Creative Studio"
        email = "studio@digitalcreative.com"
        phone = "+1-555-0105"
        address = "890 Creative Lane, Austin, TX 73301"
        customerType = "business"
        companyName = "Digital Creative Studio"
        taxId = "45-6789012"
        creditLimit = 8000.00
        notes = "Video production company. Regular rentals of AV equipment."
    }
)

$createdCustomers = @()
foreach ($customer in $customers) {
    try {
        $customerBody = $customer | ConvertTo-Json -Depth 5
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/customers" -Method Post -Body $customerBody -Headers $headers -ContentType "application/json"
        $createdCustomers += $response.data
        Write-Host "   ✅ Created customer: $($customer.name)" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Customer '$($customer.name)' error: $_" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 5: Summary
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "Sample Data Creation Complete!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "   Categories created: $($categories.Count)" -ForegroundColor White
Write-Host "   Products created: $($products.Count)" -ForegroundColor White
Write-Host "   Customers created: $($customers.Count)" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Open browser to http://localhost:5173" -ForegroundColor White
Write-Host "   2. Login with: admin@test.com / Admin123!" -ForegroundColor White
Write-Host "   3. Check Dashboard for updated statistics" -ForegroundColor White
Write-Host "   4. Browse Products page to see all items" -ForegroundColor White
Write-Host "   5. Browse Customers page to see all customers" -ForegroundColor White
Write-Host ""
