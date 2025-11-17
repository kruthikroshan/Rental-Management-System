/**
 * Advanced Security Middleware
 * Implements various security measures for API protection
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

/**
 * Request sanitization middleware
 * Removes dangerous characters from request data
 */
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction): void => {
  // Sanitize request body, query, and params
  if (req.body && typeof req.body === 'object') {
    req.body = mongoSanitize.sanitize(req.body, {
      replaceWith: '_',
      onSanitize: ({ req, key }) => {
        // Log sanitization attempts in production
        if (process.env.NODE_ENV === 'production') {
          // Could log to monitoring service
        }
      }
    });
  }
  
  if (req.query && typeof req.query === 'object') {
    req.query = mongoSanitize.sanitize(req.query, { replaceWith: '_' });
  }
  
  if (req.params && typeof req.params === 'object') {
    req.params = mongoSanitize.sanitize(req.params, { replaceWith: '_' });
  }
  
  next();
};

/**
 * Strict rate limiter for authentication endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development'
});

/**
 * Rate limiter for password reset
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development'
});

/**
 * General API rate limiter
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development'
});

/**
 * Slow down middleware for brute force protection
 */
export const slowDown = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  delayAfter: 10, // Start delaying after 10 requests
  delayMs: 500, // Add 500ms delay per request after delayAfter
  skip: (req) => process.env.NODE_ENV === 'development'
});

/**
 * Check for suspicious patterns in requests
 */
export const detectSuspiciousActivity = (req: Request, res: Response, next: NextFunction): void => {
  const suspiciousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /eval\(/gi,
    /expression\(/gi,
    /<iframe/gi,
    /\.\.\/\.\.\//g, // Directory traversal
    /union.*select/gi, // SQL injection
    /script.*src/gi
  ];
  
  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };
  
  // Check all request data
  const isSuspicious = 
    checkValue(req.body) ||
    checkValue(req.query) ||
    checkValue(req.params) ||
    checkValue(req.headers['user-agent']);
  
  if (isSuspicious) {
    res.status(400).json({
      success: false,
      message: 'Request contains suspicious content'
    });
    return;
  }
  
  next();
};

/**
 * Prevent parameter pollution
 */
export const preventParameterPollution = (req: Request, res: Response, next: NextFunction): void => {
  // Convert array query params to single values (take first value)
  if (req.query) {
    for (const [key, value] of Object.entries(req.query)) {
      if (Array.isArray(value) && value.length > 0) {
        req.query[key] = value[0];
      }
    }
  }
  
  next();
};

/**
 * Validate content type for POST/PUT/PATCH requests
 */
export const validateContentType = (req: Request, res: Response, next: NextFunction): void => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    
    if (!contentType) {
      res.status(400).json({
        success: false,
        message: 'Content-Type header is required'
      });
      return;
    }
    
    // Allow only JSON and form data
    const allowedTypes = [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data'
    ];
    
    const isValid = allowedTypes.some(type => contentType.includes(type));
    
    if (!isValid) {
      res.status(415).json({
        success: false,
        message: 'Unsupported content type'
      });
      return;
    }
  }
  
  next();
};

/**
 * Add security headers to response
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'"
    );
  }
  
  next();
};

/**
 * Validate request ID to prevent injection
 */
export const validateRequestId = (req: Request, res: Response, next: NextFunction): void => {
  const id = req.params.id;
  
  if (id) {
    // MongoDB ObjectId validation (24 hex characters)
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
      return;
    }
  }
  
  next();
};

/**
 * Prevent timing attacks on authentication
 */
export const constantTimeResponse = async (
  operation: () => Promise<any>,
  minimumMs: number = 500
): Promise<any> => {
  const start = Date.now();
  const result = await operation();
  const elapsed = Date.now() - start;
  
  if (elapsed < minimumMs) {
    await new Promise(resolve => setTimeout(resolve, minimumMs - elapsed));
  }
  
  return result;
};
