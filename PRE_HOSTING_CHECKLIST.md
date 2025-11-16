# 🚀 Pre-Hosting Security & Deployment Checklist

## ✅ Security Fixes Completed

### Package Vulnerabilities
- [x] Ran `npm audit` on backend and frontend
- [x] Fixed all high and moderate severity vulnerabilities
- [x] Updated cloudinary to 2.8.0
- [x] Updated js-yaml to 4.1.1+
- [x] Current status: **0 vulnerabilities**

### Environment Security
- [x] Created secure `.env.example` templates
- [x] Added environment variable validation
- [x] Removed hardcoded secrets from code
- [x] Added warnings for weak/default secrets
- [x] Confirmed `.env` files in `.gitignore`

### Authentication & Authorization
- [x] Removed mock/demo authentication
- [x] Enforced real database authentication
- [x] JWT secret validation (min 32 chars in production)
- [x] Password hashing with bcrypt (12 rounds)
- [x] Account lockout after failed attempts
- [x] Token expiration configured

### API Security
- [x] Helmet.js security headers enabled
- [x] CORS configured with environment variables
- [x] Rate limiting implemented (configurable)
- [x] Input validation with express-validator
- [x] Request size limits configured
- [x] XSS protection enabled
- [x] CSRF protection considerations

### Google OAuth
- [x] Re-enabled Google Sign-In
- [x] Client ID configured via environment
- [x] Ready for production domain configuration

---

## 📋 Before Hosting - Critical Steps

### 1. Generate Production Secrets

**Run these commands and save the output:**

```bash
# Generate JWT Secret (64 bytes = 128 hex chars)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT Refresh Secret
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Generate Session Secret
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Backend Environment Configuration

**Create `backend/.env` with these values:**

```bash
# CRITICAL: Replace all placeholder values!

# Server
PORT=3000
NODE_ENV=production

# MongoDB Atlas
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/rental_db?retryWrites=true&w=majority

# JWT (use generated secrets from step 1)
JWT_SECRET=PASTE_GENERATED_JWT_SECRET_HERE
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=PASTE_GENERATED_REFRESH_SECRET_HERE
JWT_REFRESH_EXPIRES_IN=30d

# Security
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS (your production frontend URL)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# Session
SESSION_SECRET=PASTE_GENERATED_SESSION_SECRET_HERE

# Optional: Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@yourdomain.com
```

**Validation:**
```bash
cd backend
npm run dev
# Check for errors or warnings
```

### 3. Frontend Environment Configuration

**Create `frontend/.env`:**

```bash
# Production Backend URL
VITE_API_BASE_URL=https://api.yourdomain.com

# Google OAuth (same as backend)
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

### 4. MongoDB Atlas Setup

**Network Access:**
1. Go to: https://cloud.mongodb.com/
2. Navigate to: **Network Access**
3. Click: **+ ADD IP ADDRESS**
4. Options:
   - **Specific IP**: Enter your production server IP (recommended)
   - **Temporary Testing**: Use 0.0.0.0/0 (allow from anywhere) - disable later!

**Database User:**
1. Navigate to: **Database Access**
2. Click: **+ ADD NEW DATABASE USER**
3. Create user with:
   - Username: Choose a unique name
   - Password: Generate strong password (save it!)
   - Database User Privileges: "Read and write to any database"

**Connection String:**
1. Go to: **Clusters** → **Connect**
2. Choose: **Connect your application**
3. Copy connection string
4. Replace `<username>`, `<password>`, and `<cluster>` in your `.env`

### 5. Google OAuth Configuration

**For Production Domain:**
1. Go to: https://console.cloud.google.com/
2. Navigate to: **APIs & Services** → **Credentials**
3. Select your **OAuth 2.0 Client ID**
4. Under **Authorized JavaScript origins**, ADD:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`
5. Under **Authorized redirect URIs**, ADD:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`
6. **REMOVE** all `localhost` entries
7. Click **Save**

### 6. Build Frontend

```bash
cd frontend
npm run build
```

This creates optimized production files in `frontend/dist/`.

---

## 🔍 Pre-Launch Testing

### Local Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend builds successfully
- [ ] Can register new user
- [ ] Can login with email/password
- [ ] Google Sign-In works (if configured)
- [ ] JWT tokens are being issued
- [ ] Protected routes require authentication
- [ ] API responses are correct
- [ ] No console errors in browser

### Security Testing

```bash
# Test environment validation
cd backend
# Remove JWT_SECRET from .env temporarily
npm run dev
# Should show error and not start

# Test rate limiting (if enabled)
# Make multiple rapid requests to API endpoint
```

---

## 🌐 Deployment Options

### Option 1: Traditional VPS (DigitalOcean, AWS EC2, Linode)

**Steps:**
1. Install Node.js, Nginx, and certbot on server
2. Upload code via git or FTP
3. Install dependencies: `npm install --production`
4. Set up environment variables
5. Configure Nginx as reverse proxy
6. Install SSL with Let's Encrypt: `certbot --nginx`
7. Start backend with PM2: `pm2 start npm --name rental-backend -- start`
8. Serve frontend static files via Nginx

**Cost:** ~$5-10/month
**Difficulty:** Medium
**Full Control:** Yes

See `DEPLOYMENT.md` for detailed VPS setup guide.

---

### Option 2: Heroku (Backend) + Vercel/Netlify (Frontend)

**Backend on Heroku:**
```bash
cd backend
heroku create your-app-name-api
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_uri
# Set all other environment variables
git push heroku main
```

**Frontend on Vercel:**
1. Sign up: https://vercel.com/
2. Connect GitHub repository
3. Select `frontend` folder
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variables
7. Deploy

**Cost:** Free tier available
**Difficulty:** Easy
**Best for:** Quick deployment

---

### Option 3: Railway (Full Stack)

1. Sign up: https://railway.app/
2. **New Project** → **Deploy from GitHub**
3. Select repository
4. Add two services:
   - Backend (root: `backend`)
   - Frontend (root: `frontend`)
5. Add environment variables to each service
6. Railway auto-deploys on git push

**Cost:** $5/month (free trial available)
**Difficulty:** Easy
**Best for:** Simple full-stack deployment

---

### Option 4: Docker + Cloud Provider

**Create Dockerfile (backend):**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Deploy to:
- Google Cloud Run
- AWS ECS
- Azure Container Instances

**Cost:** Pay-as-you-go
**Difficulty:** Medium-Hard
**Best for:** Scalability

---

## 🔒 Post-Deployment Security

### Immediate Actions

1. **Test Production API**
   ```bash
   curl https://api.yourdomain.com/api/health
   ```

2. **Monitor Logs**
   - Check for errors
   - Watch for suspicious activity
   - Set up log aggregation (LogRocket, Papertrail)

3. **Set Up Monitoring**
   - Uptime monitoring (UptimeRobot, Pingdom)
   - Error tracking (Sentry)
   - Performance monitoring (New Relic)

4. **Enable Backups**
   - MongoDB Atlas automated backups
   - Code repository backups
   - Environment variable backups (securely!)

5. **Security Headers Check**
   - Test at: https://securityheaders.com/
   - Should score A or A+

### Ongoing Maintenance

**Weekly:**
- [ ] Review application logs
- [ ] Check uptime reports
- [ ] Monitor error rates

**Monthly:**
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Review MongoDB Atlas metrics
- [ ] Check SSL certificate expiration
- [ ] Review user authentication logs

**Quarterly:**
- [ ] Update dependencies: `npm update`
- [ ] Review and update API rate limits
- [ ] Security audit
- [ ] Performance optimization

---

## 📊 Success Criteria

Your application is ready for production when:

- ✅ All security vulnerabilities are fixed
- ✅ Environment variables are properly configured
- ✅ MongoDB connection is secured with IP whitelist
- ✅ HTTPS is enforced
- ✅ CORS is properly configured
- ✅ Google OAuth works with production domain
- ✅ No sensitive data in git repository
- ✅ Error handling doesn't leak sensitive information
- ✅ Rate limiting is configured
- ✅ Monitoring and alerting are set up
- ✅ Backup strategy is in place
- ✅ Documentation is complete

---

## 🆘 Quick Troubleshooting

### Backend won't start
- Check `.env` file exists and has all required variables
- Verify MongoDB connection string
- Check Node.js version (20+ recommended)

### Frontend can't connect to backend
- Verify `VITE_API_BASE_URL` is correct
- Check CORS `ALLOWED_ORIGINS` includes frontend URL
- Ensure backend is running and accessible

### Google Sign-In fails
- Verify authorized origins include your domain
- Check `GOOGLE_CLIENT_ID` matches in both frontend and backend
- Ensure you're using HTTPS in production

### Database connection fails
- Check MongoDB Atlas IP whitelist
- Verify database user credentials
- Test connection string format

---

## 📚 Reference Documents

- **SECURITY.md** - Complete security guidelines
- **DEPLOYMENT.md** - Detailed deployment instructions
- **SECURITY_FIXES_SUMMARY.md** - Summary of all security fixes
- **backend/.env.example** - Backend environment template
- **frontend/.env.example** - Frontend environment template

---

## ✅ Final Checklist

Before going live, ensure:

- [ ] Generated secure production secrets
- [ ] Configured backend `.env` with production values
- [ ] Configured frontend `.env` with production values
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Google OAuth configured for production domain
- [ ] Frontend built successfully (`npm run build`)
- [ ] SSL/TLS certificate installed
- [ ] `NODE_ENV=production` set
- [ ] All tests passing
- [ ] Error monitoring set up
- [ ] Backups configured
- [ ] Documentation reviewed
- [ ] No `.env` files committed to git

---

**Status**: ✅ All security vulnerabilities fixed and ready for deployment

**Last Updated**: November 16, 2025

**Next Step**: Follow deployment guide for your chosen hosting platform
