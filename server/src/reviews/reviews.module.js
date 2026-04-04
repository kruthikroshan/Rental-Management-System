import { Router } from 'express';
import { ReviewController } from './reviews.controller.js';
import { requireAuth, requireRole } from '../auth/auth.middleware.js';

export const reviewsRouter = Router();

// Public routes
reviewsRouter.get('/product/:productId', ReviewController.getProductReviews);

// Customer routes
reviewsRouter.post('/add', requireAuth, requireRole('customer', 'admin'), ReviewController.addReview);

// Admin routes
reviewsRouter.get('/all', requireAuth, requireRole('admin'), ReviewController.getAllReviews);
reviewsRouter.delete('/delete/:reviewId', requireAuth, requireRole('admin'), ReviewController.deleteReview);
