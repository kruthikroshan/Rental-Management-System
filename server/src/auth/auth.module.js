import { Router } from 'express';
import passport from 'passport';
import { AuthController } from './auth.controller.js';
import { requireAuth, requireRole, optionalRefreshContext } from './auth.middleware.js';
import { config } from '../config/configuration.js';

export const authRouter = Router();

const getOAuthCallbackURL = (req) => {
  const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const forwardedHost = req.get('x-forwarded-host')?.split(',')[0]?.trim();
  const protocol = forwardedProto || req.protocol || 'http';
  const host = forwardedHost || req.get('host');
  return `${protocol}://${host}/auth/google/callback`;
};

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
authRouter.get('/google', (req, res, next) => {
  const callbackURL = getOAuthCallbackURL(req);
  return passport.authenticate('google', {
    scope: ['email', 'profile'],
    callbackURL
  })(req, res, next);
});

authRouter.get('/google/callback',
  (req, res, next) => {
    const callbackURL = getOAuthCallbackURL(req);
    return passport.authenticate('google', {
      failureRedirect: `${config.frontendUrl}/auth/login?error=oauth_failed`,
      session: false,
      callbackURL
    })(req, res, next);
  },
  AuthController.googleCallback
);
authRouter.post('/google/verify', AuthController.googleVerify);

