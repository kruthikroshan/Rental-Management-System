# Testing and Troubleshooting Guide

## 🧪 How to Test MongoDB Connection

### 1. **Run the Database Connection Test**

```powershell
cd backend
npx tsx test-mongodb-connection.ts
```

This will test:
- ✅ Environment variables
- ✅ MongoDB connection
- ✅ Database operations (insert, read, delete)
- ✅ List collections

### 2. **Start the Server (Method 1 - Development)**

```powershell
cd backend
npm run dev
```

Expected output:
```
✅ MongoDB Connected Successfully
📂 Database: rental_db
🚀 Backend server running on http://localhost:3000
```

### 3. **Start the Server (Method 2 - Clean Start)**

```powershell
# Kill any existing Node processes
taskkill /F /IM node.exe

# Navigate to backend
cd backend

# Install dependencies (if needed)
npm install

# Start server
npm run dev
```

---

## 🐛 Common Issues and Fixes

### Issue 1: "Cannot find module 'typeorm'"

**Cause:** Old TypeORM imports still exist  
**Fix:** We've migrated to Mongoose, but some files may still reference TypeORM

```powershell
# Check for remaining TypeORM imports
cd backend
Get-ChildItem -Recurse -Filter "*.ts" | Select-String "from 'typeorm'" | Select-Object Path, LineNumber
```

### Issue 2: "Unable to connect to the remote server"

**Causes:**
1. Server didn't start properly
2. Port 3000 is blocked by firewall
3. Server crashed after startup

**Fix:**
```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Check firewall (run as Administrator)
New-NetFirewallRule -DisplayName "Node.js 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# Try alternative port
# Edit backend/.env and change: PORT=3001
```

### Issue 3: "Duplicate schema index" warnings

**Cause:** Mongoose schemas have both `index: true` in field definition AND `schema.index()`  
**Fix:** These are just warnings and don't affect functionality. To fix:

Edit model files and remove duplicate index definitions.

### Issue 4: Server crashes immediately after "Server is now listening"

**Possible causes:**
1. Unhandled error in route handlers
2. Missing controller methods
3. Circular dependency

**Fix:**
```powershell
# Run with error details
cd backend
$env:NODE_ENV="development"
npm run dev
```

---

## 🧪 Testing Individual API Endpoints

### Test 1: Health Check (No Auth Required)

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/health" | Select-Object -ExpandProperty Content
```

Expected: 
```json
{
  "success": true,
  "message": "Rental Management API is running",
  "timestamp": "2025-10-19T...",
  "version": "1.0.0"
}
```

### Test 2: User Registration

```powershell
$body = @{
    name = "Test User"
    email = "testuser@example.com"
    password = "Test123!"
    role = "customer"
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### Test 3: User Login

```powershell
$body = @{
    email = "testuser@example.com"
    password = "Test123!"
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body

# Save the token
$result = $response.Content | ConvertFrom-Json
$token = $result.data.token
Write-Host "Token: $token"
```

### Test 4: Dashboard Stats (Requires Auth)

```powershell
# Use token from login
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-WebRequest `
    -Uri "http://localhost:3000/api/dashboard/stats" `
    -Method GET `
    -Headers $headers | Select-Object -ExpandProperty Content
```

### Test 5: List Products

```powershell
# Public endpoint (no auth)
Invoke-WebRequest `
    -Uri "http://localhost:3000/api/public/products?page=1&limit=10" `
    -Method GET | Select-Object -ExpandProperty Content

# Or with auth
Invoke-WebRequest `
    -Uri "http://localhost:3000/api/products?page=1&limit=10" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $token"} | Select-Object -ExpandProperty Content
```

### Test 6: Create a Product (Requires Auth)

```powershell
$productBody = @{
    name = "Test Product"
    description = "A test product"
    categoryId = "6713..." # Use actual category ID
    sku = "TEST001"
    baseRentalRate = 100
    totalQuantity = 10
    isRentable = $true
} | ConvertTo-Json

Invoke-WebRequest `
    -Uri "http://localhost:3000/api/products" `
    -Method POST `
    -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    } `
    -Body $productBody
```

---

## 🔍 Debugging Tips

### 1. **Check Server Logs**

The server outputs detailed logs. Look for:
- ✅ Green checkmarks = Success
- ❌ Red X = Error
- 🔄 Arrows = In progress

### 2. **Enable Verbose Logging**

Edit `backend/src/server.ts` and add:
```typescript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

### 3. **Check MongoDB Atlas Dashboard**

1. Go to https://cloud.mongodb.com
2. Select your cluster
3. Click "Collections" to see your data
4. Check "Metrics" for connection issues

### 4. **Test with Postman or Thunder Client**

If PowerShell commands fail, try:
- Postman (desktop app)
- Thunder Client (VS Code extension)
- REST Client (VS Code extension)

### 5. **Check Environment Variables**

```powershell
cd backend
Get-Content .env
```

Should include:
```
MONGODB_URI=mongodb+srv://...
PORT=3000
JWT_SECRET=your_secret_here
```

---

## 🚀 Quick Start Checklist

- [ ] MongoDB URI configured in `.env`
- [ ] Run `npm install` in backend folder
- [ ] Test MongoDB connection: `npx tsx test-mongodb-connection.ts`
- [ ] Start server: `npm run dev`
- [ ] Wait for "✅ Server is now listening for connections"
- [ ] Test health endpoint: `curl http://localhost:3000/api/health`
- [ ] Test registration endpoint
- [ ] Test login endpoint
- [ ] Test dashboard endpoint with token

---

## 📝 Server Startup Checklist

When server starts, you should see:

```
🔄 Initializing database connection...
(warnings about duplicate indexes - ignore these)
✅ MongoDB Connected Successfully
📂 Database: rental_db
🏠 Host: ac-egysbrx-shard-00-00.hiuczje.mongodb.net
✅ Database initialization completed
🔄 Starting HTTP server...
🚀 Backend server running on http://localhost:3000
🌐 Server listening on all interfaces (0.0.0.0:3000)
✅ Server is now listening for connections
```

If it stops or crashes after this, check the terminal for error messages.

---

## 🆘 Still Having Issues?

1. **Check port conflicts:**
   ```powershell
   netstat -ano | findstr :3000
   ```

2. **Check firewall:**
   ```powershell
   Test-NetConnection -ComputerName localhost -Port 3000
   ```

3. **Try a different port:**
   - Edit `backend/.env`
   - Change `PORT=3001`
   - Restart server

4. **Clear Node modules and reinstall:**
   ```powershell
   cd backend
   Remove-Item -Recurse -Force node_modules
   Remove-Item -Force package-lock.json
   npm install
   npm run dev
   ```

5. **Check MongoDB Atlas IP Whitelist:**
   - Go to MongoDB Atlas dashboard
   - Network Access
   - Add IP Address: `0.0.0.0/0` (allow all) for testing

---

Need more help? Check the detailed error messages in the terminal!
