import { Request, Response } from 'express';
import { UserModel, IUser, UserRole } from '../models/User.model';
import { jwtUtils } from '../utils/jwt';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      console.log('Register request body:', req.body);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
        return;
      }

      const { name, email, password, phone, role = UserRole.CUSTOMER } = req.body;

      // Check if user exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
        return;
      }

      // Hash password
      console.log('Creating user with data:', { name, email, phone, role });
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = new UserModel({
        name,
        email,
        passwordHash,
        phone,
        // For demo purposes, make new users managers to access all features
        role: role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.MANAGER
      });

      console.log('User created, saving to database...');
      await user.save();
      console.log('User saved with ID:', user._id);

      // Generate tokens
      console.log('Generating tokens for user:', user._id);
      const { accessToken, refreshToken } = jwtUtils.generateTokenPair({
        userId: String(user._id),
        email: user.email,
        role: user.role,
        permissions: user.permissions || []
      });

      // Remove sensitive data
      const userResponse = user.toJSON();

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
      console.log('Login request body:', req.body);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Login validation errors:', errors.array());
        res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
        return;
      }

      const { email, password } = req.body;

      // Check MongoDB connection status
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 1) {
        res.status(503).json({
          success: false,
          message: 'Database connection unavailable. Please try again later.'
        });
        return;
      }

      // Find user with password using Mongoose
      const user = await UserModel.findOne({ 
        email: email.toLowerCase(), 
        isActive: true 
      }).select('+passwordHash');

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > new Date()) {
        res.status(423).json({
          success: false,
          message: 'Account temporarily locked due to too many failed login attempts'
        });
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        // Increment login attempts
        user.loginAttempts = (user.loginAttempts || 0) + 1;
        
        // Lock account after 5 failed attempts
        if (user.loginAttempts >= 5) {
          user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
        }
        
        await user.save();
        
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }

      // Reset login attempts and update last login
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const { accessToken, refreshToken } = jwtUtils.generateTokenPair({
        userId: String(user._id),
        email: user.email,
        role: user.role,
        permissions: user.permissions
      });

      // Prepare user response (exclude sensitive data)
      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        permissions: user.permissions,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

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

  async googleLogin(req: Request, res: Response): Promise<void> {
    try {
      const { credential, email, name, picture } = req.body;

      if (!email || !name) {
        res.status(400).json({
          success: false,
          message: 'Email and name are required from Google authentication'
        });
        return;
      }

      // Check MongoDB connection status
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 1) {
        res.status(503).json({
          success: false,
          message: 'Database connection unavailable. Please try again later.'
        });
        return;
      }

      // Check if user exists
      let user = await UserModel.findOne({ 
        email: email.toLowerCase()
      });

      if (user) {
        // If user exists but doesn't have googleId, update it
        if (!user.googleId && credential) {
          user.googleId = credential;
          user.authProvider = 'google';
          user.isEmailVerified = true; // Google emails are verified
          if (picture && !user.avatarUrl) {
            user.avatarUrl = picture;
          }
          await user.save();
        }

        // Check if account is active
        if (!user.isActive) {
          res.status(403).json({
            success: false,
            message: 'Account is deactivated. Please contact support.'
          });
          return;
        }
      } else {
        // Create new user with Google authentication
        user = new UserModel({
          name,
          email: email.toLowerCase(),
          googleId: credential,
          authProvider: 'google',
          isEmailVerified: true,
          isActive: true,
          role: UserRole.MANAGER, // Default role for new Google users
          avatarUrl: picture,
          // No password required for Google auth
          passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12) // Random password
        });

        await user.save();
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const { accessToken, refreshToken } = jwtUtils.generateTokenPair({
        userId: String(user._id),
        email: user.email,
        role: user.role,
        permissions: user.permissions
      });

      // Prepare user response
      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        permissions: user.permissions,
        lastLogin: user.lastLogin,
        loginAttempts: user.loginAttempts,
        lockUntil: user.lockUntil,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      res.status(200).json({
        success: true,
        message: user ? 'Google login successful' : 'Account created and logged in successfully',
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
      console.error('Google login error:', error);
      res.status(500).json({
        success: false,
        message: 'Google login failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = String(req.user?.id || '');
      
      const user = await UserModel.findById(userId).select('-passwordHash');

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user }
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
      const userId = decoded.userId;

      const user = await UserModel.findOne({
        _id: userId,
        isActive: true
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

      const user = await UserModel.findOne({ email: email.toLowerCase() });

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

      await user.save();

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

      const user = await UserModel.findOne({
        passwordResetToken: token
      });

      if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
        return;
      }

      // Hash and update password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
      user.passwordHash = await bcrypt.hash(newPassword, saltRounds);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.loginAttempts = 0; // Reset any login attempts
      user.lockUntil = undefined;

      await user.save();

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
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = String(req.user?.id || '');
      const { name, phone } = req.body;

      const user = await UserModel.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Update user fields
      if (name) user.name = name;
      if (phone) user.phone = phone;

      await user.save();

      const userResponse: any = user.toObject();
      delete userResponse.passwordHash;

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: userResponse }
      });

    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = String(req.user?.id || '');
      const { currentPassword, newPassword } = req.body;

      const user = await UserModel.findById(userId).select('+passwordHash');

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

      if (!isCurrentPasswordValid) {
        res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
        return;
      }

      // Hash and update password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
      user.passwordHash = await bcrypt.hash(newPassword, saltRounds);
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error: any) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      // In a stateless JWT system, logout is handled client-side
      // But we can implement token blacklisting if needed
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to logout'
      });
    }
  }

  async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      const userId = String(req.user?.id || '');
      const { password } = req.body;

      const user = await UserModel.findById(userId).select('+passwordHash');

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Verify password for security
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        res.status(400).json({
          success: false,
          message: 'Password verification failed'
        });
        return;
      }

      // Soft delete - deactivate account instead of hard delete
      user.isActive = false;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
      });

    } catch (error: any) {
      console.error('Delete account error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete account'
      });
    }
  }
}

// Export controller functions for routes
const authController = new AuthController();

export const register = authController.register.bind(authController);
export const login = authController.login.bind(authController);
export const googleLogin = authController.googleLogin.bind(authController);
export const getProfile = authController.getProfile.bind(authController);
export const updateProfile = authController.updateProfile.bind(authController);
export const changePassword = authController.changePassword.bind(authController);
export const logout = authController.logout.bind(authController);
export const deleteAccount = authController.deleteAccount.bind(authController);
export const refreshToken = authController.refreshToken.bind(authController);
export const forgotPassword = authController.forgotPassword.bind(authController);
export const resetPassword = authController.resetPassword.bind(authController);
