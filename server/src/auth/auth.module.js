import { Router } from 'express';
import passport from 'passport';
import { AuthController } from './auth.controller.js';
import { requireAuth, requireRole, optionalRefreshContext } from './auth.middleware.js';

export const authRouter = Router();

authRouter.post('/register', AuthController.register);
authRouter.post('/login', AuthController.login);
authRouter.post('/login-admin', AuthController.loginAdmin); // NEW

// OTP routes
authRouter.post('/verify-email', AuthController.verifyEmail);
authRouter.post('/resend-otp', AuthController.resendOTP);
authRouter.post('/request-password-reset', AuthController.requestPasswordReset);
authRouter.post('/reset-password', AuthController.resetPassword);

// Phone Auth routes
authRouter.post('/request-phone-otp', AuthController.requestPhoneOTP);
authRouter.post('/verify-phone-otp', AuthController.verifyPhoneOTP);

authRouter.get('/me', requireAuth, requireRole('admin', 'customer'), AuthController.me);

authRouter.post('/refresh', optionalRefreshContext, AuthController.refresh);

authRouter.post('/logout', optionalRefreshContext, requireAuth, AuthController.logout);

// Google OAuth routes
authRouter.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
authRouter.get('/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/auth/login?error=oauth_failed', session: false }),
  AuthController.googleCallback
);
authRouter.post('/google/verify', AuthController.googleVerify);

