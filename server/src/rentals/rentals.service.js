import { prisma } from '../db/postgres.js';
import { PDFService } from './pdf.service.js';
import  NotificationsService  from '../notifications/notifications.service.js';
import { MongoRentalsService } from './rentals-mongo.service.js';

// Helper to serialize decimal fields
const serialize = (rental) => rental && ({
  ...rental,
  pricePerDay: rental.pricePerDay ? Number(rental.pricePerDay) : 0,
  totalPrice: rental.totalPrice ? Number(rental.totalPrice) : 0
});

export const RentalsService = {
  // Create a new rental
  async create(data) {
    const { userId, userEmail, userName, productId, startDate, endDate, notes = '' } = data;
    
    // Guard against prisma being null
    if (!prisma) {
      throw new Error('PostgreSQL not configured');
    }

    // Check if user already has an active rental
    const activeRental = await prisma.rental.findFirst({
      where: {
        userId,
        status: {
          in: ['PENDING', 'CONFIRMED', 'PICKED_UP']
        }
      }
    });
    
    if (activeRental) {
      throw new Error('You already have an active rental. Only one item can be rented at a time.');
    }
    
    // Check product availability
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    if (!product.isRentable) {
      throw new Error('This product is not available for rent');
    }
    
    if (product.availableStock < 1) {
      throw new Error('Product is currently out of stock');
    }
    
    // Calculate rental details
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (totalDays <= 0) {
      throw new Error('End date must be after start date');
    }
    
    const pricePerDay = Number(product.pricePerDay);
    const totalPrice = totalDays * pricePerDay;
    
    // Create rental in transaction
    const rental = await prisma.$transaction(async (tx) => {
      // Decrease available stock
      await tx.product.update({
        where: { id: productId },
        data: {
          availableStock: { decrement: 1 }
        }
      });
      
      // Create rental
      const newRental = await tx.rental.create({
        data: {
          userId,
          userEmail,
          userName,
          productId,
          startDate: start,
          endDate: end,
          totalDays,
          pricePerDay,
          totalPrice,
          notes,
          status: 'PENDING'
        },
        include: {
          product: true
        }
      });
      
      return newRental;
    });
    
    return serialize(rental);
  },
  
  // List rentals with filters
  async list({ page = 1, limit = 20, userId, status, search } = {}) {
    const where = {};
    
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { userEmail: { contains: search, mode: 'insensitive' } },
        { userName: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    if (!prisma) {
      throw new Error('PostgreSQL not configured');
    }

    const skip = (Math.max(1, +page) - 1) * Math.max(1, +limit);
    
    const [items, total] = await Promise.all([
      prisma.rental.findMany({
        where,
        include: {
          product: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Math.max(1, +limit)
      }),
      prisma.rental.count({ where })
    ]);
    
    return {
      items: items.map(serialize),
      total,
      page: +page,
      limit: +limit
    };
  },
  
  // Get rental by ID
  async getById(id) {
    try {
      const rental = await MongoRentalsService.getById(id);
      return rental;
    } catch (error) {
      console.error('[RentalsService] getById failed:', error.message);
      throw error;
    }
  },
  
  // Update rental status
  async updateStatus(id, status, adminUserId) {
    // Guard against prisma being null
    if (!prisma || !prisma.rental) {
      throw new Error('PostgreSQL/Prisma not configured');
    }

    const rental = await prisma.rental.findUnique({
      where: { id }
    });

    if (!rental) {
      throw new Error('Rental not found');
    }

    const updateData = { status };

    // Handle specific status transitions
    if (status === 'PICKED_UP') {
      updateData.pickupDate = new Date();
    } else if (status === 'RETURNED') {
      updateData.returnDate = new Date();

      // Return stock when item is returned
      await prisma.product.update({
        where: { id: rental.productId },
        data: {
          availableStock: { increment: 1 }
        }
      });
    } else if (status === 'CANCELLED') {
      // Return stock when rental is cancelled
      await prisma.product.update({
        where: { id: rental.productId },
        data: {
          availableStock: { increment: 1 }
        }
      });
    }

    const updatedRental = await prisma.rental.update({
      where: { id },
      data: updateData,
      include: {
        product: true
      }
    });

    return serialize(updatedRental);
  },
  
  // Get user's active rental
  async getUserActiveRental(userId) {
    if (!prisma) {
      throw new Error('PostgreSQL not configured');
    }

    const rental = await prisma.rental.findFirst({
      where: {
        userId,
        status: {
          in: ['PENDING', 'CONFIRMED', 'PICKED_UP']
        }
      },
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return serialize(rental);
  },
  
  // Get user's rental history
  async getUserRentals(userId, { page = 1, limit = 10 } = {}) {
    if (!prisma) {
      throw new Error('PostgreSQL not configured');
    }

    const skip = (Math.max(1, +page) - 1) * Math.max(1, +limit);
    
    const [items, total] = await Promise.all([
      prisma.rental.findMany({
        where: { userId },
        include: {
          product: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Math.max(1, +limit)
      }),
      prisma.rental.count({ where: { userId } })
    ]);
    
    return {
      items: items.map(serialize),
      total,
      page: +page,
      limit: +limit
    };
  },
  
  // Check overdue rentals
  async checkOverdueRentals() {
    if (!prisma) {
      throw new Error('PostgreSQL not configured');
    }

    const now = new Date();
    const overdueRentals = await prisma.rental.updateMany({
      where: {
        status: 'PICKED_UP',
        endDate: { lt: now }
      },
      data: {
        status: 'OVERDUE'
      }
    });
    
    return overdueRentals;
  },

  // Create formal rental order
  async createFormalOrder(orderData, adminUserId) {
    const { rentalId, ...formData } = orderData;
    console.log('[createFormalOrder] Starting with rentalId:', rentalId);
    console.log('[createFormalOrder] adminUserId:', adminUserId);
    console.log('[createFormalOrder] formData:', formData);

    try {
      console.log('[createFormalOrder] Step 1: Getting rental from MongoDB');
      // Try MongoDB first
      const rental = await MongoRentalsService.getById(rentalId);
      console.log('[createFormalOrder] Step 2: Rental found:', rental ? rental._id : 'NULL');

      if (!rental) {
        console.error('[createFormalOrder] Rental not found:', rentalId);
        throw new Error(`Rental not found (ID: ${rentalId})`);
      }

      console.log('[createFormalOrder] Step 3: Updating status to CONFIRMED');
      // Update rental with formal order data - Use MongoDB
      let updatedRental = await MongoRentalsService.updateStatus(rentalId, 'CONFIRMED');
      console.log('[createFormalOrder] Step 4: Status updated, result:', updatedRental ? updatedRental._id : 'NULL');

      if (!updatedRental) {
        throw new Error('Failed to update rental status');
      }

      console.log('[createFormalOrder] Step 5: Order created successfully');
      return serialize(updatedRental);
    } catch (error) {
      console.error('[createFormalOrder] Exception:', error.message);
      console.error('[createFormalOrder] Stack:', error.stack);
      throw error;
    }
  },

  // ** FIXED: Generate PDF invoice and return the buffer **
  async generatePDFInvoice(rentalId, orderData = {}) {
    console.log('[RentalsService] Generating PDF invoice for rental:', rentalId);

    try {
      // Use MongoDB directly
      const rental = await MongoRentalsService.getById(rentalId);

      if (!rental) {
        console.error('[RentalsService] Rental not found for PDF:', rentalId);
        throw new Error(`Rental not found (ID: ${rentalId})`);
      }

      console.log('[RentalsService] Found rental for PDF:', rental._id);

      try {
        // Generate PDF - returns pdfBuffer
        console.log('[RentalsService] Calling PDFService.generateRentalInvoice...');
        const pdfBuffer = await PDFService.generateRentalInvoice(rental, orderData);

        console.log('[RentalsService] PDF generated successfully, buffer size:', pdfBuffer.length);

        const filename = `rental_invoice_${rental._id || rental.id}.pdf`;

        // You can still save the file if you want a record of it
        await PDFService.savePDFToFile(pdfBuffer, filename);
        console.log(`📄 PDF generated and saved: ${filename}`);

        // ** CRUCIAL: Return the buffer and filename to the controller **
        return { pdfBuffer, filename };

      } catch (pdfError) {
        console.error('[RentalsService] PDF generation error:', pdfError.message);
        console.error('[RentalsService] PDF error stack:', pdfError.stack);
        throw new Error(`Failed to generate PDF: ${pdfError.message}`);
      }
    } catch (error) {
      console.error('[RentalsService] generatePDFInvoice failed:', error.message);
      throw error;
    }
  },

  // ** FIXED: Generate simple rental receipt PDF and return the buffer **
  async generateRentalReceipt(rentalId) {
    console.log('[RentalsService] Generating rental receipt for:', rentalId);

    try {
      // Use MongoDB directly
      const rental = await MongoRentalsService.getById(rentalId);

      if (!rental) {
        console.error('[RentalsService] Rental not found for receipt:', rentalId);
        throw new Error(`Rental not found (ID: ${rentalId})`);
      }

      console.log('[RentalsService] Found rental for receipt:', rental._id);

      try {
        // Generate PDF receipt
        console.log('[RentalsService] Calling PDFService.generateRentalReceipt...');
        const pdfBuffer = await PDFService.generateRentalReceipt(rental);

        console.log('[RentalsService] Receipt PDF generated successfully, buffer size:', pdfBuffer.length);

        const filename = `rental_receipt_${rental._id || rental.id}.pdf`;

        // You can still save the file if you want a record of it
        await PDFService.savePDFToFile(pdfBuffer, filename);
        console.log(`📄 Receipt PDF generated and saved: ${filename}`);

        // ** CRUCIAL: Return the buffer and filename to the controller **
        return { pdfBuffer, filename };

      } catch (pdfError) {
        console.error('[RentalsService] Receipt PDF generation error:', pdfError.message);
        console.error('[RentalsService] Receipt PDF error stack:', pdfError.stack);
        throw new Error(`Failed to generate receipt PDF: ${pdfError.message}`);
      }
    } catch (error) {
      console.error('[RentalsService] generateRentalReceipt failed:', error.message);
      throw error;
    }
  }
};
