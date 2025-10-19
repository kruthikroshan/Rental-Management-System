import express from 'express';
import { body } from 'express-validator';
import { ProductController } from '../controllers/productController.mongo';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const productController = new ProductController();

// Validation middleware
const productValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('categoryId')
    .isInt({ min: 1 })
    .withMessage('Valid category ID is required'),
  body('sku')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('SKU must be between 3 and 100 characters'),
  body('baseRentalRate')
    .isFloat({ min: 0 })
    .withMessage('Base rental rate must be a positive number'),
  body('totalQuantity')
    .isInt({ min: 0 })
    .withMessage('Total quantity must be a non-negative integer'),
  body('isRentable')
    .optional()
    .isBoolean()
    .withMessage('isRentable must be a boolean'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid category ID is required'),
  body('baseRentalRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base rental rate must be a positive number'),
  body('totalQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total quantity must be a non-negative integer'),
  body('isRentable')
    .optional()
    .isBoolean()
    .withMessage('isRentable must be a boolean'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/products - Get all products with pagination and filtering
router.get('/', productController.getProducts.bind(productController));

// GET /api/products/:id - Get single product by ID
router.get('/:id', productController.getProduct.bind(productController));

export default router;
