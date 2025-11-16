# Production Deployment Guide

## 🚀 Quick Deployment Checklist

### Before Deployment

- [ ] All security vulnerabilities fixed (`npm audit`)
- [ ] Environment variables configured (see `.env.example`)
- [ ] MongoDB Atlas configured with IP whitelist
- [ ] Google OAuth configured for production domain
- [ ] HTTPS/SSL certificates ready
- [ ] Domain DNS configured

---

## 📋 Detailed Deployment Steps

### 1. Generate Secure Secrets

Run this command to generate secure secrets:

```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Configure Backend Environment

Create `backend/.env` with production values:

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rental_db?retryWrites=true&w=majority

# JWT - Use generated secrets from step 1
JWT_SECRET=<your-64-char-secret-here>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<your-64-char-refresh-secret-here>
JWT_REFRESH_EXPIRES_IN=30d

# Security
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS - Your production frontend URL
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@yourdomain.com

# Session
SESSION_SECRET=<your-32-char-session-secret-here>

# API
API_TIMEOUT=30000
MAX_REQUEST_SIZE=10mb
```

### 3. Configure Frontend Environment

Create `frontend/.env` with production values:

```bash
# API Base URL - Your production backend URL
VITE_API_BASE_URL=https://api.yourdomain.com

# Google OAuth - Same Client ID as backend
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 4. Configure MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. **Network Access** → Add IP Address
   - For production server: Add specific IP
   - For testing: Can temporarily use 0.0.0.0/0 (Allow from anywhere)
3. **Database Access** → Create database user with strong password
4. **Clusters** → Connect → Get connection string
5. Update `MONGODB_URI` in backend `.env`

### 5. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Select your OAuth 2.0 Client ID
4. **Authorized JavaScript origins:**
   - Add: `https://yourdomain.com`
   - Add: `https://www.yourdomain.com`
   - Remove: `http://localhost:5173`
5. **Authorized redirect URIs:**
   - Add: `https://yourdomain.com`
   - Add: `https://www.yourdomain.com`

### 6. Install Dependencies

```bash
# Backend
cd backend
npm install --production

# Frontend
cd ../frontend
npm install
```

### 7. Build Frontend

```bash
cd frontend
npm run build
```

This creates an optimized production build in `frontend/dist/`.

### 8. Set Up Reverse Proxy (Nginx Example)

Create `/etc/nginx/sites-available/rental-management`:

```nginx
# Frontend (Static Files)
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend
    root /path/to/rental-management/frontend/dist;
    index index.html;

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/rental-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 9. Set Up SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 10. Start Backend with PM2

Install PM2 (Production Process Manager):

```bash
npm install -g pm2
```

Start the application:

```bash
cd backend
pm2 start npm --name "rental-backend" -- start
pm2 save
pm2 startup
```

Useful PM2 commands:
```bash
pm2 list              # List all processes
pm2 logs rental-backend   # View logs
pm2 restart rental-backend # Restart
pm2 stop rental-backend    # Stop
pm2 delete rental-backend  # Remove
```

---

## 🔧 Alternative Deployment Options

### Deploy on Heroku

1. **Backend**:
```bash
cd backend
heroku create your-app-name-api
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
# Set all other environment variables
git push heroku main
```

2. **Frontend** (on Vercel/Netlify):
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables

### Deploy on Vercel (Full Stack)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

### Deploy on Railway

1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically on push

---

## 📊 Post-Deployment

### 1. Health Check

```bash
curl https://api.yourdomain.com/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Rental Management API is running",
  "timestamp": "2025-11-16T...",
  "version": "1.0.0",
  "environment": "production"
}
```

### 2. Monitor Logs

```bash
# PM2 logs
pm2 logs rental-backend

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### 3. Set Up Monitoring

Consider using:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **New Relic** or **DataDog** for APM
- **UptimeRobot** for uptime monitoring

### 4. Database Backups

Configure MongoDB Atlas automated backups:
1. Go to Clusters → Backup
2. Enable **Continuous Backup** or **Cloud Provider Snapshots**
3. Set retention policy

---

## 🔄 Updates and Maintenance

### Deploy Updates

```bash
# Pull latest code
git pull origin main

# Backend
cd backend
npm install
pm2 restart rental-backend

# Frontend
cd ../frontend
npm install
npm run build
# Nginx will serve the new build automatically
```

### Security Updates

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Update dependencies
npm update
```

### Database Migrations

If you add new database migrations:
```bash
cd backend
npm run migrate  # If you have migration scripts
```

---

## 🚨 Troubleshooting

### Issue: Can't connect to MongoDB
- Check IP whitelist in MongoDB Atlas
- Verify connection string
- Check network connectivity

### Issue: CORS errors
- Verify `ALLOWED_ORIGINS` includes your frontend domain
- Check Google OAuth authorized origins

### Issue: 502 Bad Gateway
- Check if backend is running: `pm2 status`
- Check backend logs: `pm2 logs`
- Verify Nginx proxy configuration

### Issue: SSL certificate errors
- Renew certificate: `sudo certbot renew`
- Check certificate expiration: `sudo certbot certificates`

---

## 📞 Support

For issues or questions:
- Check logs first
- Review SECURITY.md
- Contact: support@yourdomain.com
