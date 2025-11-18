# Google OAuth Setup for Website Deployment

## Quick Setup Guide

### Step 1: Deploy to Vercel (if not already done)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

### Step 2: Add Environment Variables to Vercel

1. Go to https://vercel.com/dashboard
2. Select your project (Rental-Management-System)
3. Go to **Settings** → **Environment Variables**
4. Add the following variable:

**Variable Name:** `VITE_GOOGLE_CLIENT_ID`
**Value:** `348001841881-5qq1b1aq6oup5uhpc9l2h50qn4kskdnh.apps.googleusercontent.com`
**Environments:** ✅ Production, ✅ Preview, ✅ Development

5. Click **Save**
6. Go to **Deployments** tab
7. Click the **⋯** menu on latest deployment → **Redeploy**

### Step 3: Configure Google Cloud Console

1. Go to https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID: `348001841881-5qq1b1aq6oup5uhpc9l2h50qn4kskdnh`
3. Click **Edit** (pencil icon)

#### Add Authorized JavaScript Origins:
```
http://localhost:5173
http://localhost:3000
https://YOUR-PROJECT-NAME.vercel.app
```
(Replace `YOUR-PROJECT-NAME` with your actual Vercel project URL)

#### Add Authorized Redirect URIs:
```
http://localhost:5173
http://localhost:3000
https://YOUR-PROJECT-NAME.vercel.app
https://YOUR-PROJECT-NAME.vercel.app/
```

4. Click **Save**
5. Wait 5-10 minutes for changes to propagate

### Step 4: Update Backend Environment Variables (Render)

1. Go to https://dashboard.render.com
2. Select your backend service
3. Go to **Environment** tab
4. Verify/Add these variables:

```
GOOGLE_CLIENT_ID=348001841881-5qq1b1aq6oup5uhpc9l2h50qn4kskdnh.apps.googleusercontent.com
ALLOWED_ORIGINS=https://YOUR-PROJECT-NAME.vercel.app
```

5. Save changes (will auto-deploy)

### Step 5: Test Google Login

1. Visit your Vercel URL: `https://YOUR-PROJECT-NAME.vercel.app`
2. Go to Login or Register page
3. You should see **"Sign in with Google"** button
4. Click it to test Google OAuth login

---

## Troubleshooting

### "Google OAuth components must be used within GoogleOAuthProvider"
- Solution: Make sure `VITE_GOOGLE_CLIENT_ID` is set in Vercel environment variables
- Redeploy after adding the variable

### "The given origin is not allowed for the given client ID"
- Solution: Add your Vercel URL to Google Cloud Console Authorized Origins
- Wait 5-10 minutes after saving changes

### Google button not showing
- Check browser console for errors
- Verify environment variable is set: Open DevTools → Console → Type: `import.meta.env.VITE_GOOGLE_CLIENT_ID`
- Should show your Client ID

### CORS errors
- Add your Vercel URL to backend `ALLOWED_ORIGINS` environment variable
- Format: `https://your-app.vercel.app` (no trailing slash)

---

## Verification Checklist

- [ ] Vercel environment variable `VITE_GOOGLE_CLIENT_ID` is set
- [ ] Vercel project redeployed after adding variable
- [ ] Google Cloud Console has your Vercel URL in Authorized Origins
- [ ] Google Cloud Console has your Vercel URL in Redirect URIs
- [ ] Backend `GOOGLE_CLIENT_ID` matches frontend
- [ ] Backend `ALLOWED_ORIGINS` includes Vercel URL
- [ ] Waited 5-10 minutes for Google changes to propagate
- [ ] Google Sign-In button visible on website
- [ ] Can successfully sign in with Google account

---

## Environment Variables Summary

### Frontend (Vercel)
```env
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=348001841881-5qq1b1aq6oup5uhpc9l2h50qn4kskdnh.apps.googleusercontent.com
```

### Backend (Render)
```env
GOOGLE_CLIENT_ID=348001841881-5qq1b1aq6oup5uhpc9l2h50qn4kskdnh.apps.googleusercontent.com
ALLOWED_ORIGINS=https://your-frontend.vercel.app
NODE_ENV=production
```

---

## Quick Commands

### Check if Google Client ID is loaded (in browser console on your site):
```javascript
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)
```

### Redeploy Vercel from CLI:
```bash
cd frontend
vercel --prod
```

### Check deployment logs:
- Vercel: https://vercel.com/dashboard → Select project → View deployment logs
- Render: https://dashboard.render.com → Select service → Logs tab

---

## Support Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Render Dashboard:** https://dashboard.render.com
- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials
- **GitHub Repository:** https://github.com/kruthikroshan/Rental-Management-System

---

**Once all steps are complete, Google login will work on your live website!** 🚀
