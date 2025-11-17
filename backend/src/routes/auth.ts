import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  googleLogin,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  deleteAccount
} from '../controllers/authController';
import {
  authenticate,
  validateRefreshToken,
  authRateLimit
} from '../middleware/auth';
import { authRateLimiter, passwordResetLimiter } from '../middleware/security';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('phone')
    .optional()
    .matches(/^[\d\s\+\-\(\)]+$/)
    .withMessage('Please provide a valid phone number')
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters'),
  body('role')
    .optional()
    .isIn(['customer', 'admin', 'manager'])
    .withMessage('Role must be customer, admin, or manager')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('New password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('phone')
    .optional()
    .matches(/^[\d\s\+\-\(\)]+$/)
    .withMessage('Please provide a valid phone number')
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Street address must not exceed 200 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City must not exceed 50 characters'),
  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State must not exceed 50 characters'),
  body('address.zipCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Zip code must not exceed 20 characters'),
  body('address.country')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Country must not exceed 50 characters')
];

const deleteAccountValidation = [
  body('password')
    .notEmpty()
    .withMessage('Password is required for account deletion')
];

// Public routes
router.post('/register', authRateLimit, registerValidation, register);
router.post('/login', authRateLimit, loginValidation, login);
router.post('/google-login', authRateLimit, googleLogin);
router.post('/refresh-token', validateRefreshToken, refreshToken);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidation, updateProfile);
router.put('/change-password', authenticate, changePasswordValidation, changePassword);
router.post('/logout', authenticate, logout);
router.delete('/account', authenticate, deleteAccountValidation, deleteAccount);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth service is healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;
