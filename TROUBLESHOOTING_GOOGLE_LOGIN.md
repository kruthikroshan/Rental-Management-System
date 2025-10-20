# 🔍 Troubleshooting Google Login

## Quick Diagnostics

### Step 1: Check if Google Button Appears

1. **Open the app**: http://localhost:5173/
2. **Go to Login page**
3. **Look for**:
   - Regular email/password form ✓
   - "Or continue with" text divider ✓
   - **Google Sign-In button** ← Should appear here

**❌ If Google button does NOT appear:**
- Open browser console (F12)
- Look for error messages
- Check the console output below

### Step 2: Check Browser Console

**Open Browser DevTools:**
1. Press `F12` or Right-click → Inspect
2. Go to **Console** tab
3. Look for any RED errors

**Common errors and solutions:**

#### Error: "Invalid Client ID"
```
Solution:
1. Check frontend/.env has: VITE_GOOGLE_CLIENT_ID=348001841881-5qq1b1aq6oup5uhpc9l2h50qn4kskdnh.apps.googleusercontent.com
2. Restart frontend server
3. Hard refresh browser (Ctrl + Shift + R)
```

#### Error: "Unauthorized Origin"
```
Solution:
1. Go to: https://console.cloud.google.com/
2. Navigate to: APIs & Services → Credentials
3. Click on your OAuth client
4. Under "Authorized JavaScript origins" add:
   - http://localhost:5173
5. Save and wait 5 minutes
```

### Step 3: Test Google Button Click

1. **Click** the "Sign in with Google" button
2. **What should happen**:
   - A popup window appears
   - OR a One Tap prompt appears at top right
   - Shows your Google accounts to select

**❌ If nothing happens:**
- Check browser console for errors
- Make sure popups are not blocked
- Try disabling ad blockers

### Step 4: Check Network Request

1. **Open DevTools** (F12)
2. Go to **Network** tab
3. Click "Sign in with Google"
4. Select a Google account
5. **Look for**: POST request to `/api/auth/google-login`

**Check the request:**
- Status should be **200 OK**
- Response should contain `user` and `tokens`

**❌ If request fails (400/500 error):**
- Check backend console
- Verify GOOGLE_CLIENT_ID in backend/.env
- Check MongoDB connection

### Step 5: Verify Environment Variables

**Run this in VS Code terminal:**

```powershell
# Check frontend env
cd frontend
Get-Content .env | Select-String "GOOGLE"

# Check backend env
cd ../backend
Get-Content .env | Select-String "GOOGLE"
```

**Expected output:**
```
Frontend: VITE_GOOGLE_CLIENT_ID=348001841881-5qq1b1aq6oup5uhpc9l2h50qn4kskdnh.apps.googleusercontent.com
Backend:  GOOGLE_CLIENT_ID=348001841881-5qq1b1aq6oup5uhpc9l2h50qn4kskdnh.apps.googleusercontent.com
```

## 🧪 Manual Test

### Test 1: Check if Google OAuth is loaded

Open browser console on login page and run:

```javascript
console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
```

Should output: `348001841881-5qq1b1aq6oup5uhpc9l2h50qn4kskdnh.apps.googleusercontent.com`

### Test 2: Check Google API loaded

```javascript
console.log('Google API:', typeof google !== 'undefined' ? 'Loaded' : 'Not loaded');
```

Should output: `Google API: Loaded`

### Test 3: Test Backend Endpoint Directly

**Using PowerShell:**

```powershell
$body = @{
    credential = "test_token"
    email = "test@example.com"
    name = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/google-login" -Method POST -Body $body -ContentType "application/json"
```

**Expected:** Should get an error about invalid credential (which is normal - it means the endpoint works)

## 🔧 Common Issues and Fixes

### Issue 1: "Google button shows but nothing happens when clicked"

**Solution:**
```powershell
# Clear browser cache and restart
# Then hard refresh: Ctrl + Shift + R
```

### Issue 2: "Error 400: redirect_uri_mismatch"

**Solution:**
1. Go to Google Cloud Console
2. Add redirect URIs:
   - http://localhost:5173
   - http://localhost:3000

### Issue 3: "Error 403: access_denied"

**Solution:**
1. Make sure you added your email as a **Test User** in Google Console
2. Go to: OAuth consent screen → Test users → Add users

### Issue 4: "Token verification failed on backend"

**Solution:**
1. Make sure backend GOOGLE_CLIENT_ID matches frontend
2. Check both .env files have the same Client ID

### Issue 5: "Google button doesn't show at all"

**Check these:**

1. **Package installed?**
   ```powershell
   cd frontend
   npm list @react-oauth/google
   ```
   Should show: `@react-oauth/google@0.x.x`

2. **Import working?**
   Check frontend console for import errors

3. **Client ID set?**
   Check `frontend/.env` file

4. **Hard refresh browser**
   Press: `Ctrl + Shift + R`

## 📊 Verification Checklist

Run through this checklist:

- [ ] ✅ Backend server running on port 3000
- [ ] ✅ Frontend server running on port 5173
- [ ] ✅ GOOGLE_CLIENT_ID in backend/.env
- [ ] ✅ VITE_GOOGLE_CLIENT_ID in frontend/.env
- [ ] ✅ Both Client IDs are identical
- [ ] ✅ Google Cloud project created
- [ ] ✅ OAuth consent screen configured
- [ ] ✅ OAuth client ID created
- [ ] ✅ Authorized origins added (localhost:5173, localhost:3000)
- [ ] ✅ Test user added (your email)
- [ ] ✅ Servers restarted after .env changes
- [ ] ✅ Browser cache cleared
- [ ] ✅ No errors in browser console
- [ ] ✅ No errors in backend console
- [ ] ✅ MongoDB connected

## 🎯 Quick Fix Commands

**Restart Everything:**

```powershell
# Terminal 1: Backend
cd "c:\Users\kruth\CrossDevice\vivo T2 Pro 5G\storage\Documents\Downloads\Rental-Management-Odoo-Final-Round-main\Rental-Management-Odoo-Final-Round-main\backend"
npm run dev

# Terminal 2: Frontend
cd "c:\Users\kruth\CrossDevice\vivo T2 Pro 5G\storage\Documents\Downloads\Rental-Management-Odoo-Final-Round-main\Rental-Management-Odoo-Final-Round-main\frontend"
npm run dev
```

**Reinstall Google Package:**

```powershell
cd frontend
npm uninstall @react-oauth/google
npm install @react-oauth/google
npm run dev
```

## 📝 Debug Information to Collect

If still not working, collect this info:

1. **Browser Console Output** (F12 → Console)
2. **Network Tab** (F12 → Network → Filter: google-login)
3. **Backend Console Output**
4. **Screenshot** of login page
5. **Environment Variables** (hide sensitive parts):
   ```powershell
   cd frontend
   cat .env
   cd ../backend
   cat .env
   ```

## 🆘 Still Having Issues?

1. Check `SETUP_GOOGLE_OAUTH.md` - Step-by-step setup
2. Check `GOOGLE_AUTH_IMPLEMENTATION.md` - Technical details
3. Verify Google Cloud Console settings match exactly

---

## 🎬 Expected Behavior Video Description

**What should happen:**

1. **Page Load**: Login page shows with email/password form
2. **Below Form**: "Or continue with" divider appears
3. **Google Button**: Blue "Sign in with Google" button appears
4. **Click Button**: Google account selector popup opens
5. **Select Account**: Click your Google account
6. **Grant Permission**: Click "Allow" or "Continue"
7. **Redirect**: Automatically redirected to dashboard
8. **Logged In**: You're now logged in with Google account!

**Time**: Should take 3-5 seconds total

---

**Last Updated**: October 20, 2025
