# 🚀 Vercel Deployment Guide

## Quick Deploy (Recommended)

### Step 1: Prepare Repository

Your code is already on GitHub! ✅
Repository: https://github.com/kruthikroshan/Rental-Management-System

### Step 2: Deploy Frontend to Vercel

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Click "Sign up" or "Login"
   - Choose "Continue with GitHub"

2. **Import Your Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Find `kruthikroshan/Rental-Management-System`
   - Click "Import"

3. **Configure Build Settings**

   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variable**
   
   Click "Environment Variables" and add:
   
   ```
   Name: VITE_API_BASE_URL
   Value: http://localhost:3000 (temporary - update after backend deployment)
   ```

5. **Deploy!**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your site will be live at: `https://your-project-name.vercel.app`

---

## Step 3: Deploy Backend to Render (Required)

Your frontend needs a backend! Let's deploy it:

### Deploy Backend to Render

1. **Go to Render**
   - Visit: https://render.com
   - Click "Sign up" or "Login"
   - Choose "Continue with GitHub"

2. **Create Web Service**
   - Click "New" → "Web Service"
   - Select your GitHub repository
   - Click "Connect"

3. **Configure Service**

   ```
   Name: rental-management-api
   Region: Select closest to you
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: node dist/server.js
   Instance Type: Free
   ```

4. **Add Environment Variables**

   Click "Environment" and add ALL these variables:

   ```env
   MONGODB_URI=mongodb+srv://Kruthik:Kruthik123@cluster0.hiuczje.mongodb.net/
   DB_NAME=rental_db
   JWT_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
   JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-too-min-32-chars
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_EXPIRES_IN=7d
   PORT=3000
   NODE_ENV=production
   CORS_ORIGIN=https://your-project-name.vercel.app
   ```

5. **Deploy Backend**
   - Click "Create Web Service"
   - Wait 5-10 minutes for build
   - Note your backend URL: `https://rental-management-api.onrender.com`

---

## Step 4: Update Frontend Environment Variable

1. **Go back to Vercel Dashboard**
   - Open your project settings
   - Click "Settings" → "Environment Variables"

2. **Update VITE_API_BASE_URL**
   - Delete the old value
   - Add new value: `https://rental-management-api.onrender.com`

3. **Redeploy Frontend**
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - Wait 2-3 minutes

---

## ✅ Done! Your App is Live!

- **Frontend**: `https://your-project-name.vercel.app`
- **Backend**: `https://rental-management-api.onrender.com`

### Test Your Deployment

1. Open your Vercel URL
2. Login with: `admin@test.com` / `Admin123!`
3. Check dashboard loads properly
4. Try creating a product

---

## 🎯 Alternative: Vercel CLI (Advanced)

If you prefer command line:

### 1. Install Vercel CLI

```powershell
npm install -g vercel
```

### 2. Login to Vercel

```powershell
vercel login
```

### 3. Deploy

```powershell
# Navigate to frontend directory
cd frontend

# Deploy to Vercel
vercel

# Follow prompts:
# Set up and deploy? Yes
# Which scope? Your account
# Link to existing project? No
# What's your project's name? rental-management
# In which directory is your code located? ./
# Want to override settings? No

# Deploy to production
vercel --prod
```

### 4. Set Environment Variable

```powershell
vercel env add VITE_API_BASE_URL production
# Enter value: https://your-backend-url.onrender.com
```

### 5. Redeploy

```powershell
vercel --prod
```

---

## 📝 Important Notes

### Free Tier Limitations

**Vercel Free:**
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Custom domains
- ⚠️ 100GB bandwidth/month

**Render Free:**
- ✅ 750 hours/month
- ⚠️ Spins down after 15 min inactivity
- ⚠️ Cold starts (30-60 sec wake up)
- ✅ Automatic HTTPS

### Backend Cold Start Issue

On Render's free tier, the backend sleeps after 15 minutes. First request after sleep takes 30-60 seconds.

**Solutions:**
1. Upgrade to Render paid plan ($7/month)
2. Use Railway.app (better free tier)
3. Use a cron job to ping every 14 minutes
4. Deploy to AWS/Azure free tier

---

## 🔧 Troubleshooting

### Issue: "Failed to fetch" on Vercel

**Solution:** Update CORS in backend

```typescript
// backend/src/server.ts
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-project-name.vercel.app',
    'https://*.vercel.app' // Allow all Vercel preview deployments
  ],
  credentials: true
}));
```

Commit and push changes:

```powershell
git add .
git commit -m "Update CORS for Vercel deployment"
git push
```

Render will auto-deploy the update.

### Issue: "Module not found" error

**Solution:** Ensure `vercel.json` has correct paths

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist"
}
```

### Issue: Environment variables not working

**Solution:** 
1. Make sure variable names match exactly (case-sensitive)
2. Redeploy after adding variables
3. Check Vercel logs: Dashboard → Project → Deployments → View Function Logs

### Issue: API calls failing

**Solution:**
1. Check backend is running: Visit `https://your-backend-url.onrender.com/health`
2. Check CORS settings in backend
3. Verify `VITE_API_BASE_URL` is correct
4. Check browser console for errors

---

## 🎨 Custom Domain (Optional)

### Add Custom Domain to Vercel

1. Go to Vercel Dashboard → Your Project
2. Click "Settings" → "Domains"
3. Add your domain: `rental.yourdomain.com`
4. Update DNS records as instructed
5. Wait for DNS propagation (5-30 minutes)

### Add Custom Domain to Render

1. Go to Render Dashboard → Your Service
2. Click "Settings" → "Custom Domain"
3. Add your domain: `api.yourdomain.com`
4. Update DNS with provided CNAME
5. Update Vercel's `VITE_API_BASE_URL` to your custom domain

---

## 🔄 Automatic Deployments

Both Vercel and Render automatically deploy when you push to GitHub!

```powershell
# Make changes to code
git add .
git commit -m "Add customer search feature"
git push

# Vercel automatically deploys frontend
# Render automatically deploys backend
# Wait 2-5 minutes, changes are live!
```

---

## 📊 Monitor Deployments

### Vercel Dashboard
- Real-time build logs
- Performance analytics
- Error tracking
- Preview deployments for PRs

### Render Dashboard
- Build logs
- Runtime logs
- Metrics (CPU, Memory)
- Health checks

---

## 🎉 Success Checklist

- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render
- [ ] Environment variables set
- [ ] CORS configured
- [ ] Frontend redeployed with backend URL
- [ ] Login tested on production
- [ ] Dashboard loads properly
- [ ] API calls working

---

## 🆘 Need Help?

**Vercel Issues:**
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord
- Support: support@vercel.com

**Render Issues:**
- Docs: https://render.com/docs
- Discord: https://render.com/discord
- Support: support@render.com

---

**Created**: October 19, 2025  
**Repository**: https://github.com/kruthikroshan/Rental-Management-System  
**Status**: Ready to Deploy 🚀
