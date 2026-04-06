import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../users/users.model.js';
import { config } from '../config/configuration.js';
import { OTPService } from './otp.service.js';

function signAccessToken(payload) {
  return jwt.sign(payload, config.jwt.accessSecret, { expiresIn: config.jwt.accessTtlSec });
}
function signRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshTtlSec });
}

export const AuthService = {
  _resolveIdentifier(identifier) {
    const raw = String(identifier || '').trim();
    if (!raw) throw new Error('Email or phone number is required');

    if (raw.includes('@')) {
      const email = raw.toLowerCase();
      return { identifier: email, query: { email }, type: 'email' };
    }

    const normalizedPhone = raw.replace(/[^\d+]/g, '');
    if (!/^\+?\d{10,15}$/.test(normalizedPhone)) {
      throw new Error('Please enter a valid phone number');
    }

    return {
      identifier: normalizedPhone,
      query: { phoneNumber: normalizedPhone },
      type: 'phone'
    };
  },

  // New helper: validate credentials only (no tokens here)
  async validateCredentials({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid email or password');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new Error('Invalid email or password');
    return user;
  },

  async register({ name, email, password }) {
    const exists = await User.findOne({ email });
    if (exists) throw new Error('Email already in use');
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      passwordHash,
      isEmailVerified: false
    });

    // Generate OTP for email verification
    try {
      const otpResult = await OTPService.generateOTP(email);

      return {
        user: this._publicUser(user),
        message: 'Registration successful. Please verify your email with the OTP sent.',
        requiresVerification: true,
        otp: otpResult.otp // Return OTP for development
      };
    } catch (error) {
      // If OTP fails to send, delete the newly created user so they aren't stuck unverified
      await User.findByIdAndDelete(user._id);
      throw error;
    }
  },

  async login({ email, password }) {
    const user = await this.validateCredentials({ email, password });
    
    // Simple login - no email verification required
    const tokens = await this._issueTokens(user);
    return { user: this._publicUser(user), ...tokens };
  },

  // Verify email with OTP
  async verifyEmail({ email, otp }) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');
    
    if (user.isEmailVerified) {
      throw new Error('Email is already verified');
    }
    
    // Verify OTP
    await OTPService.verifyOTP(email, otp);
    
    // Mark email as verified
    user.isEmailVerified = true;
    await user.save();
    
    // Issue tokens after successful verification
    const tokens = await this._issueTokens(user);
    return { 
      user: this._publicUser(user), 
      message: 'Email verified successfully',
      ...tokens 
    };
  },

  // Resend OTP
  async resendOTP({ email }) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');
    
    if (user.isEmailVerified) {
      throw new Error('Email is already verified');
    }
    
    return await OTPService.generateOTP(email);
  },

  // Request password reset OTP
  async requestPasswordReset({ identifier }) {
    const target = this._resolveIdentifier(identifier);
    const user = await User.findOne(target.query);
    if (!user) throw new Error('User not found');
    
    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();
    
    // Generate OTP for password reset
    const otpResult = await OTPService.generateOTP(target.identifier);
    
    return { 
      message: `Password reset OTP generated for your ${target.type === 'email' ? 'email' : 'phone number'}`,
      resetToken,
      otp: otpResult.otp,
      identifier: target.identifier
    };
  },

  // Reset password with OTP
  async resetPassword({ identifier, otp, newPassword, resetToken }) {
    const target = this._resolveIdentifier(identifier);
    const user = await User.findOne(target.query);
    if (!user) throw new Error('User not found');
    
    // Verify reset token
    if (!user.passwordResetToken || !user.passwordResetExpires) {
      throw new Error('Invalid or expired reset token');
    }
    
    if (new Date() > user.passwordResetExpires) {
      throw new Error('Reset token has expired');
    }
    
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    if (hashedToken !== user.passwordResetToken) {
      throw new Error('Invalid reset token');
    }
    
    // Verify OTP
    await OTPService.verifyOTP(target.identifier, otp);
    
    // Update password
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.refreshTokenHash = null; // Invalidate all sessions
    await user.save();
    
    return { message: 'Password reset successfully' };
  },

  // --- Phone Auth Methods ---

  async requestPhoneOTP({ phoneNumber }) {
    const normalizedPhone = String(phoneNumber || '').trim().replace(/[^\d+]/g, '');
    if (!/^\+?\d{10,15}$/.test(normalizedPhone)) {
      throw new Error('Phone number is required');
    }
    
    // Check if user exists, otherwise it will be created on verification
    const user = await User.findOne({ phoneNumber: normalizedPhone });
    
    // Generate OTP
    const otpResult = await OTPService.generateOTP(normalizedPhone);
    
    return {
      message: 'OTP sent to your phone number',
      otp: otpResult.otp, // For development
      isNewUser: !user
    };
  },

  async verifyPhoneOTP({ phoneNumber, otp, name }) {
    const normalizedPhone = String(phoneNumber || '').trim().replace(/[^\d+]/g, '');
    if (!/^\+?\d{10,15}$/.test(normalizedPhone) || !otp) {
      throw new Error('Phone number and OTP are required');
    }
    
    // Verify OTP
    await OTPService.verifyOTP(normalizedPhone, otp);
    
    let user = await User.findOne({ phoneNumber: normalizedPhone });
    
    if (!user) {
      // Create new user if it doesn't exist
      if (!name) throw new Error('Name is required for new users');
      const syntheticEmail = `${normalizedPhone}@phone.local`;
      user = await User.create({
        email: syntheticEmail,
        phoneNumber: normalizedPhone,
        name,
        provider: 'phone',
        isPhoneVerified: true,
        isEmailVerified: false,
        // No password needed for phone-only login
      });
    } else {
      user.isPhoneVerified = true;
      await user.save();
    }
    
    const tokens = await this._issueTokens(user);
    return {
      user: this._publicUser(user),
      message: 'Logged in successfully',
      ...tokens
    };
  },

  // --- /Phone Auth Methods ---
  // Used by /auth/login-admin after role check
  async issueFor(user) {
    const tokens = await this._issueTokens(user);
    return { user: this._publicUser(user), ...tokens };
  },

  async refresh(userId, refreshToken) {
    if (!userId) throw new Error('Invalid refresh token');
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
      if (decoded.sub !== userId) throw new Error('Invalid refresh token');
    } catch {
      throw new Error('Invalid refresh token');
    }

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const incomingHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    if (!user.refreshTokenHash || user.refreshTokenHash !== incomingHash) {
      throw new Error('Refresh token mismatch');
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role || 'customer' });
    const newRefreshToken = signRefreshToken({ sub: user.id });

    user.refreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    await user.save();

    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(userId) {
    if (!userId) return;
    const user = await User.findById(userId);
    if (!user) return;
    user.refreshTokenHash = null;
    await user.save();
  },

  _publicUser(user) {
    return {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      name: user.name,
      provider: user.provider || 'email',
      role: user.role || 'customer',
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified
    };
  },

  async _issueTokens(user) {
    const accessToken = signAccessToken({ sub: user.id, role: user.role || 'customer' });
    const newRefreshToken = signRefreshToken({ sub: user.id });
    user.refreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    await user.save();
    return { accessToken, refreshToken: newRefreshToken };
  }
};

