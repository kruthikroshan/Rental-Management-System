# Security Guidelines

## 🔒 Pre-Deployment Security Checklist

### 1. Environment Variables

**Critical**: Never commit `.env` files to version control!

#### Required Environment Variables for Production

```bash
# Generate secure secrets using:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

- `JWT_SECRET` - Must be at least 64 characters, randomly generated
- `JWT_REFRESH_SECRET` - Must be at least 64 characters, randomly generated
- `MONGODB_URI` - Use MongoDB Atlas with IP whitelisting
- `SESSION_SECRET` - Must be at least 32 characters, randomly generated
- `ALLOWED_ORIGINS` - Comma-separated list of allowed frontend URLs

#### Optional but Recommended

- `CLOUDINARY_*` - For secure image uploads
- `SMTP_*` - For email notifications
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` - For OAuth

### 2. Database Security

✅ **MongoDB Atlas Configuration:**
- Enable IP Whitelist (Network Access)
- Use strong database user passwords
- Enable MongoDB encryption at rest
- Regular backups enabled
- Use connection string with `retryWrites=true&w=majority`

✅ **Local MongoDB:**
- Enable authentication
- Use non-default ports
- Restrict network access

### 3. API Security

✅ **Implemented:**
- Helmet.js for secure HTTP headers
- Rate limiting (configurable)
- CORS with whitelist
- Input validation with express-validator
- Password hashing with bcrypt (12 rounds)
- JWT token expiration
- Account lockout after failed login attempts

✅ **To Configure:**
- Set `NODE_ENV=production`
- Update `ALLOWED_ORIGINS` with your production URLs
- Configure rate limiting: `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS`

### 4. Frontend Security

✅ **Implemented:**
- XSS prevention through React
- HTTPS enforcement (configure in production)
- Secure cookie handling
- Token storage in localStorage (consider httpOnly cookies for enhanced security)

### 5. Google OAuth Security

⚠️ **Important Configuration:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: APIs & Services → Credentials
3. Select your OAuth 2.0 Client ID
4. Add Authorized JavaScript origins:
   - Your production domain (e.g., `https://yourdomain.com`)
   - Remove `http://localhost:5173` in production
5. Add Authorized redirect URIs:
   - `https://yourdomain.com/auth/callback`

### 6. Password Policy

✅ **Current Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### 7. Dependencies

✅ **Security Maintenance:**
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Update packages regularly
npm update
```

## 🚨 Known Security Considerations

### Current Implementation

1. **JWT Storage**: Tokens stored in localStorage (consider httpOnly cookies)
2. **Password Reset**: Implement token-based password reset with expiration
3. **Email Verification**: Implement email verification for new accounts
4. **2FA**: Consider adding two-factor authentication
5. **Session Management**: Implement session invalidation on password change

### Recommended Enhancements

1. **HTTPS Only**: Enforce HTTPS in production
2. **Content Security Policy**: Customize CSP headers for your domain
3. **API Documentation**: Use Swagger with authentication
4. **Logging**: Implement security event logging
5. **Monitoring**: Set up intrusion detection

## 🛡️ Production Deployment Steps

1. **Generate Secure Secrets**
   ```bash
   node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
   node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
   node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Update Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in all production values
   - Never commit `.env` files

3. **Configure MongoDB Atlas**
   - Whitelist production server IPs
   - Enable monitoring and alerts

4. **Configure CORS**
   - Set `ALLOWED_ORIGINS` to production domain(s) only
   - Remove localhost entries

5. **Enable HTTPS**
   - Use SSL/TLS certificates (Let's Encrypt recommended)
   - Configure reverse proxy (Nginx/Apache)

6. **Set NODE_ENV**
   ```bash
   export NODE_ENV=production
   ```

7. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

8. **Run Database Migrations** (if any)

9. **Start Application**
   ```bash
   cd backend
   npm start
   ```

## 📝 Security Incident Response

If you discover a security vulnerability:
1. Do NOT create a public GitHub issue
2. Email: security@yourdomain.com
3. Include: Description, steps to reproduce, potential impact

## 🔐 Compliance

Consider compliance requirements:
- GDPR (EU users)
- CCPA (California users)
- PCI DSS (if handling payments)
- HIPAA (if handling health data)

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
