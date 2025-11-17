# Security Implementation Guide

## Overview
This application implements multiple layers of security to protect against common web vulnerabilities and attacks.

## Security Features Implemented

### 1. Authentication & Authorization
- **JWT Token-based Authentication**
  - Access tokens (7-day expiry)
  - Refresh tokens (30-day expiry)
  - Secure token storage and validation

- **Password Security**
  - Bcrypt hashing with configurable salt rounds (default: 12)
  - Strong password requirements:
    - Minimum 8 characters, maximum 128 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character
  - Common password blacklist
  - Account lockout after 5 failed attempts (15-minute lockout)

- **Multi-factor Authentication Ready**
  - Google OAuth integration
  - Email verification system

### 2. Input Validation & Sanitization
- **XSS Prevention**
  - HTML tag removal from user inputs
  - JavaScript protocol blocking
  - Event handler stripping
  - Content escaping for output

- **SQL/NoSQL Injection Prevention**
  - MongoDB query sanitization
  - Prototype pollution protection
  - Parameter pollution prevention
  - ObjectId validation

- **Input Validation**
  - Email format validation
  - Phone number sanitization
  - Name validation (letters and spaces only)
  - URL sanitization with allowed domain checking
  - File upload validation (type, size, name)

### 3. Rate Limiting & DDoS Protection
- **Authentication Rate Limiting**
  - Login: 5 attempts per 15 minutes per IP
  - Password reset: 3 attempts per hour per IP
  - General API: 100 requests per 15 minutes per IP

- **Slow-down Middleware**
  - Progressive delays after 10 requests
  - 500ms delay increment per request

### 4. Security Headers
- **Helmet.js Implementation**
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY (clickjacking protection)
  - X-XSS-Protection: 1; mode=block
  - Strict-Transport-Security (HSTS)
  - Referrer-Policy: strict-origin-when-cross-origin
  - Content-Security-Policy (production)

- **Custom Security Headers**
  - X-Powered-By header removal
  - Custom CSP configuration
  - CORS with whitelist validation

### 5. CORS Configuration
- **Origin Validation**
  - Environment-based allowed origins
  - Automatic local development origins
  - Credentials support
  - Preflight request handling

### 6. Request Security
- **Content-Type Validation**
  - Enforced for POST/PUT/PATCH requests
  - Only allows JSON, form-data, and multipart

- **Request Size Limits**
  - JSON payload: 10MB (configurable)
  - URL-encoded: 10MB (configurable)

- **Suspicious Pattern Detection**
  - Script tag detection
  - SQL injection pattern blocking
  - Directory traversal prevention
  - Malicious payload identification

### 7. Session Security
- **Account Protection**
  - Login attempt tracking
  - Automatic account lockout
  - Last login timestamp
  - Active session management

- **Token Security**
  - Secure token generation
  - Token expiration
  - Refresh token rotation
  - Token invalidation on logout

### 8. Database Security
- **Connection Security**
  - MongoDB connection string validation
  - Connection pooling
  - Automatic reconnection handling

- **Query Protection**
  - Mongoose schema validation
  - Query sanitization
  - Index optimization for performance

### 9. Error Handling
- **Secure Error Messages**
  - Generic error messages in production
  - Detailed errors only in development
  - No stack trace exposure
  - Consistent error format

- **Error Response Format**
  ```json
  {
    "success": false,
    "message": "Generic error message",
    "error": "Detailed error (dev only)"
  }
  ```

### 10. File Upload Security
- **File Validation**
  - Extension whitelist (.jpg, .jpeg, .png, .pdf)
  - File size limits (5MB default)
  - Filename sanitization
  - Directory traversal prevention
  - MIME type verification

## Environment Variables Required

### Critical Security Variables
```bash
# JWT Configuration (REQUIRED)
JWT_SECRET=<64+ character random string>
JWT_REFRESH_SECRET=<64+ character random string>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Database (REQUIRED)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Password Hashing
BCRYPT_SALT_ROUNDS=12

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Request Size
MAX_REQUEST_SIZE=10mb

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Generating Secure Secrets
```bash
# Generate JWT secrets (Node.js)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use OpenSSL
openssl rand -hex 64
```

## Best Practices

### 1. Password Management
- Never store passwords in plain text
- Use bcrypt with minimum 12 salt rounds
- Implement password history to prevent reuse
- Enforce password expiration policies (optional)
- Provide password strength indicator to users

### 2. Token Management
- Store tokens securely (HttpOnly cookies or secure storage)
- Never expose tokens in URLs
- Implement token refresh mechanism
- Revoke tokens on logout
- Monitor for token theft/abuse

### 3. API Security
- Always validate input on server side
- Never trust client-side validation
- Implement proper error handling
- Log security events (without sensitive data)
- Monitor for unusual patterns

### 4. Database Security
- Use environment variables for credentials
- Enable MongoDB authentication
- Use connection string encryption
- Implement database backups
- Regular security audits

### 5. Production Deployment
- Always use HTTPS/TLS
- Enable all security headers
- Set NODE_ENV=production
- Use strong, unique secrets
- Implement monitoring and alerting
- Regular security updates
- Penetration testing

## Security Checklist

- [ ] All environment variables configured
- [ ] Strong JWT secrets generated (64+ characters)
- [ ] HTTPS enabled in production
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL/NoSQL injection protection active
- [ ] XSS protection implemented
- [ ] CSRF tokens for state-changing operations
- [ ] Security headers configured
- [ ] Error messages sanitized for production
- [ ] Logging configured (without sensitive data)
- [ ] Database credentials secured
- [ ] Regular security updates scheduled
- [ ] Backup and recovery plan in place
- [ ] Incident response plan documented

## Common Vulnerabilities Prevented

1. **SQL/NoSQL Injection** - Sanitization + Parameterized queries
2. **Cross-Site Scripting (XSS)** - Input sanitization + Output escaping
3. **Cross-Site Request Forgery (CSRF)** - Token validation
4. **Brute Force Attacks** - Rate limiting + Account lockout
5. **Session Hijacking** - Secure tokens + HTTPS
6. **Clickjacking** - X-Frame-Options header
7. **Man-in-the-Middle** - HTTPS + HSTS
8. **Directory Traversal** - Path sanitization
9. **Prototype Pollution** - Object sanitization
10. **Open Redirect** - URL validation
11. **DDoS Attacks** - Rate limiting + Request size limits
12. **Information Disclosure** - Error sanitization
13. **Weak Password** - Password strength validation
14. **Insecure Direct Object Reference** - Authorization checks

## Security Testing

### Manual Testing
```bash
# Test rate limiting
for i in {1..10}; do curl -X POST http://localhost:3000/api/auth/login; done

# Test input validation
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"<script>alert(1)</script>","password":"test"}'

# Test SQL injection
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com OR 1=1--","password":"any"}'
```

### Automated Testing
- Use OWASP ZAP for vulnerability scanning
- Implement security unit tests
- Run dependency vulnerability checks: `npm audit`
- Use Snyk or similar for continuous monitoring

## Incident Response

### If Security Breach Detected:
1. Immediately revoke all active sessions/tokens
2. Force password reset for affected users
3. Review logs for breach extent
4. Patch vulnerability
5. Notify affected users
6. Document incident
7. Implement additional safeguards

## Monitoring & Logging

### What to Log (Without Sensitive Data):
- Failed login attempts
- Account lockouts
- Unusual API usage patterns
- Invalid token attempts
- Suspicious request patterns
- Security header violations
- Rate limit violations

### What NOT to Log:
- Passwords (plain or hashed)
- JWT tokens
- API keys
- Personal identifiable information (PII)
- Credit card numbers
- Session IDs

## Regular Maintenance

### Weekly
- Review failed login attempts
- Check for unusual activity patterns
- Monitor rate limit violations

### Monthly
- Update dependencies (`npm audit fix`)
- Review security logs
- Test backup restoration
- Verify monitoring alerts

### Quarterly
- Security audit
- Penetration testing
- Update security policies
- Review and rotate secrets

## Contact & Support

For security concerns or to report vulnerabilities:
- **DO NOT** open public issues for security vulnerabilities
- Contact: [Your Security Email]
- Use responsible disclosure practices
- Provide detailed reproduction steps

## References
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
