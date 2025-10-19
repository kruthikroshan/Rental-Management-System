import express from 'express';
import { body } from 'express-validator';
import { QuotationController } from '../controllers/quotationController.mongo';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const quotationController = new QuotationController();

// Validation middleware
const quotationValidation = [
  body('customerId')
    .isInt({ min: 1 })
    .withMessage('Valid customer ID is required'),
  body('validFrom')
    .isISO8601()
    .withMessage('Valid from date is required'),
  body('validUntil')
    .isISO8601()
    .withMessage('Valid until date is required')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.validFrom)) {
        throw new Error('Valid until date must be after valid from date');
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
  body('items.*.rentalDays')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Rental days must be a positive integer'),
  body('items.*.unitPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number')
];

const updateQuotationValidation = [
  body('validFrom')
    .optional()
    .isISO8601()
    .withMessage('Valid from date must be a valid date'),
  body('validUntil')
    .optional()
    .isISO8601()
    .withMessage('Valid until date must be a valid date'),
  body('discountPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount percentage must be between 0 and 100'),
  body('taxPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax percentage must be between 0 and 100')
];

const sendQuotationValidation = [
  body('emailSubject')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Email subject must be between 1 and 200 characters'),
  body('emailMessage')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Email message must be between 1 and 1000 characters')
];

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/quotations - Get all quotations with pagination and filtering
router.get('/', quotationController.getQuotations.bind(quotationController));

// GET /api/quotations/stats - Get quotation statistics (TODO: Implement in controller)
// router.get('/stats', quotationController.getQuotationStats.bind(quotationController));

// GET /api/quotations/:id - Get single quotation by ID
router.get('/:id', quotationController.getQuotation.bind(quotationController));

// POST /api/quotations - Create new quotation
router.post(
  '/',
  quotationValidation,
  quotationController.createQuotation.bind(quotationController)
);

// PUT /api/quotations/:id - Update quotation
router.put(
  '/:id',
  updateQuotationValidation,
  quotationController.updateQuotation.bind(quotationController)
);

// POST /api/quotations/:id/send - Send quotation to customer (TODO: Implement in controller)
// router.post(
//   '/:id/send',
//   sendQuotationValidation,
//   quotationController.sendQuotation.bind(quotationController)
// );

// POST /api/quotations/:id/accept - Accept quotation (TODO: Implement in controller)
// router.post('/:id/accept', quotationController.acceptQuotation.bind(quotationController));

// POST /api/quotations/:id/reject - Reject quotation (TODO: Implement in controller)
// router.post('/:id/reject', quotationController.rejectQuotation.bind(quotationController));

export default router;
