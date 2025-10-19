import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { BookingOrder, BookingStatus } from '../entities/BookingOrder';
import { BookingOrderItem } from '../entities/BookingOrderItem';
import { Product } from '../entities/Product';
import { User } from '../entities/User';
import { Quotation } from '../entities/Quotation';
import { validationResult } from 'express-validator';

export class BookingController {
  private bookingRepository: Repository<BookingOrder>;
  private bookingItemRepository: Repository<BookingOrderItem>;
  private productRepository: Repository<Product>;
  private userRepository: Repository<User>;
  private quotationRepository: Repository<Quotation>;

  constructor() {
    this.bookingRepository = AppDataSource.getRepository(BookingOrder);
    this.bookingItemRepository = AppDataSource.getRepository(BookingOrderItem);
    this.productRepository = AppDataSource.getRepository(Product);
    this.userRepository = AppDataSource.getRepository(User);
    this.quotationRepository = AppDataSource.getRepository(Quotation);
  }

  // Get all bookings with pagination and filtering
  async getBookings(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        customerId,
        startDate,
        endDate,
        search,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const queryBuilder = this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.customer', 'customer')
        .leftJoinAndSelect('booking.items', 'items')
        .leftJoinAndSelect('items.product', 'product')
        .leftJoinAndSelect('booking.quotation', 'quotation');

      // Apply filters
      if (status) {
        queryBuilder.andWhere('booking.status = :status', { status });
      }

      if (customerId) {
        queryBuilder.andWhere('booking.customerId = :customerId', { customerId });
      }

      if (startDate) {
        queryBuilder.andWhere('booking.rentalStartDate >= :startDate', { startDate });
      }

      if (endDate) {
        queryBuilder.andWhere('booking.rentalEndDate <= :endDate', { endDate });
      }

      if (search) {
        queryBuilder.andWhere(
          '(booking.orderNumber ILIKE :search OR customer.name ILIKE :search OR customer.email ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Apply sorting
      const validSortFields = ['createdAt', 'rentalStartDate', 'rentalEndDate', 'totalAmount', 'orderNumber'];
      const sortField = validSortFields.includes(sortBy as string) ? sortBy as string : 'createdAt';
      const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';
      queryBuilder.orderBy(`booking.${sortField}`, order);

      // Apply pagination
      const skip = (Number(page) - 1) * Number(limit);
      queryBuilder.skip(skip).take(Number(limit));

      const [bookings, total] = await queryBuilder.getManyAndCount();

      res.json({
        success: true,
        data: {
          bookings,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalItems: total,
            itemsPerPage: Number(limit)
          }
        }
      });
    } catch (error: any) {
      console.error('Get bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bookings',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get single booking by ID
  async getBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const booking = await this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.customer', 'customer')
        .leftJoinAndSelect('booking.items', 'items')
        .leftJoinAndSelect('items.product', 'product')
        .leftJoinAndSelect('booking.quotation', 'quotation')
        .leftJoinAndSelect('booking.invoices', 'invoices')
        .leftJoinAndSelect('booking.deliveryRecords', 'deliveryRecords')
        .where('booking.id = :id', { id })
        .getOne();

      if (!booking) {
        res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
        return;
      }

      res.json({
        success: true,
        data: { booking }
      });
    } catch (error: any) {
      console.error('Get booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch booking',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Create new booking
  async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
        return;
      }

      const {
        customerId,
        quotationId,
        rentalStartDate,
        rentalEndDate,
        items,
        notes,
        deliveryAddress,
        pickupAddress
      } = req.body;

      // Start transaction
      await AppDataSource.transaction(async (manager) => {
        // Verify customer exists
        const customer = await manager.findOne(User, { where: { id: customerId } });
        if (!customer) {
          throw new Error('Customer not found');
        }

        // If quotation is provided, verify it exists
        let quotation: Quotation | null = null;
        if (quotationId) {
          quotation = await manager.findOne(Quotation, { where: { id: quotationId } });
          if (!quotation) {
            throw new Error('Quotation not found');
          }
        }

        // Generate order number
        const orderNumber = await this.generateOrderNumber();

        // Create booking
        const booking = manager.create(BookingOrder, {
          customerId,
          quotationId: quotationId || undefined,
          orderNumber,
          pickupDate: new Date(rentalStartDate),
          returnDate: new Date(rentalEndDate),
          status: BookingStatus.CONFIRMED,
          customerNotes: notes,
          pickupLocation: deliveryAddress ? { address: deliveryAddress } : { address: pickupAddress },
          returnLocation: { address: pickupAddress || deliveryAddress },
          subtotal: 0,
          taxAmount: 0,
          totalAmount: 0
        });

        await manager.save(booking);

        // Create booking items and calculate totals
        let subtotal = 0;
        const bookingItems: BookingOrderItem[] = [];

        for (const item of items) {
          const product = await manager.findOne(Product, { where: { id: item.productId } });
          if (!product) {
            throw new Error(`Product with ID ${item.productId} not found`);
          }

          // Check product availability
          const availableQty = await this.checkProductAvailability(
            item.productId,
            rentalStartDate,
            rentalEndDate,
            manager
          );

          if (availableQty < item.quantity) {
            throw new Error(`Insufficient quantity for product ${product.name}. Available: ${availableQty}, Requested: ${item.quantity}`);
          }

          // Calculate rental duration and cost
          const startDate = new Date(rentalStartDate);
          const endDate = new Date(rentalEndDate);
          const durationInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          
          const unitPrice = item.unitPrice || product.baseRentalRate;
          const itemTotal = unitPrice * item.quantity * durationInDays;

          const bookingItem = manager.create(BookingOrderItem, {
            bookingOrderId: booking.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice,
            totalPrice: itemTotal,
            notes: item.notes
          });

          await manager.save(bookingItem);
          bookingItems.push(bookingItem);
          subtotal += itemTotal;
        }

        // Calculate tax (assuming 10% tax rate, make this configurable)
        const taxRate = 0.10;
        const taxAmount = subtotal * taxRate;
        const totalAmount = subtotal + taxAmount;

        // Update booking with totals
        booking.subtotal = subtotal;
        booking.taxAmount = taxAmount;
        booking.totalAmount = totalAmount;
        await manager.save(booking);

        // Fetch the complete booking with relations
        const completeBooking = await manager
          .createQueryBuilder(BookingOrder, 'booking')
          .leftJoinAndSelect('booking.customer', 'customer')
          .leftJoinAndSelect('booking.items', 'items')
          .leftJoinAndSelect('items.product', 'product')
          .leftJoinAndSelect('booking.quotation', 'quotation')
          .where('booking.id = :id', { id: booking.id })
          .getOne();

        res.status(201).json({
          success: true,
          message: 'Booking created successfully',
          data: { booking: completeBooking }
        });
      });

    } catch (error: any) {
      console.error('Create booking error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create booking',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Update booking status
  async updateBookingStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!Object.values(BookingStatus).includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid booking status'
        });
        return;
      }

      const booking = await this.bookingRepository.findOne({ where: { id: Number(id) } });
      if (!booking) {
        res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
        return;
      }

      booking.status = status;
      if (notes) {
        booking.internalNotes = notes;
      }

      await this.bookingRepository.save(booking);

      // Fetch updated booking with relations
      const updatedBooking = await this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.customer', 'customer')
        .leftJoinAndSelect('booking.items', 'items')
        .leftJoinAndSelect('items.product', 'product')
        .where('booking.id = :id', { id })
        .getOne();

      res.json({
        success: true,
        message: 'Booking status updated successfully',
        data: { booking: updatedBooking }
      });
    } catch (error: any) {
      console.error('Update booking status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update booking status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Cancel booking
  async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const booking = await this.bookingRepository.findOne({ where: { id: Number(id) } });
      if (!booking) {
        res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
        return;
      }

      if (booking.status === BookingStatus.CANCELLED) {
        res.status(400).json({
          success: false,
          message: 'Booking is already cancelled'
        });
        return;
      }

      booking.status = BookingStatus.CANCELLED;
      booking.cancellationReason = reason;
      await this.bookingRepository.save(booking);

      res.json({
        success: true,
        message: 'Booking cancelled successfully',
        data: { booking }
      });
    } catch (error: any) {
      console.error('Cancel booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel booking',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get booking statistics
  async getBookingStats(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const queryBuilder = this.bookingRepository.createQueryBuilder('booking');

      if (startDate) {
        queryBuilder.andWhere('booking.createdAt >= :startDate', { startDate });
      }

      if (endDate) {
        queryBuilder.andWhere('booking.createdAt <= :endDate', { endDate });
      }

      // Get total bookings by status
      const statusStats = await queryBuilder
        .select('booking.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(booking.totalAmount)', 'totalRevenue')
        .groupBy('booking.status')
        .getRawMany();

      // Get total revenue
      const totalRevenue = await queryBuilder
        .select('SUM(booking.totalAmount)', 'total')
        .getRawOne();

      // Get monthly booking trends
      const monthlyTrends = await queryBuilder
        .select('DATE_TRUNC(\'month\', booking.createdAt)', 'month')
        .addSelect('COUNT(*)', 'bookings')
        .addSelect('SUM(booking.totalAmount)', 'revenue')
        .groupBy('DATE_TRUNC(\'month\', booking.createdAt)')
        .orderBy('DATE_TRUNC(\'month\', booking.createdAt)', 'DESC')
        .limit(12)
        .getRawMany();

      res.json({
        success: true,
        data: {
          statusStats,
          totalRevenue: totalRevenue?.total || 0,
          monthlyTrends
        }
      });
    } catch (error: any) {
      console.error('Get booking stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch booking statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Helper method to generate order number
  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    const prefix = `RO${year}${month}`;
    
    // Get the last order number for this month
    const lastOrder = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.orderNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('booking.orderNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastOrder && lastOrder.orderNumber) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }

  // Helper method to check product availability
  private async checkProductAvailability(
    productId: number,
    startDate: string,
    endDate: string,
    manager: any
  ): Promise<number> {
    const product = await manager.findOne(Product, { where: { id: productId } });
    if (!product) return 0;

    // Get booked quantity for the date range
    const bookedQuantity = await manager
      .createQueryBuilder()
      .select('COALESCE(SUM(boi.quantity), 0)', 'bookedQuantity')
      .from('booking_order_items', 'boi')
      .innerJoin('booking_orders', 'bo', 'bo.id = boi.bookingOrderId')
      .where('boi.productId = :productId', { productId })
      .andWhere('bo.status IN (:...statuses)', { statuses: ['confirmed', 'delivered', 'partial_return'] })
      .andWhere('bo.rentalStartDate <= :endDate', { endDate })
      .andWhere('bo.rentalEndDate >= :startDate', { startDate })
      .getRawOne();

    return product.totalQuantity - (bookedQuantity?.bookedQuantity || 0);
  }
}
