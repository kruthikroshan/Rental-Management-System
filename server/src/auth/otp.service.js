import crypto from 'crypto';
// Corrected: Changed to a default import (no curly braces)
import NotificationsService from '../notifications/notifications.service.js';

// In-memory OTP store (in production, use Redis or a database for better scalability)
const otpStore = new Map();
const REAL_OTP_ENABLED = process.env.ENABLE_REAL_OTP === 'true';

export const OTPService = {
  /**
   * Generates a 6-digit OTP, stores it, and sends it via email or phone.
   * @param {string} identifier - The user's email or phone number.
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async generateOTP(identifier) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    otpStore.set(identifier, {
      otp,
      expiresAt,
      attempts: 0,
      maxAttempts: 3 // Allow up to 3 verification attempts
    });

    console.log(`🔐 OTP for ${identifier}: ${otp}`);

    if (REAL_OTP_ENABLED) {
      try {
        if (identifier.includes('@')) {
          await NotificationsService.sendOTPEmail(identifier, otp);
        } else {
          // Phone SMS implementation here
          console.log(`📱 SMS OTP for ${identifier}: ${otp}`);
        }
      } catch (error) {
        console.error(`❌ Notification failed for ${identifier}:`, error.message);
        // Clean up the generated OTP since it wasn't sent
        otpStore.delete(identifier);
        throw new Error('Failed to send OTP notification. Check SMTP configuration.');
      }
    } else {
      console.log(`🧪 OTP screen-only mode active for ${identifier}`);
    }

    return {
      success: true,
      message: REAL_OTP_ENABLED ? 'OTP sent successfully' : 'OTP generated (screen-only mode)',
      otp
    };
  },

  /**
   * Verifies the provided OTP against the stored OTP.
   * @param {string} identifier - The user's identifier.
   * @param {string} providedOTP - The OTP provided by the user.
   * @returns {Promise<{success: boolean}>}
   */
  async verifyOTP(identifier, providedOTP) {
    const otpInput = String(providedOTP || '');
    if (!/^\d{6}$/.test(otpInput)) {
      throw new Error('OTP must be a valid 6-digit code');
    }

    const otpData = otpStore.get(identifier);

    if (!REAL_OTP_ENABLED) {
      if (otpData) otpStore.delete(identifier);
      return { success: true };
    }
    
    if (!otpData) {
      throw new Error('OTP not found. Please request a new one.');
    }

    if (new Date() > otpData.expiresAt) {
      otpStore.delete(identifier);
      throw new Error('OTP has expired. Please request a new one.');
    }

    if (otpData.attempts >= otpData.maxAttempts) {
      otpStore.delete(identifier);
      throw new Error('Maximum OTP attempts exceeded. Please request a new one.');
    }

    if (otpData.otp !== otpInput) {
      otpData.attempts++;
      otpStore.set(identifier, otpData); // Update the attempts count
      throw new Error('Invalid OTP. Please try again.');
    }

    // If OTP is valid, remove it from the store to prevent reuse
    otpStore.delete(identifier);
    return { success: true };
  },

  /**
   * Checks if a valid OTP exists for a given identifier.
   * @param {string} identifier - The user's identifier.
   * @returns {boolean}
   */
  hasOTP(identifier) {
    const otpData = otpStore.get(identifier);
    return otpData && new Date() <= otpData.expiresAt;
  },

  /**
   * Clears the OTP for a given identifier.
   * @param {string} identifier - The user's identifier.
   */
  clearOTP(identifier) {
    otpStore.delete(identifier);
  },

  /**
   * Gets the number of remaining verification attempts.
   * @param {string} identifier - The user's identifier.
   * @returns {number}
   */
  getRemainingAttempts(identifier) {
    const otpData = otpStore.get(identifier);
    if (!otpData) return 0;
    return Math.max(0, otpData.maxAttempts - otpData.attempts);
  },

  /**
   * Gets the current OTP for a given identifier (for development/testing).
   * @param {string} identifier - The user's identifier.
   * @returns {string|null}
   */
  getOTP(identifier) {
    const otpData = otpStore.get(identifier);
    if (!otpData || new Date() > otpData.expiresAt) {
      return null;
    }
    return otpData.otp;
  }
};
