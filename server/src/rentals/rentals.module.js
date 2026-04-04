import { Router } from 'express';
import { requireAuth, requireRole } from '../auth/auth.middleware.js';
import { RentalsController } from './rentals.controller.js';

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const rentalsRouter = Router();

// TEST ROUTE
rentalsRouter.get('/test', (req, res) => {
  console.log('[ROUTE] /test handler called');
  res.json({ message: 'Test route works' });
});

// Another test route
rentalsRouter.get('/healthcheck', (req, res) => {
  console.log('[ROUTE] /healthcheck handler called');
  res.json({ message: 'Rentals API is healthy' });
});

// Admin only routes - MUST COME BEFORE GENERIC /:id ROUTES
rentalsRouter.post('/create-order', requireAuth, requireRole('admin'), asyncHandler(RentalsController.createOrder));

// Customer routes
rentalsRouter.post('/', requireAuth, asyncHandler(RentalsController.create));
rentalsRouter.get('/active', requireAuth, asyncHandler(RentalsController.getActiveRental));
rentalsRouter.get('/my-rentals', requireAuth, asyncHandler(RentalsController.getMyRentals));

// Shared authenticated list/detail
rentalsRouter.get('/', requireAuth, asyncHandler(RentalsController.list));

// Admin routes
rentalsRouter.patch('/:id/status', requireAuth, requireRole('admin'), asyncHandler(RentalsController.updateStatus));
rentalsRouter.post('/:id/generate-pdf', requireAuth, requireRole('admin'), asyncHandler(RentalsController.generatePDF));
rentalsRouter.get('/:id/download-pdf', requireAuth, requireRole('admin'), asyncHandler(RentalsController.downloadPDF));

// Generic detail route must be last among path routes using :id
rentalsRouter.get('/:id', requireAuth, asyncHandler(RentalsController.getOne));


