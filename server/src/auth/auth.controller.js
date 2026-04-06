import { AuthService } from './auth.service.js';
import { OAuthService } from './oauth.service.js';
import { OTPService } from './otp.service.js';
import { config } from '../config/configuration.js';

function setRefreshCookie(res, token) {
  const maxAgeMs = config.jwt.refreshTtlSec * 1000;
  res.cookie(config.cookies.name, token, {
    httpOnly: true,
    secure: config.cookies.secure,
    sameSite: config.cookies.sameSite,
    maxAge: maxAgeMs,
    path: config.cookies.path
  });
}

export const AuthController = {
  register: async (req, res) => {
    console.log('[DEBUG] Register endpoint hit!');
    console.log('[DEBUG] Request body:', req.body);
    try {
      const { name, email, password } = req.body;
      console.log(`📝 Registration attempt: ${email}`);

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
      }

      console.log('[DEBUG] About to call AuthService.register');
      const result = await AuthService.register({ name, email, password });
      console.log('[DEBUG] AuthService.register returned:', result);
      console.log(`✅ Registration successful: ${email}`);

      if (result.requiresVerification) {
        const response = {
          user: result.user,
          message: result.message,
          requiresVerification: true
        };
        // In development, include OTP in response for easy testing
        if (process.env.NODE_ENV !== 'production') {
          response.otp = result.otp;
          console.log(`🔐 OTP for ${email}: ${result.otp}`);
        }
        res.status(201).json(response);
      } else {
        setRefreshCookie(res, result.refreshToken);
        res.status(201).json({ user: result.user, accessToken: result.accessToken });
      }
    } catch (e) {
      console.error(`❌ Registration failed for ${req.body?.email}:`, e.message);
      console.error('[DEBUG] Full error:', e);
      res.status(400).json({ message: e.message || 'Registration failed' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(`🔑 Login attempt: ${email}`);
      
      const result = await AuthService.login({ email, password });
      console.log(`✅ Login successful: ${email}`);
      
      setRefreshCookie(res, result.refreshToken);
      res.json({ user: result.user, accessToken: result.accessToken });
    } catch (e) {
      console.error(`❌ Login failed for ${req.body?.email}:`, e.message);
      res.status(401).json({ message: e.message || 'Login failed' });
    }
  },

  // Verify email with OTP
  verifyEmail: async (req, res) => {
    try {
      const { email, otp } = req.body;
      const { user, accessToken, refreshToken, message } = await AuthService.verifyEmail({ email, otp });
      setRefreshCookie(res, refreshToken);
      res.json({ user, accessToken, message });
    } catch (e) {
      res.status(400).json({ message: e.message || 'Email verification failed' });
    }
  },

  // Resend OTP
  resendOTP: async (req, res) => {
    try {
      const { email } = req.body;
      const result = await AuthService.resendOTP({ email });
      const response = { ...result };
      // In development, include OTP in response
      if (process.env.NODE_ENV !== 'production') {
        response.otp = result.otp;
      }
      res.json(response);
    } catch (e) {
      res.status(400).json({ message: e.message || 'Failed to resend OTP' });
    }
  },

  // Request password reset
  requestPasswordReset: async (req, res) => {
    try {
      const { email } = req.body;
      const result = await AuthService.requestPasswordReset({ email });
      const response = { ...result };
      // In development, include OTP in response for easy testing
      if (process.env.NODE_ENV !== 'production') {
        const otp = OTPService.getOTP(email);
        if (otp) {
          response.otp = otp;
        }
      }
      res.json(response);
    } catch (e) {
      res.status(400).json({ message: e.message || 'Failed to request password reset' });
    }
  },

  // Reset password with OTP
  resetPassword: async (req, res) => {
    try {
      const { email, otp, newPassword, resetToken } = req.body;
      const result = await AuthService.resetPassword({ email, otp, newPassword, resetToken });
      res.json(result);
    } catch (e) {
      res.status(400).json({ message: e.message || 'Password reset failed' });
    }
  },
  // NEW: admin-only login endpoint
  loginAdmin: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await AuthService.validateCredentials({ email, password });
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Not an admin account' });
      }
      const { user: publicUser, accessToken, refreshToken } = await AuthService.issueFor(user);
      setRefreshCookie(res, refreshToken);
      res.json({ user: publicUser, accessToken });
    } catch (e) {
      res.status(401).json({ message: e.message || 'Admin login failed' });
    }
  },

  requestPhoneOTP: async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      const result = await AuthService.requestPhoneOTP({ phoneNumber });
      res.json(result);
    } catch (e) {
      res.status(400).json({ message: e.message || 'Failed to request phone OTP' });
    }
  },

  verifyPhoneOTP: async (req, res) => {
    try {
      const { phoneNumber, otp, name } = req.body;
      const result = await AuthService.verifyPhoneOTP({ phoneNumber, otp, name });
      setRefreshCookie(res, result.refreshToken);
      res.json({ 
        user: result.user, 
        accessToken: result.accessToken,
        message: result.message
      });
    } catch (e) {
      res.status(401).json({ message: e.message || 'Phone verification failed' });
    }
  },

  me: async (_req, res) => {
    res.json({ user: res.req.user });
  },

  refresh: async (req, res) => {
    try {
      const refreshToken = req.cookies?.[config.cookies.name];
      if (!refreshToken || !req.userIdFromRefresh) {
        return res.status(401).json({ message: 'Missing refresh context' });
      }
      const { accessToken, refreshToken: newRT } =
        await AuthService.refresh(req.userIdFromRefresh, refreshToken);
      setRefreshCookie(res, newRT);
      res.json({ accessToken });
    } catch (e) {
      res.status(401).json({ message: e.message || 'Could not refresh token' });
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie(config.cookies.name, { path: config.cookies.path });
      const userId = (req.user && req.user.id) || req.userId || req.userIdFromRefresh;
      if (userId) await AuthService.logout(userId);
      res.json({ success: true });
    } catch {
      res.json({ success: true });
    }
  },

  // Google OAuth callback handler
  googleCallback: async (req, res) => {
    try {
      const user = req.user; // From Passport strategy
      console.log(`✅ [OAuth] Callback - User authenticated: ${user.email}`);

      if (!user) {
        return res.redirect(`${config.frontendUrl}/auth/login?error=no_user`);
      }

      // Issue application tokens
      const { accessToken, refreshToken } = await AuthService.issueFor(user);

      // Set refresh token cookie
      setRefreshCookie(res, refreshToken);

      // Redirect to frontend with token in URL
      const redirectUrl = `${config.frontendUrl}/auth/callback?token=${encodeURIComponent(accessToken)}&provider=google`;
      console.log(`🔄 [OAuth] Redirecting to: /auth/callback`);
      res.redirect(redirectUrl);
    } catch (err) {
      console.error('❌ [OAuth] Callback error:', err.message);
      res.redirect(`${config.frontendUrl}/auth/login?error=${encodeURIComponent(err.message)}`);
    }
  },

  // Google token verification endpoint (for frontend-initiated OAuth flow)
  googleVerify: async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: 'No token provided' });
      }

      console.log('🔐 [OAuth] Verifying Google token...');

      // Verify token and find/create user
      const user = await OAuthService.verifyGoogleToken(token);

      // Issue application tokens
      const { accessToken, refreshToken } = await AuthService.issueFor(user);

      // Set refresh token cookie
      setRefreshCookie(res, refreshToken);

      console.log(`✅ [OAuth] Token verified, user authenticated: ${user.email}`);
      res.json({ user: AuthService._publicUser(user), accessToken });
    } catch (err) {
      console.error('❌ [OAuth] Verification error:', err.message);
      res.status(401).json({ message: err.message || 'Token verification failed' });
    }
  }
};

