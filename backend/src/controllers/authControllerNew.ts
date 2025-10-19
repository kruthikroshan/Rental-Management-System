import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { jwtUtils } from '../utils/jwt';
import { validationResult } from 'express-validator';
import crypto from 'crypto';

export class AuthController {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
        return;
      }

      const { name, email, password, phone, role = UserRole.CUSTOMER } = req.body;

      // Check if user exists
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
        return;
      }

      // Create user
      const user = this.userRepository.create({
        name,
        email,
        password,
        phone,
        role: role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.CUSTOMER
      });

      await this.userRepository.save(user);

      // Generate tokens
      const { accessToken, refreshToken } = jwtUtils.generateTokenPair({
        userId: user.id.toString(),
        email: user.email,
        role: user.role,
        permissions: user.permissions
      });

      // Remove sensitive data
      const { passwordHash, ...userResponse } = user;

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userResponse,
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
          }
        }
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
        return;
      }

      const { email, password } = req.body;

      // Find user with password
      const user = await this.userRepository.findOne({
        where: { email, isActive: true },
        select: ['id', 'name', 'email', 'passwordHash', 'role', 'permissions', 'loginAttempts', 'lockUntil']
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }

      // Check if account is locked
      if (user.isLocked()) {
        res.status(423).json({
          success: false,
          message: 'Account temporarily locked due to too many failed login attempts'
        });
        return;
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        await user.incrementLoginAttempts();
        await this.userRepository.save(user);
        
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }

      // Reset login attempts and update last login
      user.resetLoginAttempts();
      user.lastLogin = new Date();
      await this.userRepository.save(user);

      // Generate tokens
      const { accessToken, refreshToken } = jwtUtils.generateTokenPair({
        userId: user.id.toString(),
        email: user.email,
        role: user.role,
        permissions: user.permissions
      });

      // Remove sensitive data
      const { passwordHash, loginAttempts, lockUntil, ...userResponse } = user;

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
          }
        }
      });

    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(String(req.user?.id || '0'));
      
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['profile']
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      const { passwordHash, ...userResponse } = user;

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user: userResponse }
      });

    } catch (error: any) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token is required'
        });
        return;
      }

      const decoded = jwtUtils.verifyRefreshToken(refreshToken);
      const userId = parseInt(decoded.userId);

      const user = await this.userRepository.findOne({
        where: { id: userId, isActive: true }
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
        return;
      }

      // Generate new tokens
      const tokens = jwtUtils.generateTokenPair({
        userId: user.id.toString(),
        email: user.email,
        role: user.role,
        permissions: user.permissions
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens: {
            ...tokens,
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
          }
        }
      });

    } catch (error: any) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        // Don't reveal if email exists or not for security
        res.status(200).json({
          success: true,
          message: 'If the email exists, a password reset link has been sent'
        });
        return;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await this.userRepository.save(user);

      // TODO: Send email with reset link
      // await emailService.sendPasswordResetEmail(user.email, resetToken);

      res.status(200).json({
        success: true,
        message: 'Password reset link has been sent to your email',
        // TODO: Remove in production
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      });

    } catch (error: any) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process password reset request'
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      const user = await this.userRepository.findOne({
        where: {
          passwordResetToken: token,
        }
      });

      if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
        return;
      }

      // Update password
      user.password = newPassword; // Will be hashed by entity hook
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.resetLoginAttempts(); // Reset any login attempts

      await this.userRepository.save(user);

      res.status(200).json({
        success: true,
        message: 'Password has been reset successfully'
      });

    } catch (error: any) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset password'
      });
    }
  }
}

// Export controller functions for routes
const authController = new AuthController();

export const register = authController.register.bind(authController);
export const login = authController.login.bind(authController);
export const getProfile = authController.getProfile.bind(authController);
export const refreshToken = authController.refreshToken.bind(authController);
export const forgotPassword = authController.forgotPassword.bind(authController);
export const resetPassword = authController.resetPassword.bind(authController);
