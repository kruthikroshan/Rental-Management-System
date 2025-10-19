import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { BookingOrder, BookingStatus } from '../entities/BookingOrder';
import { BookingOrderItem } from '../entities/BookingOrderItem';
import { Product, ApprovalStatus } from '../entities/Product';
import { User } from '../entities/User';
import { Payment, PaymentType, PaymentStatus } from '../entities/Payment';
import { validationResult } from 'express-validator';

export class MarketplaceController {
  private bookingRepository: Repository<BookingOrder>;
  private productRepository: Repository<Product>;
  private userRepository: Repository<User>;
  private paymentRepository: Repository<Payment>;

  constructor() {
    this.bookingRepository = AppDataSource.getRepository(BookingOrder);
    this.productRepository = AppDataSource.getRepository(Product);
    this.userRepository = AppDataSource.getRepository(User);
    this.paymentRepository = AppDataSource.getRepository(Payment);
  }

  // Browse available products from other users
  async browseMarketplace(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 0;
      const {
        page = 1,
        limit = 12,
        search,
        categoryId,
        location,
        priceMin,
        priceMax,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        startDate,
        endDate
      } = req.query;

      const queryBuilder = this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndSelect('product.owner', 'owner')
        .where('product.isActive = true')
        .andWhere('product.isRentable = true')
        .andWhere('product.approvalStatus = :status', { status: 'approved' })
        .andWhere('product.availableQuantity > 0')
        .andWhere('(product.ownerId != :userId OR product.ownerId IS NULL)', { userId }); // Exclude own products

      // Search filter
      if (search) {
        queryBuilder.andWhere(
          '(product.name ILIKE :search OR product.description ILIKE :search OR product.tags && :searchArray)',
          { 
            search: `%${search}%`,
            searchArray: [(search as string).toLowerCase()]
          }
        );
      }

      // Category filter
      if (categoryId) {
        queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId: parseInt(categoryId as string) });
      }

      // Price range filter
      if (priceMin) {
        queryBuilder.andWhere('product.baseRentalRate >= :priceMin', { priceMin: parseFloat(priceMin as string) });
      }
      if (priceMax) {
        queryBuilder.andWhere('product.baseRentalRate <= :priceMax', { priceMax: parseFloat(priceMax as string) });
      }

      // Location filter (if provided)
      if (location) {
        queryBuilder.andWhere(
          "product.location->>'city' ILIKE :location OR product.location->>'state' ILIKE :location",
          { location: `%${location}%` }
        );
      }

      // Availability filter (if dates provided)
      if (startDate && endDate) {
        // Check for conflicting bookings
        queryBuilder.andWhere(`
          product.id NOT IN (
            SELECT DISTINCT bi.product_id 
            FROM booking_order_items bi
            JOIN booking_orders b ON bi.booking_order_id = b.id
            WHERE b.status IN ('confirmed', 'active', 'picked_up')
            AND (
              (b.pickup_date <= :endDate AND b.return_date >= :startDate)
            )
          )
        `, { startDate, endDate });
      }

      // Sorting
      const validSortFields = ['createdAt', 'baseRentalRate', 'name', 'utilizationRate'];
      const sortField = validSortFields.includes(sortBy as string) ? sortBy as string : 'createdAt';
      const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';
      queryBuilder.orderBy(`product.${sortField}`, order);

      // Pagination
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      queryBuilder.skip(offset).take(parseInt(limit as string));

      const [products, total] = await queryBuilder.getManyAndCount();

      // Calculate average ratings (mock for now)
      const productsWithRatings = products.map(product => ({
        ...product,
        averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Random rating between 3-5
        totalReviews: Math.floor(Math.random() * 50) + 1,
        owner: {
          id: product.owner?.id,
          name: product.owner?.name,
          joinedAt: product.owner?.createdAt
        }
      }));

      res.json({
        success: true,
        data: {
          products: productsWithRatings,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            totalPages: Math.ceil(total / parseInt(limit as string))
          }
        }
      });
    } catch (error: any) {
      console.error('Browse marketplace error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch marketplace products',
        error: error.message
      });
    }
  }

  // Get product details with availability
  async getProductDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const product = await this.productRepository.findOne({
        where: { 
          id: parseInt(id),
          isActive: true,
          isRentable: true,
          approvalStatus: ApprovalStatus.APPROVED
        },
        relations: ['category', 'owner']
      });

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
      }

      // Check availability for specific dates
      let availableQuantity = product.availableQuantity;
      if (startDate && endDate) {
        const conflictingBookings = await AppDataSource.query(`
          SELECT COALESCE(SUM(bi.quantity), 0) as booked_quantity
          FROM booking_order_items bi
          JOIN booking_orders b ON bi.booking_order_id = b.id
          WHERE bi.product_id = $1
            AND b.status IN ('confirmed', 'active', 'picked_up')
            AND (b.pickup_date <= $3 AND b.return_date >= $2)
        `, [parseInt(id), startDate, endDate]);

        const bookedQuantity = parseInt(conflictingBookings[0]?.booked_quantity || 0);
        availableQuantity = Math.max(0, product.totalQuantity - bookedQuantity);
      }

      // Get similar products
      const similarProducts = await this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.owner', 'owner')
        .where('product.categoryId = :categoryId', { categoryId: product.categoryId })
        .andWhere('product.id != :currentId', { currentId: parseInt(id) })
        .andWhere('product.isActive = true')
        .andWhere('product.isRentable = true')
        .andWhere('product.approvalStatus = :status', { status: 'approved' })
        .limit(4)
        .getMany();

      const productDetails = {
        ...product,
        availableQuantity,
        averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        totalReviews: Math.floor(Math.random() * 50) + 1,
        similarProducts: similarProducts.map(p => ({
          id: p.id,
          name: p.name,
          baseRentalRate: p.baseRentalRate,
          images: p.images,
          owner: { name: p.owner?.name }
        })),
        owner: {
          id: product.owner?.id,
          name: product.owner?.name,
          joinedAt: product.owner?.createdAt,
          totalProducts: 0, // Will be populated separately
          averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10
        }
      };

      res.json({
        success: true,
        data: { product: productDetails }
      });
    } catch (error: any) {
      console.error('Get product details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product details',
        error: error.message
      });
    }
  }

  // Create booking for marketplace product
  async createMarketplaceBooking(req: Request, res: Response): Promise<void> {
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

      const userId = req.user?.id || 0;
      const {
        productId,
        quantity,
        startDate,
        endDate,
        deliveryAddress,
        specialRequests,
        paymentMethod = 'card'
      } = req.body;

      await AppDataSource.transaction(async (manager) => {
        // Verify product
        const product = await manager.findOne(Product, {
          where: { 
            id: productId,
            isActive: true,
            isRentable: true,
            approvalStatus: ApprovalStatus.APPROVED
          },
          relations: ['owner']
        });

        if (!product) {
          throw new Error('Product not found or not available');
        }

        // Check if user is trying to book their own product
        if (product.ownerId === userId) {
          throw new Error('Cannot book your own product');
        }

        // Check availability
        const availableQty = await this.checkProductAvailability(
          productId,
          startDate,
          endDate,
          manager
        );

        if (availableQty < quantity) {
          throw new Error(`Insufficient quantity available. Available: ${availableQty}, Requested: ${quantity}`);
        }

        // Calculate pricing
        const start = new Date(startDate);
        const end = new Date(endDate);
        const durationInDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        
        const unitPrice = product.baseRentalRate;
        const subtotal = unitPrice * quantity * durationInDays;
        const platformFee = subtotal * 0.05; // 5% platform fee
        const taxAmount = (subtotal + platformFee) * 0.1; // 10% tax
        const securityDeposit = product.securityDeposit * quantity;
        const totalAmount = subtotal + platformFee + taxAmount + securityDeposit;

        // Generate order number
        const orderNumber = await this.generateOrderNumber();

        // Create booking
        const booking = manager.create(BookingOrder, {
          customerId: userId,
          orderNumber,
          pickupDate: start,
          returnDate: end,
          status: BookingStatus.CONFIRMED,
          customerNotes: specialRequests,
          pickupLocation: deliveryAddress ? { address: deliveryAddress } : undefined,
          returnLocation: deliveryAddress ? { address: deliveryAddress } : undefined,
          subtotal,
          platformFee,
          taxAmount,
          securityDeposit,
          totalAmount,
          isMarketplaceOrder: true,
          vendorId: product.ownerId
        });

        const savedBooking = await manager.save(booking);

        // Create booking item
        const bookingItem = manager.create(BookingOrderItem, {
          bookingOrderId: savedBooking.id,
          productId,
          quantity,
          unitPrice,
          totalPrice: subtotal,
          notes: specialRequests
        });

        await manager.save(bookingItem);

        // Create payment record
        const payment = manager.create(Payment, {
          bookingOrderId: savedBooking.id,
          paidById: userId,
          amount: totalAmount,
          type: PaymentType.RENTAL_FEE,
          method: paymentMethod,
          status: PaymentStatus.PENDING,
          currency: 'USD',
          description: `Marketplace rental payment for ${product.name}`
        });

        await manager.save(payment);

        // Fetch complete booking
        const completeBooking = await manager
          .createQueryBuilder(BookingOrder, 'booking')
          .leftJoinAndSelect('booking.customer', 'customer')
          .leftJoinAndSelect('booking.vendor', 'vendor')
          .leftJoinAndSelect('booking.items', 'items')
          .leftJoinAndSelect('items.product', 'product')
          .where('booking.id = :id', { id: savedBooking.id })
          .getOne();

        res.status(201).json({
          success: true,
          message: 'Marketplace booking created successfully. Complete payment to confirm.',
          data: { 
            booking: completeBooking,
            paymentUrl: `/payment/${payment.id}` // URL for payment completion
          }
        });
      });
    } catch (error: any) {
      console.error('Create marketplace booking error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create marketplace booking'
      });
    }
  }

  // Get user's marketplace transactions (as renter)
  async getRenterTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 0;
      const { page = 1, limit = 10, status } = req.query;

      const queryBuilder = this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.vendor', 'vendor')
        .leftJoinAndSelect('booking.items', 'items')
        .leftJoinAndSelect('items.product', 'product')
        .where('booking.customerId = :userId', { userId })
        .andWhere('booking.isMarketplaceOrder = true');

      if (status) {
        queryBuilder.andWhere('booking.status = :status', { status });
      }

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      queryBuilder
        .skip(offset)
        .take(parseInt(limit as string))
        .orderBy('booking.createdAt', 'DESC');

      const [bookings, total] = await queryBuilder.getManyAndCount();

      res.json({
        success: true,
        data: {
          bookings,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            totalPages: Math.ceil(total / parseInt(limit as string))
          }
        }
      });
    } catch (error: any) {
      console.error('Get renter transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch renter transactions',
        error: error.message
      });
    }
  }

  // Get user's marketplace transactions (as vendor)
  async getVendorTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 0;
      const { page = 1, limit = 10, status } = req.query;

      const queryBuilder = this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.customer', 'customer')
        .leftJoinAndSelect('booking.items', 'items')
        .leftJoinAndSelect('items.product', 'product')
        .where('booking.vendorId = :userId', { userId })
        .andWhere('booking.isMarketplaceOrder = true');

      if (status) {
        queryBuilder.andWhere('booking.status = :status', { status });
      }

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      queryBuilder
        .skip(offset)
        .take(parseInt(limit as string))
        .orderBy('booking.createdAt', 'DESC');

      const [bookings, total] = await queryBuilder.getManyAndCount();

      res.json({
        success: true,
        data: {
          bookings,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            totalPages: Math.ceil(total / parseInt(limit as string))
          }
        }
      });
    } catch (error: any) {
      console.error('Get vendor transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vendor transactions',
        error: error.message
      });
    }
  }

  // Helper methods
  private async generateOrderNumber(): Promise<string> {
    const count = await this.bookingRepository.count();
    const orderNum = (count + 1).toString().padStart(6, '0');
    return `MKP-${new Date().getFullYear()}-${orderNum}`;
  }

  private async checkProductAvailability(
    productId: number,
    startDate: string,
    endDate: string,
    manager: any
  ): Promise<number> {
    const product = await manager.findOne(Product, { where: { id: productId } });
    if (!product) return 0;

    const conflictingBookings = await manager.query(`
      SELECT COALESCE(SUM(bi.quantity), 0) as booked_quantity
      FROM booking_order_items bi
      JOIN booking_orders b ON bi.booking_order_id = b.id
      WHERE bi.product_id = $1
        AND b.status IN ('confirmed', 'active', 'picked_up')
        AND (b.pickup_date <= $3 AND b.return_date >= $2)
    `, [productId, startDate, endDate]);

    const bookedQuantity = parseInt(conflictingBookings[0]?.booked_quantity || 0);
    return Math.max(0, product.totalQuantity - bookedQuantity);
  }
}
