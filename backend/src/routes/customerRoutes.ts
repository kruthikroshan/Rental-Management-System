import express from 'express';
import { body } from 'express-validator';
import { CustomerController } from '../controllers/customerController.mongo';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const customerController = new CustomerController();

// Validation middleware
const customerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Valid phone number is required'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters')
];

const updateCustomerValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Valid phone number is required'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters')
];

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/customers - Get all customers with pagination and filtering
router.get('/', customerController.getCustomers.bind(customerController));

// GET /api/customers/stats - Get customer statistics (TODO: Implement in controller)
// router.get('/stats', customerController.getCustomerStats.bind(customerController));

// GET /api/customers/:id - Get single customer by ID
router.get('/:id', customerController.getCustomer.bind(customerController));

// POST /api/customers - Create new customer
router.post(
  '/',
  customerValidation,
  customerController.createCustomer.bind(customerController)
);

// PUT /api/customers/:id - Update customer
router.put(
  '/:id',
  updateCustomerValidation,
  customerController.updateCustomer.bind(customerController)
);

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', customerController.deleteCustomer.bind(customerController));

export default router;
