# 🚀 Deploy to Vercel + Render

Complete guide to deploy your Rental Management System with frontend on Vercel and backend on Render.

---

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas configured with IP whitelist (0.0.0.0/0 or Render IPs)
- [ ] Google OAuth configured (will update after deployment)
- [ ] Secure secrets generated
- [ ] All code committed to GitHub

---

## Part 1️⃣: Deploy Backend to Render

### Step 1: Create Render Account
1. Go to https://render.com/
2. Sign up with your GitHub account

### Step 2: Create Web Service
1. Click **"New"** → **"Web Service"**
2. Connect your GitHub repository: `Rental-Management-System`
3. Click **"Connect"**

### Step 3: Configure Service
Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `rental-backend` |
| **Region** | Oregon (or closest to you) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | Free (or Starter $7/mo for better performance) |

### Step 4: Generate Secrets

**Run these commands locally to generate secure secrets:**

```bash
# JWT Secret (copy the output)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# JWT Refresh Secret (copy the output)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Session Secret (copy the output)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Add Environment Variables

Click **"Advanced"** → Add these environment variables:

#### Required Variables:
```
NODE_ENV = production
PORT = 10000
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/rental_db?retryWrites=true&w=majority
JWT_SECRET = <paste-your-generated-jwt-secret>
JWT_REFRESH_SECRET = <paste-your-generated-refresh-secret>
SESSION_SECRET = <paste-your-generated-session-secret>
ALLOWED_ORIGINS = https://your-app.vercel.app
```

#### Optional Variables:
```
GOOGLE_CLIENT_ID = your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = your-client-secret
BCRYPT_SALT_ROUNDS = 12
JWT_EXPIRES_IN = 7d
JWT_REFRESH_EXPIRES_IN = 30d
RATE_LIMIT_WINDOW_MS = 900000
RATE_LIMIT_MAX_REQUESTS = 100
```

### Step 6: Deploy Backend
1. Click **"Create Web Service"**
2. Wait for deployment (3-5 minutes)
3. Copy your backend URL: `https://rental-backend-xxxx.onrender.com`

### Step 7: Test Backend
Visit: `https://rental-backend-xxxx.onrender.com/api/health`

Expected response:
```json
{
  "success": true,
  "message": "Rental Management API is running",
  "environment": "production"
}
```

---

## Part 2️⃣: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to https://vercel.com/
2. Sign up with your GitHub account

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository: `Rental-Management-System`
3. Click **"Import"**

### Step 3: Configure Project
Fill in these settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` ← Click "Edit" and select |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### Step 4: Add Environment Variables
Click **"Environment Variables"** and add:

```
VITE_API_BASE_URL = https://rental-backend-xxxx.onrender.com
VITE_GOOGLE_CLIENT_ID = your-client-id.apps.googleusercontent.com
```

Replace `rental-backend-xxxx` with your actual Render backend URL.

### Step 5: Deploy Frontend
1. Click **"Deploy"**
2. Wait for deployment (2-3 minutes)
3. Copy your frontend URL: `https://your-app.vercel.app`

---

## Part 3️⃣: Update Backend CORS

### Step 1: Update Render Environment
1. Go to Render Dashboard → Your backend service
2. Go to **"Environment"** tab
3. Update `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS = https://your-app.vercel.app,https://your-app-git-main.vercel.app
   ```
4. Click **"Save Changes"**
5. Service will auto-redeploy

---

## Part 4️⃣: Configure Google OAuth

### Step 1: Update Google Cloud Console
1. Go to https://console.cloud.google.com/
2. **APIs & Services** → **Credentials**
3. Select your OAuth 2.0 Client ID

### Step 2: Add Authorized Origins
Under **"Authorized JavaScript origins"**, add:
- `https://your-app.vercel.app`
- `https://rental-backend-xxxx.onrender.com`

### Step 3: Add Redirect URIs
Under **"Authorized redirect URIs"**, add:
- `https://your-app.vercel.app`

### Step 4: Remove Localhost
Remove all `http://localhost` entries (keep for development separately)

---

## Part 5️⃣: Configure MongoDB Atlas

### Step 1: Update Network Access
1. Go to https://cloud.mongodb.com/
2. **Network Access** → **Add IP Address**
3. Option A: **Allow Access from Anywhere** (0.0.0.0/0)
4. Option B: Add specific Render IPs (check Render docs)
5. Click **"Confirm"**

---

## ✅ Verify Deployment

### Test Checklist:
- [ ] Frontend loads: https://your-app.vercel.app
- [ ] Backend health check works
- [ ] Can register a new user
- [ ] Can login with email/password
- [ ] Google Sign-In works
- [ ] API calls work (check Network tab)
- [ ] No CORS errors

### Common URLs to Test:
```
Frontend: https://your-app.vercel.app
Backend API: https://rental-backend-xxxx.onrender.com/api/health
```

---

## 🔄 Auto-Deploy

Both platforms auto-deploy on git push to `main`:
- **Vercel**: Immediate (~1-2 minutes)
- **Render**: Takes ~3-5 minutes

---

## 🌐 Custom Domain (Optional)

### Vercel (Frontend):
1. **Settings** → **Domains**
2. Add your domain: `yourdomain.com`
3. Update DNS records as instructed
4. SSL is automatic

### Render (Backend):
1. **Settings** → **Custom Domain**
2. Add subdomain: `api.yourdomain.com`
3. Update DNS CNAME record
4. SSL is automatic

### Update After Custom Domain:
- Update `VITE_API_BASE_URL` in Vercel
- Update `ALLOWED_ORIGINS` in Render
- Update Google OAuth authorized origins

---

## 💰 Cost Breakdown

### Free Tier:
- **Render**: Free (sleeps after 15min inactivity)
- **Vercel**: Free (hobby plan)
- **MongoDB Atlas**: Free (512MB)
- **Total**: $0/month

### Paid Tier (Recommended for Production):
- **Render Starter**: $7/month (always on, better performance)
- **Vercel Pro**: $20/month (better performance, analytics)
- **MongoDB Atlas**: $9/month (2GB)
- **Total**: ~$36/month

---

## 🐛 Troubleshooting

### Frontend can't connect to backend:
- Check `VITE_API_BASE_URL` in Vercel environment variables
- Verify backend is deployed and healthy
- Check browser console for errors

### CORS errors:
- Verify `ALLOWED_ORIGINS` in Render includes your Vercel URL
- Include both main and git branch URLs

### Backend not starting:
- Check Render logs for errors
- Verify all required environment variables are set
- Check MongoDB connection string

### Render service sleeping:
- Free tier sleeps after 15min inactivity
- First request takes ~30 seconds to wake
- Upgrade to Starter plan for always-on

### Google Sign-In not working:
- Verify Google OAuth origins include production URLs
- Check both frontend and backend have correct Client ID
- Remove localhost from production OAuth config

---

## 📊 Monitoring

### Vercel Analytics:
- Go to your project → **Analytics** tab
- View page views, performance metrics

### Render Logs:
- Go to your service → **Logs** tab
- View real-time server logs

### MongoDB Metrics:
- Go to MongoDB Atlas → **Metrics** tab
- View database performance

---

## 🔐 Security Best Practices

- ✅ Use strong, randomly generated secrets
- ✅ Enable MongoDB IP whitelist
- ✅ Keep dependencies updated
- ✅ Monitor error logs regularly
- ✅ Set up uptime monitoring (UptimeRobot)
- ✅ Enable MongoDB automated backups

---

## 📞 Support

If you encounter issues:
1. Check platform status:
   - https://www.vercelstatus.com/
   - https://status.render.com/
2. Review logs in platform dashboards
3. Check documentation:
   - Vercel: https://vercel.com/docs
   - Render: https://render.com/docs

---

## 🎯 Quick Reference

### Your Deployment URLs:
```
Frontend: https://your-app.vercel.app
Backend: https://rental-backend-xxxx.onrender.com
API Health: https://rental-backend-xxxx.onrender.com/api/health
```

### Important Files:
- `frontend/vercel.json` - Vercel configuration
- `backend/render.yaml` - Render Blueprint
- `frontend/VERCEL_DEPLOY.md` - Vercel details
- `backend/RENDER_DEPLOY.md` - Render details

---

**Deployment Time:** ~15-20 minutes total
**Status:** ✅ Ready to deploy
