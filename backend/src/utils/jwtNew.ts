import jwt from 'jsonwebtoken';
import { User } from '../entities/User';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface UserTokenData {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

class JwtUtils {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly refreshSecret: string;
  private readonly refreshExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-jwt-secret-key-for-development';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key-for-development';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
  }

  /**
   * Generate access token
   */
  generateAccessToken(userData: UserTokenData): string {
    const payload: JwtPayload = {
      userId: userData.userId,
      email: userData.email,
      role: userData.role,
      permissions: userData.permissions
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
      issuer: 'rental-management-system',
      audience: 'rental-management-users'
    } as jwt.SignOptions);
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(userData: UserTokenData): string {
    const payload = {
      userId: userData.userId,
      email: userData.email,
      tokenType: 'refresh'
    };

    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn,
      issuer: 'rental-management-system',
      audience: 'rental-management-users'
    } as jwt.SignOptions);
  }

  /**
   * Generate both access and refresh tokens
   */
  generateTokenPair(userData: UserTokenData): TokenPair {
    return {
      accessToken: this.generateAccessToken(userData),
      refreshToken: this.generateRefreshToken(userData)
    };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.jwtSecret, {
        issuer: 'rental-management-system',
        audience: 'rental-management-users'
      }) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, this.refreshSecret, {
        issuer: 'rental-management-system',
        audience: 'rental-management-users'
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      } else {
        throw new Error('Refresh token verification failed');
      }
    }
  }

  /**
   * Extract user ID from token without verification (for middleware)
   */
  extractUserIdFromToken(token: string): string | null {
    try {
      const decoded = jwt.decode(token) as JwtPayload;
      return decoded?.userId || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired without throwing error
   */
  isTokenExpired(token: string): boolean {
    try {
      jwt.verify(token, this.jwtSecret);
      return false;
    } catch (error) {
      return error instanceof jwt.TokenExpiredError;
    }
  }

  /**
   * Get token expiration date
   */
  getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded?.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate token from user entity
   */
  generateTokenPairFromUser(user: User): TokenPair {
    const userData: UserTokenData = {
      userId: user.id.toString(),
      email: user.email,
      role: user.role,
      permissions: user.permissions
    };

    return this.generateTokenPair(userData);
  }
}

export const jwtUtils = new JwtUtils();
