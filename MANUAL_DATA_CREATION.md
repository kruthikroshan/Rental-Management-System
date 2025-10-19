# Manual Data Creation Steps

The backend server is running but PowerShell scripts from the same terminal are having connectivity issues. Here's a simple manual approach:

## ✅ Current Status
- Backend: Running on http://localhost:3000
- Frontend: Running on http://localhost:5173  
- Database: MongoDB Atlas connected

## 🎯 Easiest Approach: Use the Frontend UI

### Step 1: Open the Application
1. Open your web browser
2. Go to: **http://localhost:5173**
3. You should see the login page

### Step 2: Login
- Email: `admin@test.com`
- Password: `Admin123!`

### Step 3: Create Products (via UI)
1. Click on "Products" in the sidebar
2. Click "Add Product" button
3. Create these products:

**Product 1: MacBook Pro**
- Name: MacBook Pro 16-inch
- Category: Electronics
- Description: High-performance laptop perfect for professional work
- Rental Price: 75
- Quantity: 8
- Specifications: {"processor": "Apple M2 Pro", "ram": "16GB", "storage": "512GB SSD"}

**Product 2: Projector**
- Name: 4K Professional Projector
- Category: Electronics  
- Description: Ultra HD projector ideal for presentations
- Rental Price: 95
- Quantity: 5
- Specifications: {"resolution": "4K UHD", "brightness": "5000 lumens"}

**Product 3: Standing Desk**
- Name: Executive Standing Desk
- Category: Furniture
- Description: Adjustable height desk for modern workspaces
- Rental Price: 35
- Quantity: 12
- Specifications: {"dimensions": "72x30 inches", "heightRange": "28-48 inches"}

### Step 4: Create Customers (via UI)
1. Click on "Customers" in the sidebar
2. Click "Add Customer" button
3. Create these customers:

**Customer 1:**
- Name: Tech Innovations Inc
- Email: contact@techinnovations.com
- Phone: +1-555-0101
- Type: Business
- Address: 123 Innovation Drive, San Francisco, CA 94105

**Customer 2:**
- Name: Sarah Johnson
- Email: sarah.johnson@email.com
- Phone: +1-555-0202
- Type: Individual
- Address: 456 Oak Street, Portland, OR 97201

**Customer 3:**
- Name: Event Masters LLC
- Email: info@eventmasters.com
- Phone: +1-555-0303
- Type: Business
- Address: 789 Event Plaza, Austin, TX 78701

### Step 5: Check Dashboard
1. Click on "Dashboard" in the sidebar
2. You should now see:
   - Total Customers: 3
   - Products available
   - Statistics updated

## 🔧 Alternative: Use a separate PowerShell window

If you want to use API calls:

1. **Open a NEW PowerShell window** (separate from VS Code terminal)
2. Run these commands:

```powershell
# Login
$body = @{email="admin@test.com"; password="Admin123!"} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $response.token
Write-Host "Token: $token"

# Create a product
$headers = @{Authorization = "Bearer $token"; "Content-Type" = "application/json"}
$product = @{
    name = "MacBook Pro 16-inch"
    description = "High-performance laptop"
    category = "Electronics"
    rentalPrice = 75.00
    quantity = 8
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/products" -Method POST -Headers $headers -Body $product
```

## 📝 Why This Approach?

The issue is that running PowerShell commands in the same terminal where the backend is running (even as a background process) causes connection conflicts. Using:
1. **The Frontend UI** - Most reliable and tests the full stack
2. **A separate PowerShell window** - Avoids terminal conflicts

## ✅ Expected Results

After creating data:
- Dashboard should show customer count
- Products page should list your products
- Customers page should list your customers
- All CRUD operations should work

## 🎉 You're Ready!

Once you've added the sample data through the UI, your system is fully functional and tested!