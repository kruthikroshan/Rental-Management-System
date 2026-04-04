import fs from 'fs';
import os from 'os';
import path from 'path';
import { RentalsService } from './rentals.service.js';
import { MongoRentalsService } from './rentals-mongo.service.js';

const tmpDir = os.tmpdir();

const trace = (msg) => {
  try {
    fs.appendFileSync(path.join(tmpDir, 'server_trace.log'), `[updateStatus] ${msg}\n`);
  } catch (e) {}
};

export const RentalsController = {
  // Create a new rental (customer)
  create: async (req, res) => {
    console.log('🚀 [Rentals Controller] CREATE endpoint called');
    console.log('📋 [Rentals Controller] req.user:', req.user);
    console.log('📋 [Rentals Controller] req.body:', req.body);

    try {
      // Check authentication first
      if (!req.user) {
        console.error('❌ [Rentals Controller] No user in request - NOT AUTHENTICATED');
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { productId, startDate, endDate, notes, productName, pricePerDay, totalDays, totalPrice } = req.body;
      const user = req.user;

      console.log('📝 [Rentals Controller] Creating rental:');
      console.log('   User:', { id: user.id, email: user.email, name: user.name });
      console.log('   Product:', { productId, productName, pricePerDay });
      console.log('   Dates:', { startDate, endDate });
      console.log('   Pricing:', { totalDays, totalPrice });

      // Validate required fields
      if (!productId || !startDate || !endDate) {
        console.error('❌ [Rentals Controller] Validation FAILED - Missing required fields');
        console.error('   productId:', productId, 'startDate:', startDate, 'endDate:', endDate);
        return res.status(400).json({
          message: 'productId, startDate, and endDate are required'
        });
      }

      // Create rental in MongoDB
      console.log('💾 [Rentals Controller] Saving to MongoDB...');
      const rental = await MongoRentalsService.create({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        productId,
        productName: productName || 'Product',
        startDate,
        endDate,
        notes: notes || '',
        pricePerDay: pricePerDay || 0,
        totalDays: totalDays || 1,
        totalPrice: totalPrice || 0
      });

      if (!rental) {
        console.error('❌ [Rentals Controller] MongoDB returned null rental');
        return res.status(500).json({ message: 'Failed to create rental in database' });
      }

      console.log('✅ [Rentals Controller] Rental created successfully:', rental._id);
      console.log('📤 [Rentals Controller] Sending response with rental object');

      // Return the rental object
      res.status(201).json({ rental });
    } catch (error) {
      console.error('❌ [Rentals Controller] EXCEPTION during rental creation:');
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
      console.error('   Full Error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      res.status(500).json({
        message: error.message || 'Failed to create rental',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // List all rentals (admin) or user's rentals (customer)
  list: async (req, res) => {
    console.log('🚀 [Rentals Controller] LIST endpoint called');

    try {
      // Check authentication
      if (!req.user) {
        console.error('❌ [Rentals Controller] No user in request');
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const user = req.user;
      const { page, limit, status } = req.query;

      console.log('👤 [Rentals Controller] User role:', user.role);

      let options = { page, limit, status };

      // If not admin, only show user's own rentals
      if (user.role !== 'admin') {
        options.userId = user.id;
        console.log('📋 [Rentals Controller] Filtering by userId (customer):', user.id);
      } else {
        console.log('📋 [Rentals Controller] Showing all rentals (admin)');
      }

      // Use MongoDB directly (PostgreSQL not configured)
      const result = await MongoRentalsService.list({
        page: options.page,
        limit: options.limit,
        status: options.status,
        userId: options.userId
      });

      console.log('✅ [Rentals Controller] Found rentals:', result.total);
      res.json(result);
    } catch (error) {
      console.error('❌ [Rentals Controller] LIST failed:', error.message);
      console.error('❌ [Rentals Controller] Full error:', error);
      res.status(500).json({ message: 'Failed to fetch rentals', error: error.message });
    }
  },
  
  // Get specific rental
  getOne: async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      
      const rental = await RentalsService.getById(id);
      
      if (!rental) {
        return res.status(404).json({ message: 'Rental not found' });
      }
      
      // Check permissions - users can only see their own rentals
      if (user.role !== 'admin' && rental.userId.toString() !== user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json({ rental });
    } catch (error) {
      console.error(`❌ Get rental failed:`, error.message);
      res.status(500).json({ message: 'Failed to fetch rental' });
    }
  },
  
  // Update rental status (admin only)
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['PENDING', 'CONFIRMED', 'PICKED_UP', 'RETURNED', 'CANCELLED', 'OVERDUE'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const rental = await MongoRentalsService.updateStatus(id, status);
      if (!rental) {
        return res.status(404).json({ message: 'Rental not found' });
      }

      // Ensure rental is plain object, not Mongoose document
      const rentalObj = rental.toObject ? rental.toObject() : JSON.parse(JSON.stringify(rental));
      res.status(200).json({ rental: rentalObj });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get user's active rental
  getActiveRental: async (req, res) => {
    try {
      const user = req.user;
      let rental;

      try {
        rental = await RentalsService.getUserActiveRental(user.id);
      } catch (postgresError) {
        console.warn('⚠️  PostgreSQL failed, using MongoDB:', postgresError.message);
        // Fall back to MongoDB
        rental = await MongoRentalsService.getUserActiveRental(user.id);
      }

      res.json({ rental: rental || null });
    } catch (error) {
      console.error(`❌ Get active rental failed:`, error.message);
      res.json({ rental: null });
    }
  },
  
  // Get user's rental history
  getMyRentals: async (req, res) => {
    try {
      const user = req.user;
      const { page, limit } = req.query;

      console.log('📖 [getMyRentals] Called');
      console.log('   User:', user.id, user.name);
      console.log('   Page:', page, 'Limit:', limit);

      let result;
      try {
        console.log('🔄 [getMyRentals] Trying PostgreSQL...');
        // Try PostgreSQL first
        result = await RentalsService.getUserRentals(user.id, { page, limit });
        console.log('✅ [getMyRentals] PostgreSQL succeeded');
      } catch (postgresError) {
        console.warn('⚠️ [getMyRentals] PostgreSQL failed:', postgresError.message);
        // Fall back to MongoDB
        console.log('🔄 [getMyRentals] Trying MongoDB...');
        result = await MongoRentalsService.getUserRentals(user.id, { page, limit });
        console.log('✅ [getMyRentals] MongoDB succeeded');
      }

      console.log('📊 [getMyRentals] Returning result:', result.total, 'items');
      res.json(result);
    } catch (error) {
      console.error(`❌ Get user rentals failed:`, error.message);
      console.error('   Stack:', error.stack);
      res.status(500).json({ message: 'Failed to fetch rental history' });
    }
  },

  // Create formal rental order (admin)
  createOrder: async (req, res) => {
    process.stderr.write(`\n[createOrder] HANDLER CALLED\n`);
    const logFile = path.join(tmpDir, 'createorder.log');
    try { fs.appendFileSync(logFile, `\n[${new Date().toISOString()}] START\n`); } catch(e) {}

    try {
      const orderData = req.body;
      const user = req.user;

      try { fs.appendFileSync(logFile, `Request body: ${JSON.stringify(orderData)}\nRental ID: ${orderData.rentalId}\nAdmin user: ${user.id}\nCalling RentalsService.createFormalOrder...\n`); } catch(e) {}

      const result = await RentalsService.createFormalOrder(orderData, user.id);

      try { fs.appendFileSync(logFile, `Success! Result: ${JSON.stringify(result).substring(0, 100)}\n`); } catch(e) {}
      res.json({ success: true, order: result });
    } catch (error) {
      try { fs.appendFileSync(logFile, `ERROR: ${error.message}\nStack: ${error.stack}\n`); } catch(e) {}
      console.error('[createOrder] Failed:', error.message);
      res.status(400).json({ message: error.message });
    }
  },

  // Generate PDF and send the file to the browser
  generatePDF: async (req, res) => {
    const rentalId = req.params.id;
    const pdfLog = path.join(tmpDir, 'generatePDF.log');
    try { fs.appendFileSync(pdfLog, `\n[${new Date().toISOString()}] START - rentalId: ${rentalId}\n`); } catch(e) {}

    try {
      if (!rentalId) {
        try { fs.appendFileSync(pdfLog, `ERROR: No rental ID\n`); } catch(e) {}
        return res.status(400).json({ message: 'Rental ID is required' });
      }

      const orderData = req.body || {};
      try { fs.appendFileSync(pdfLog, `Calling RentalsService.generatePDFInvoice...\n`); } catch(e) {}

      // Call service to generate PDF
      const result = await RentalsService.generatePDFInvoice(rentalId, orderData);

      try { fs.appendFileSync(pdfLog, `Result received: ${result ? 'YES' : 'NULL'}, pdfBuffer: ${result?.pdfBuffer ? 'YES' : 'NO'}\n`); } catch(e) {}

      if (!result || !result.pdfBuffer) {
        try { fs.appendFileSync(pdfLog, `ERROR: Invalid result from service\n`); } catch(e) {}
        return res.status(500).json({ message: 'Failed to generate PDF' });
      }

      const { pdfBuffer, filename } = result;
      try { fs.appendFileSync(pdfLog, `Generated PDF: ${pdfBuffer.length} bytes, filename: ${filename}\n`); } catch(e) {}

      // Send PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.end(pdfBuffer);

    } catch (error) {
      try { fs.appendFileSync(pdfLog, `EXCEPTION: ${error.message}\n${error.stack}\n`); } catch(e) {}
      res.status(500).json({ message: error.message || 'Failed to generate PDF' });
    }
  },

  // Download PDF receipt
  downloadPDF: async (req, res) => {
    const rentalId = req.params.id;
    console.log(`[downloadPDF] Starting for rental: ${rentalId}`);

    try {
      if (!rentalId) {
        return res.status(400).json({ message: 'Rental ID is required' });
      }

      // Call service to generate receipt
      const result = await RentalsService.generateRentalReceipt(rentalId);

      if (!result || !result.pdfBuffer) {
        console.error('[downloadPDF] Invalid result from service');
        return res.status(500).json({ message: 'Failed to download PDF' });
      }

      const { pdfBuffer, filename } = result;
      console.log(`[downloadPDF] Generated, sending ${pdfBuffer.length} bytes`);

      // Send PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.end(pdfBuffer);

    } catch (error) {
      console.error('[downloadPDF] Error:', error.message);
      res.status(500).json({ message: error.message || 'Failed to download PDF' });
    }
  }
};
