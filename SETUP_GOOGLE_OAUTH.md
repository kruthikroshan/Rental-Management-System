# 🔐 Google OAuth Setup Guide - Step by Step

This guide will walk you through setting up Google Sign-In for your Rental Management application.

---

## 📋 Prerequisites

- Google Account (Gmail)
- Application already running (Backend + Frontend)
- Internet connection

---

## 🚀 Step 1: Access Google Cloud Console

1. **Open Google Cloud Console**
   - Go to: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Accept Terms of Service** (if prompted)
   - Read and accept the Google Cloud Terms of Service

---

## 📁 Step 2: Create a New Project

1. **Click on the Project Dropdown**
   - Located at the top left of the page (next to "Google Cloud")
   - Click on the dropdown that says "Select a project"

2. **Create New Project**
   - Click **"NEW PROJECT"** button in the top right
   - **Project Name**: Enter `Rental-Management-App` (or any name you prefer)
   - **Organization**: Leave as "No organization" (unless you have one)
   - Click **"CREATE"** button

3. **Wait for Project Creation**
   - This takes 10-30 seconds
   - You'll see a notification when it's ready

4. **Select Your New Project**
   - Click on the project dropdown again
   - Select your newly created project

---

## 🔑 Step 3: Configure OAuth Consent Screen

1. **Navigate to OAuth Consent Screen**
   - In the left sidebar, go to: **APIs & Services** → **OAuth consent screen**
   - Or search for "OAuth consent screen" in the top search bar

2. **Choose User Type**
   - Select **"External"** (for testing with any Google account)
   - Click **"CREATE"** button

3. **Fill in App Information** (Page 1 - App Information)
   - **App name**: `Rental Management System`
   - **User support email**: Select your email from dropdown
   - **App logo**: Skip (optional)
   - **App domain**: Leave blank for now (optional)
   - **Authorized domains**: Leave blank for now
   - **Developer contact information**: Enter your email
   - Click **"SAVE AND CONTINUE"**

4. **Scopes** (Page 2 - Scopes)
   - Click **"ADD OR REMOVE SCOPES"**
   - Select these scopes:
     - ✅ `.../auth/userinfo.email`
     - ✅ `.../auth/userinfo.profile`
     - ✅ `openid`
   - Click **"UPDATE"** button
   - Click **"SAVE AND CONTINUE"**

5. **Test Users** (Page 3 - Test users)
   - Click **"ADD USERS"**
   - Enter your Gmail address (and any other test users)
   - Click **"ADD"**
   - Click **"SAVE AND CONTINUE"**

6. **Summary** (Page 4 - Summary)
   - Review your settings
   - Click **"BACK TO DASHBOARD"**

---

## 🎫 Step 4: Create OAuth 2.0 Credentials

1. **Navigate to Credentials**
   - In the left sidebar, go to: **APIs & Services** → **Credentials**
   - Or click on **"Credentials"** in the left menu

2. **Create Credentials**
   - Click **"+ CREATE CREDENTIALS"** at the top
   - Select **"OAuth client ID"** from the dropdown

3. **Configure OAuth Client**
   - **Application type**: Select **"Web application"**
   - **Name**: Enter `Rental Management Web Client`

4. **Add Authorized JavaScript Origins**
   - Click **"+ ADD URI"** under "Authorized JavaScript origins"
   - Add the following URIs (one at a time):
     ```
     http://localhost:5173
     http://localhost:3000
     http://127.0.0.1:5173
     http://127.0.0.1:3000
     ```

5. **Add Authorized Redirect URIs** (Optional for now)
   - Click **"+ ADD URI"** under "Authorized redirect URIs"
   - Add:
     ```
     http://localhost:5173
     http://localhost:3000/api/auth/google/callback
     ```

6. **Create Client**
   - Click **"CREATE"** button

---

## 📝 Step 5: Copy Your Client ID

1. **OAuth Client Created Dialog**
   - A popup will appear with your credentials
   - **Client ID**: This is what you need! It looks like:
     ```
     123456789-abcdefghijklmnop.apps.googleusercontent.com
     ```

2. **Copy the Client ID**
   - Click the **copy icon** 📋 next to the Client ID
   - Or manually select and copy the entire Client ID

3. **Save It**
   - You can click **"DOWNLOAD JSON"** to save credentials (optional)
   - Click **"OK"** to close the dialog

---

## ⚙️ Step 6: Configure Your Application

### Backend Configuration

1. **Open Backend `.env` File**
   - Navigate to: `backend\.env`
   - Find the line: `GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com`

2. **Paste Your Client ID**
   - Replace `your-google-client-id.apps.googleusercontent.com` with your actual Client ID
   - Example:
     ```env
     GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
     ```

3. **Save the File**
   - Press `Ctrl + S` to save

### Frontend Configuration

1. **Open Frontend `.env` File**
   - Navigate to: `frontend\.env`
   - Find the line: `VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com`

2. **Paste the SAME Client ID**
   - Replace with the same Client ID you used in backend
   - Example:
     ```env
     VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
     ```

3. **Save the File**
   - Press `Ctrl + S` to save

---

## 🔄 Step 7: Restart Your Servers

**IMPORTANT**: You must restart both servers for the changes to take effect!

### Stop Running Servers

1. **In VS Code Terminal**:
   - Find the terminal running backend (shows `tsx watch src/server.ts`)
   - Press `Ctrl + C` to stop it
   - Find the terminal running frontend (shows `vite`)
   - Press `Ctrl + C` to stop it

### Restart Backend

```powershell
cd "c:\Users\kruth\CrossDevice\vivo T2 Pro 5G\storage\Documents\Downloads\Rental-Management-Odoo-Final-Round-main\Rental-Management-Odoo-Final-Round-main\backend"
npm run dev
```

### Restart Frontend (New Terminal)

```powershell
cd "c:\Users\kruth\CrossDevice\vivo T2 Pro 5G\storage\Documents\Downloads\Rental-Management-Odoo-Final-Round-main\Rental-Management-Odoo-Final-Round-main\frontend"
npm run dev
```

---

## 🧪 Step 8: Test Google Sign-In

1. **Open Your Application**
   - Go to: http://localhost:5173/

2. **Navigate to Login Page**
   - If not already there, click "Login" or navigate to login

3. **You Should See**
   - Traditional email/password login form
   - **"Or continue with"** divider
   - **Google Sign-In button** with Google logo

4. **Test Google Login**
   - Click the **"Sign in with Google"** button
   - A Google account selection popup will appear

5. **Select Your Google Account**
   - Choose the account you added as a test user
   - Click **"Continue"**

6. **Grant Permissions**
   - Review the permissions requested
   - Click **"Allow"** or **"Continue"**

7. **Success!**
   - You should be redirected to the dashboard
   - You're now logged in with your Google account! 🎉

---

## ✅ Verify It's Working

### Check Browser

1. **Open Browser DevTools**
   - Press `F12` or right-click → Inspect

2. **Check Local Storage**
   - Go to **Application** tab → **Local Storage** → `http://localhost:5173`
   - You should see:
     - `token`: Your JWT access token
     - `refreshToken`: Your JWT refresh token
     - `user`: Your user information (as JSON)

### Check Database

1. **Open MongoDB Atlas**
   - Go to: https://cloud.mongodb.com/
   - Sign in to your account

2. **Browse Collections**
   - Click on your cluster → **Browse Collections**
   - Select `rental_db` database → `users` collection

3. **Find Your User**
   - Look for your email address
   - Verify these fields:
     - ✅ `googleId`: Should contain Google's user ID
     - ✅ `authProvider`: Should be "google"
     - ✅ `isEmailVerified`: Should be `true`
     - ✅ `avatarUrl`: Should have your Google profile picture URL

### Check Backend Logs

1. **Look at Backend Terminal**
   - You should see log entries like:
     ```
     POST /api/auth/google-login 200
     ```

---

## 🔧 Troubleshooting

### "Error: Invalid Client ID"

**Problem**: The Client ID is incorrect or not set

**Solution**:
1. Double-check you copied the ENTIRE Client ID (including `.apps.googleusercontent.com`)
2. Verify no extra spaces before/after the Client ID in `.env` files
3. Make sure you restarted BOTH servers after changing `.env`

### "Unauthorized Origin"

**Problem**: Your application URL is not in authorized origins

**Solution**:
1. Go back to Google Cloud Console → Credentials
2. Click on your OAuth client
3. Under "Authorized JavaScript origins", verify:
   - `http://localhost:5173` is listed
   - `http://localhost:3000` is listed
4. Click **"SAVE"**
5. Wait 5 minutes for changes to propagate

### Google Button Doesn't Appear

**Problem**: Missing `VITE_GOOGLE_CLIENT_ID` or frontend not restarted

**Solution**:
1. Check `frontend\.env` has the Client ID
2. Restart frontend server (`Ctrl+C` then `npm run dev`)
3. Hard refresh browser (`Ctrl + Shift + R`)
4. Check browser console for errors (`F12` → Console tab)

### "Failed to Login" Error

**Problem**: Backend or database connection issue

**Solution**:
1. Check backend terminal for errors
2. Verify MongoDB is connected (should see "MongoDB Connected Successfully")
3. Check `backend\.env` has correct `MONGODB_URI`
4. Verify `GOOGLE_CLIENT_ID` in backend `.env`

### "User Type External" Warning

**Problem**: App is in testing mode

**Solution**:
- This is normal for development!
- Only users you added as "Test Users" can sign in
- To allow all users, you need to publish the app (not needed for development)

---

## 🎯 Quick Reference

### Required Environment Variables

**Backend `.env`**:
```env
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
```

**Frontend `.env`**:
```env
VITE_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
```

### Authorized Origins (Google Console)

```
http://localhost:5173
http://localhost:3000
http://127.0.0.1:5173
http://127.0.0.1:3000
```

### Test User Flow

1. Click "Sign in with Google" button
2. Select Google account
3. Grant permissions
4. Redirected to dashboard
5. User created/logged in automatically

---

## 📚 Additional Resources

- **Full Technical Documentation**: See `GOOGLE_AUTH_IMPLEMENTATION.md`
- **Quick Start Guide**: See `GOOGLE_AUTH_QUICK_START.md`
- **Visual Summary**: See `GOOGLE_AUTH_SUMMARY.md`
- **Google OAuth Docs**: https://developers.google.com/identity/protocols/oauth2

---

## 🎉 Success Checklist

- [ ] Created Google Cloud project
- [ ] Configured OAuth consent screen
- [ ] Created OAuth client ID
- [ ] Added authorized JavaScript origins
- [ ] Copied Client ID
- [ ] Pasted Client ID in `backend\.env`
- [ ] Pasted Client ID in `frontend\.env`
- [ ] Restarted backend server
- [ ] Restarted frontend server
- [ ] Tested Google Sign-In
- [ ] Verified user in database
- [ ] Checked tokens in localStorage

---

## 💡 Tips

- **Use the same email**: For easier testing, use the same Gmail account you're developing with
- **Multiple accounts**: You can add multiple test users in Google Console
- **Bookmark**: Save the Google Cloud Console credentials page for easy access
- **Security**: Never commit `.env` files to Git (they're in `.gitignore`)

---

## 🆘 Need Help?

If you're still having issues:

1. Check browser console for errors (`F12`)
2. Check backend terminal for errors
3. Verify all steps above were completed
4. Review `GOOGLE_AUTH_IMPLEMENTATION.md` for detailed technical info
5. Check that both servers are running

---

**Last Updated**: October 20, 2025  
**Version**: 1.0  
**Compatibility**: Rental Management System v1.0
