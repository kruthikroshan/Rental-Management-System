import { Request, Response, NextFunction } from 'express';
import { UserModel, IUser, UserPermission } from '../models/User.model';
import { jwtUtils, JwtPayload } from '../utils/jwt';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      tokenPayload?: JwtPayload;
    }
  }
}

/**
 * Authentication middleware to verify JWT tokens
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
      return;
    }

    // Extract token from header
    const token = jwtUtils.extractTokenFromHeader(authHeader);
    
    // Verify token
    const payload = jwtUtils.verifyAccessToken(token);
    
    // Find user in database using Mongoose
    const user = await UserModel.findById(payload.userId).select('name email role permissions isActive');
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
      return;
    }

    // Attach user to request object
    req.user = user;
    req.tokenPayload = payload;
    
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid token'
    });
  }
};

/**
 * Authorization middleware to check user roles
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions - role not authorized'
      });
      return;
    }

    next();
  };
};

/**
 * Permission-based authorization middleware
 */
export const requirePermission = (...permissions: UserPermission[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.some(permission => 
      userPermissions.includes(permission) || userPermissions.includes(UserPermission.READ_ALL)
    );

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions - specific permission required'
      });
      return;
    }

    next();
  };
};

/**
 * Optional authentication middleware (user is attached if token is present but doesn't fail if missing)
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      next();
      return;
    }

    const token = jwtUtils.extractTokenFromHeader(authHeader);
    const payload = jwtUtils.verifyAccessToken(token);
    
    const user = await UserModel.findById(payload.userId).select('name email role permissions isActive');
    
    if (user && user.isActive) {
      req.user = user;
      req.tokenPayload = payload;
    }
    
    next();
  } catch (error) {
    // Don't fail on optional auth, just continue without user
    next();
  }
};

/**
 * Middleware to check if user owns the resource or has admin privileges
 */
export const resourceOwnerOrAdmin = (userIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Admin and manager can access any resource
    if (['admin', 'manager'].includes(req.user.role)) {
      next();
      return;
    }

    // Check if user owns the resource
    const resourceUserId = req.params[userIdField] || req.body[userIdField] || req.query[userIdField];
    
    if (req.user.id.toString() !== resourceUserId) {
      res.status(403).json({
        success: false,
        message: 'Access denied - you can only access your own resources'
      });
      return;
    }

    next();
  };
};

/**
 * Rate limiting middleware for authentication routes
 */
export const authRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  // This would typically use a rate limiting library like express-rate-limit
  // For now, we'll implement a basic version
  const clientIp = req.ip || req.connection.remoteAddress;
  
  // In production, you'd use Redis or similar to track attempts
  // For demo purposes, we'll skip the actual implementation
  next();
};

/**
 * Middleware to validate refresh token
 */
export const validateRefreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
      return;
    }

    const payload = jwtUtils.verifyRefreshToken(refreshToken);
    
    const user = await UserModel.findById(payload.userId).select('name email role permissions isActive');
    
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid refresh token'
    });
  }
};
