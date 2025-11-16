# Render Deployment (Backend)

This backend is configured to deploy on Render.

## Quick Deploy

1. **Create Render Account**:
   - Go to https://render.com/
   - Sign up with GitHub

2. **Create New Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service**:
   - **Name**: `rental-backend` (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for better performance)

4. **Add Environment Variables**:
   
   Click "Advanced" → "Add Environment Variable":

   **Required:**
   ```
   NODE_ENV = production
   PORT = 10000
   MONGODB_URI = your-mongodb-connection-string
   JWT_SECRET = your-generated-secret
   JWT_REFRESH_SECRET = your-generated-refresh-secret
   ALLOWED_ORIGINS = https://your-frontend.vercel.app
   ```

   **Optional:**
   ```
   GOOGLE_CLIENT_ID = your-google-client-id
   GOOGLE_CLIENT_SECRET = your-google-client-secret
   SESSION_SECRET = your-session-secret
   BCRYPT_SALT_ROUNDS = 12
   JWT_EXPIRES_IN = 7d
   JWT_REFRESH_EXPIRES_IN = 30d
   RATE_LIMIT_WINDOW_MS = 900000
   RATE_LIMIT_MAX_REQUESTS = 100
   ```

   **Generate Secrets:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

5. **Deploy**: Click "Create Web Service"

## Blueprint Deploy (Alternative)

Use `render.yaml` for infrastructure-as-code:

1. In Render Dashboard, click "New" → "Blueprint"
2. Connect your repository
3. Render will auto-detect `render.yaml`
4. Add secret environment variables manually

## Auto-Deploy

After setup, Render automatically deploys on push to `main` branch.

## Health Check

Render uses: `GET /api/health`

Expected response:
```json
{
  "success": true,
  "message": "Rental Management API is running"
}
```

## Custom Domain

1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS CNAME record
4. SSL is automatic

## Logs

View logs in Render Dashboard → Logs tab

## Configuration Files

- `render.yaml` - Render Blueprint configuration
- `.env.example` - Environment variable template

## Important Notes

- Free tier sleeps after 15 min inactivity
- First request after sleep takes ~30 seconds
- Upgrade to paid tier for always-on service
- MongoDB Atlas: Whitelist Render IP or use 0.0.0.0/0
