import express from 'express';
import { body } from 'express-validator';
import { BookingController } from '../controllers/bookingController.mongo';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const bookingController = new BookingController();

// Validation middleware
const bookingValidation = [
  body('customerId')
    .isInt({ min: 1 })
    .withMessage('Valid customer ID is required'),
  body('rentalStartDate')
    .isISO8601()
    .withMessage('Valid rental start date is required'),
  body('rentalEndDate')
    .isISO8601()
    .withMessage('Valid rental end date is required')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.rentalStartDate)) {
        throw new Error('Rental end date must be after start date');
      }
      return true;
    }),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.productId')
    .isInt({ min: 1 })
    .withMessage('Valid product ID is required for each item'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Valid quantity is required for each item'),
  body('items.*.unitPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number')
];

const statusUpdateValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'ready_pickup', 'delivered', 'active', 'partial_return', 'returned', 'completed', 'cancelled', 'overdue'])
    .withMessage('Valid status is required')
];

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/bookings - Get all bookings with pagination and filtering
router.get('/', bookingController.getBookings.bind(bookingController));

// GET /api/bookings/stats - Get booking statistics (TODO: Implement in controller)
// router.get('/stats', bookingController.getBookingStats.bind(bookingController));

// GET /api/bookings/:id - Get single booking by ID
router.get('/:id', bookingController.getBooking.bind(bookingController));

// POST /api/bookings - Create new booking
router.post(
  '/',
  bookingValidation,
  bookingController.createBooking.bind(bookingController)
);

// PUT /api/bookings/:id/status - Update booking status
router.put(
  '/:id/status',
  statusUpdateValidation,
  bookingController.updateBookingStatus.bind(bookingController)
);

// POST /api/bookings/:id/cancel - Cancel booking (TODO: Implement in controller)
// router.post('/:id/cancel', bookingController.cancelBooking.bind(bookingController));

export default router;
