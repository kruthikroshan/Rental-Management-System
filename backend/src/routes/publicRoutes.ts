import express from 'express';
import { ProductController } from '../controllers/productController.mongo';
import { BookingController } from '../controllers/bookingController.mongo';
import { CustomerController } from '../controllers/customerController.mongo';
import { QuotationController } from '../controllers/quotationController.mongo';
// import { DataSeederController } from '../controllers/dataSeederController';

const router = express.Router();

// Initialize controllers
const productController = new ProductController();
const bookingController = new BookingController();
const customerController = new CustomerController();
const quotationController = new QuotationController();
// const dataSeederController = new DataSeederController();

// Public Product Routes (No authentication required)
router.get('/products', productController.getProducts.bind(productController));
router.get('/products/:id', productController.getProduct.bind(productController));

// Public Booking Routes (No authentication required for viewing)
router.get('/bookings', bookingController.getBookings.bind(bookingController));
router.get('/bookings/:id', bookingController.getBooking.bind(bookingController));

// Public Customer Routes (No authentication required for viewing)
router.get('/customers', customerController.getCustomers.bind(customerController));
router.get('/customers/:id', customerController.getCustomer.bind(customerController));

// Public Quotation Routes (No authentication required for viewing)
router.get('/quotations', quotationController.getQuotations.bind(quotationController));
router.get('/quotations/:id', quotationController.getQuotation.bind(quotationController));

// Database Seeder Routes (For development/testing) - TODO: Implement MongoDB seeder
// router.post('/seed', dataSeederController.seedDatabase.bind(dataSeederController));
// router.delete('/seed', dataSeederController.clearDatabase.bind(dataSeederController));
// router.get('/seed/stats', dataSeederController.getDatabaseStats.bind(dataSeederController));

// Health check for public routes
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Public API routes are working',
    timestamp: new Date().toISOString()
  });
});

export default router;
