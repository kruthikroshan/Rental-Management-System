import { Request, Response, NextFunction } from 'express';
import { deepCleanObject, sanitizeErrorMessage } from '../utils/privacy';

/**
 * Middleware to automatically sanitize all response data
 * Removes sensitive fields before sending responses to clients
 */
export const sanitizeResponse = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Store the original json method
  const originalJson = res.json.bind(res);

  // Override the json method
  res.json = function (data: any): Response {
    // Clean the data before sending
    const cleanedData = deepCleanObject(data);
    return originalJson(cleanedData);
  };

  next();
};

/**
 * Middleware to sanitize error responses
 * Prevents sensitive information leakage in error messages
 */
export const sanitizeErrors = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Sanitize error message
  const sanitizedMessage = sanitizeErrorMessage(err.message || err);

  // In production, hide detailed error information
  const isProduction = process.env.NODE_ENV === 'production';

  const errorResponse = {
    success: false,
    error: sanitizedMessage,
    ...(isProduction
      ? {}
      : {
          // Include stack trace only in development
          stack: err.stack,
          originalError: err.toString(),
        }),
  };

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware to prevent data exposure in query parameters and headers
 */
export const sanitizeRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Remove sensitive headers from being logged or exposed
  const sensitiveHeaders = [
    'authorization',
    'cookie',
    'x-api-key',
    'x-auth-token',
  ];

  // Create a safe copy of headers for logging
  if (req.headers) {
    const safeHeaders = { ...req.headers };
    sensitiveHeaders.forEach((header) => {
      if (safeHeaders[header]) {
        safeHeaders[header] = '[REDACTED]';
      }
    });
    (req as any).safeHeaders = safeHeaders;
  }

  next();
};

/**
 * Middleware to add security headers for data protection
 */
export const privacyHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Prevent browsers from caching sensitive data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Prevent sensitive data from being embedded in other sites
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Additional privacy headers
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
};

/**
 * Rate limiting for data access endpoints
 * Prevents unauthorized data scraping
 */
import rateLimit from 'express-rate-limit';

export const dataAccessLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    success: false,
    error: 'Too many data access requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please try again later.',
    });
  },
});

/**
 * Middleware to log data access attempts (for audit trail)
 * Does NOT log sensitive data
 */
export const auditDataAccess = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const auditLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: (req as any).user?.id || 'anonymous',
    userAgent: req.get('user-agent'),
  };

  // In production, you would send this to a secure logging service
  if (process.env.ENABLE_AUDIT_LOGS === 'true') {
    // Log to secure audit service (not console in production)
    console.log('[AUDIT]', JSON.stringify(auditLog));
  }

  next();
};

/**
 * Middleware to ensure user can only access their own data
 */
export const enforceDataOwnership = (userIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authenticatedUserId = (req as any).user?.id;
    const requestedUserId = req.params[userIdField] || req.body[userIdField];

    if (!authenticatedUserId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    // Admins can access any data
    if ((req as any).user?.role === 'admin') {
      next();
      return;
    }

    // Regular users can only access their own data
    if (requestedUserId && requestedUserId !== authenticatedUserId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You can only access your own data.',
      });
      return;
    }

    next();
  };
};
