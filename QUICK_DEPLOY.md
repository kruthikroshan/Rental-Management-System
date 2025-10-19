# 🚀 Quick Deploy to Vercel

## Method 1: One-Click Deploy (Easiest)

### Step-by-Step:

1. **Open Vercel**: https://vercel.com
2. **Sign in with GitHub**
3. **Click "Add New..." → "Project"**
4. **Import your repository**: `kruthikroshan/Rental-Management-System`
5. **Configure**:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```
6. **Add Environment Variable**:
   ```
   VITE_API_BASE_URL = http://localhost:3000
   ```
   (Update this after deploying backend)
7. **Click "Deploy"** 🚀

---

## What Happens Next?

✅ Vercel builds your frontend (2-3 minutes)  
✅ Deploys to global CDN  
✅ Gives you a URL: `https://your-app.vercel.app`  
✅ Automatic HTTPS enabled  

---

## ⚠️ Important: Deploy Backend Too!

Your frontend needs a backend. You have 3 options:

### Option A: Render (Recommended - Free)
1. Go to: https://render.com
2. Sign in with GitHub
3. Create "Web Service"
4. Select your repository
5. Configure:
   ```
   Root Directory: backend
   Build Command: npm install && npm run build
   Start Command: node dist/server.js
   ```
6. Add environment variables (see VERCEL_DEPLOYMENT.md)
7. Deploy!
8. Copy your backend URL: `https://your-app.onrender.com`

### Option B: Railway (Better Free Tier)
1. Go to: https://railway.app
2. "Start a New Project"
3. "Deploy from GitHub repo"
4. Select `backend` as root
5. Add environment variables
6. Deploy!

### Option C: Keep Running Locally
- Keep backend running on your computer
- Use ngrok to expose: `ngrok http 3000`
- Update Vercel env: `VITE_API_BASE_URL=https://your-id.ngrok.io`

---

## Update Frontend with Backend URL

After deploying backend:

1. **Go to Vercel Dashboard**
2. **Your Project → Settings → Environment Variables**
3. **Edit `VITE_API_BASE_URL`**:
   ```
   https://your-backend-url.onrender.com
   ```
4. **Go to Deployments tab**
5. **Click "..." → "Redeploy"**
6. **Done!** ✅

---

## Test Your Deployment

1. Open your Vercel URL
2. Try to login: `admin@test.com` / `Admin123!`
3. If it works → 🎉 Success!
4. If not → Check browser console for errors

---

## Troubleshooting

### "Failed to fetch" error?
→ Backend isn't deployed or CORS issue
→ Deploy backend first, then update `VITE_API_BASE_URL`

### "Network Error"?
→ Wrong backend URL
→ Check `VITE_API_BASE_URL` in Vercel settings

### "Cannot GET /dashboard"?
→ SPA routing issue
→ Already fixed in `vercel.json` ✅

---

## 📱 Share Your App!

Once deployed:
```
Frontend: https://your-app.vercel.app
Backend: https://your-api.onrender.com
```

Share the frontend URL with anyone! 🎉

---

## Need More Help?

See full guide: `VERCEL_DEPLOYMENT.md`

**Next Steps:**
1. Deploy frontend now (3 min)
2. Deploy backend (10 min)
3. Update environment variable (2 min)
4. Test and share! 🚀

---

**Ready to deploy?** Go to: https://vercel.com/new
