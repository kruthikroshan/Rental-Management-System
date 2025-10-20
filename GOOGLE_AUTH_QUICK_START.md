# 🚀 Quick Start Guide - Google OAuth Setup

## Step-by-Step Setup (5 minutes)

### 1️⃣ Get Google Credentials

1. Visit: https://console.cloud.google.com/
2. Click "Select a project" → "New Project"
3. Name it: "Rental Management System"
4. Click "Create"

### 2️⃣ Enable Google+ API

1. In sidebar: "APIs & Services" → "Library"
2. Search: "Google+ API"
3. Click "Enable"

### 3️⃣ Create OAuth Credentials

1. Sidebar: "APIs & Services" → "Credentials"
2. Click "Configure Consent Screen"
   - User Type: **External**
   - Click "Create"
3. Fill OAuth consent screen:
   - App name: **Rental Management System**
   - User support email: *your-email@example.com*
   - Developer contact: *your-email@example.com*
   - Click "Save and Continue" (skip optional fields)
4. Click "Back to Dashboard"
5. Click "Create Credentials" → "OAuth Client ID"
6. Application type: **Web application**
7. Name: **Rental Management OAuth Client**
8. Authorized JavaScript origins:
   - Click "Add URI"
   - Add: `http://localhost:5173`
   - Add: `http://localhost:3000`
9. Authorized redirect URIs:
   - Click "Add URI"
   - Add: `http://localhost:5173`
10. Click "Create"
11. **COPY** the Client ID (looks like: `xxxxx.apps.googleusercontent.com`)

### 4️⃣ Add to Environment Files

#### Backend `.env`:
```bash
cd backend
# Edit .env file and add:
GOOGLE_CLIENT_ID=paste-your-client-id-here.apps.googleusercontent.com
```

#### Frontend `.env`:
```bash
cd frontend
# Create or edit .env file and add:
VITE_GOOGLE_CLIENT_ID=paste-your-client-id-here.apps.googleusercontent.com
VITE_API_BASE_URL=http://localhost:3000
```

### 5️⃣ Restart Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 6️⃣ Test It!

1. Open: http://localhost:5173
2. You should see "Sign in with Google" button
3. Click it
4. Choose your Google account
5. ✅ You're logged in!

## 🎉 That's It!

Your Google OAuth login is now working!

## 🐛 Quick Fixes

**Button not showing?**
- Check console for errors
- Verify VITE_GOOGLE_CLIENT_ID is set
- Restart frontend server

**Redirect URI mismatch?**
- Check Google Console → Credentials
- Verify http://localhost:5173 is added
- Wait 2-3 minutes for changes

**Still stuck?**
- Read full documentation in `GOOGLE_AUTH_IMPLEMENTATION.md`
- Check all environment variables are set
- Verify both servers are running

---

**Need Help?** Check the detailed guide in `GOOGLE_AUTH_IMPLEMENTATION.md`
