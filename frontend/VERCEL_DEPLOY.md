# Vercel Deployment (Frontend)

This frontend is configured to deploy on Vercel.

## Quick Deploy

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Connect GitHub Repository**:
   - Go to https://vercel.com/
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the `frontend` folder as root directory

3. **Configure Build Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables** in Vercel Dashboard:
   ```
   VITE_API_BASE_URL = https://your-backend.onrender.com
   VITE_GOOGLE_CLIENT_ID = your-google-client-id.apps.googleusercontent.com
   ```

5. **Deploy**: Click "Deploy"

## Manual Deploy via CLI

```bash
cd frontend
vercel --prod
```

## Auto-Deploy

After initial setup, Vercel automatically deploys:
- **Production**: on push to `main` branch
- **Preview**: on pull requests

## Configuration Files

- `vercel.json` - Vercel configuration (SPA routing)
- `.env.example` - Environment variable template

## Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `ALLOWED_ORIGINS` in backend
