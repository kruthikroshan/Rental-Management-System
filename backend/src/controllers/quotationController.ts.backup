import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Quotation } from '../entities/Quotation';
import { QuotationItem } from '../entities/QuotationItem';
import { Product } from '../entities/Product';
import { User } from '../entities/User';
import { validationResult } from 'express-validator';

export enum QuotationStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CONVERTED = 'converted'
}

export class QuotationController {
  private quotationRepository: Repository<Quotation>;
  private quotationItemRepository: Repository<QuotationItem>;
  private productRepository: Repository<Product>;
  private userRepository: Repository<User>;

  constructor() {
    this.quotationRepository = AppDataSource.getRepository(Quotation);
    this.quotationItemRepository = AppDataSource.getRepository(QuotationItem);
    this.productRepository = AppDataSource.getRepository(Product);
    this.userRepository = AppDataSource.getRepository(User);
  }

  // Get all quotations with pagination and filtering
  async getQuotations(req: Request, res: Response): Promise<void> {
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

      const queryBuilder = this.quotationRepository
        .createQueryBuilder('quotation')
        .leftJoinAndSelect('quotation.customer', 'customer')
        .leftJoinAndSelect('quotation.items', 'items')
        .leftJoinAndSelect('items.product', 'product');

      // Apply filters
      if (status) {
        queryBuilder.andWhere('quotation.status = :status', { status });
      }

      if (customerId) {
        queryBuilder.andWhere('quotation.customerId = :customerId', { customerId });
      }

      if (startDate) {
        queryBuilder.andWhere('quotation.pickupDate >= :startDate', { startDate });
      }

      if (endDate) {
        queryBuilder.andWhere('quotation.expiryDate <= :endDate', { endDate });
      }

      if (search) {
        queryBuilder.andWhere(
          '(quotation.quotationNumber ILIKE :search OR customer.name ILIKE :search OR customer.email ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Apply sorting
      const validSortFields = ['createdAt', 'expiryDate', 'totalAmount', 'quotationNumber'];
      const sortField = validSortFields.includes(sortBy as string) ? sortBy as string : 'createdAt';
      const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';
      queryBuilder.orderBy(`quotation.${sortField}`, order);

      // Apply pagination
      const skip = (Number(page) - 1) * Number(limit);
      queryBuilder.skip(skip).take(Number(limit));

      const [quotations, total] = await queryBuilder.getManyAndCount();

      res.json({
        success: true,
        data: {
          quotations,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalItems: total,
            itemsPerPage: Number(limit)
          }
        }
      });
    } catch (error: any) {
      console.error('Get quotations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quotations',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get single quotation by ID
  async getQuotation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const quotation = await this.quotationRepository
        .createQueryBuilder('quotation')
        .leftJoinAndSelect('quotation.customer', 'customer')
        .leftJoinAndSelect('quotation.items', 'items')
        .leftJoinAndSelect('items.product', 'product')
        .leftJoinAndSelect('quotation.bookingOrders', 'bookingOrders')
        .where('quotation.id = :id', { id })
        .getOne();

      if (!quotation) {
        res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
        return;
      }

      res.json({
        success: true,
        data: { quotation }
      });
    } catch (error: any) {
      console.error('Get quotation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quotation',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Create new quotation
  async createQuotation(req: Request, res: Response): Promise<void> {
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
        validFrom,
        validUntil,
        items,
        notes,
        termsConditions,
        discountPercentage = 0,
        taxPercentage = 10
      } = req.body;

      // Start transaction
      await AppDataSource.transaction(async (manager) => {
        // Verify customer exists
        const customer = await manager.findOne(User, { where: { id: customerId } });
        if (!customer) {
          throw new Error('Customer not found');
        }

        // Generate quotation number
        const quotationNumber = await this.generateQuotationNumber();

        // Create quotation
        const quotation = manager.create(Quotation, {
          customerId,
          quotationNumber,
          pickupDate: new Date(validFrom),
          returnDate: new Date(validUntil),
          expiryDate: new Date(validUntil),
          status: QuotationStatus.DRAFT,
          notes,
          pickupLocation: { address: '' },
          returnLocation: { address: '' },
          subtotal: 0,
          discountAmount: 0,
          taxAmount: 0,
          totalAmount: 0
        });

        await manager.save(quotation);

        // Create quotation items and calculate totals
        let subtotal = 0;

        for (const item of items) {
          const product = await manager.findOne(Product, { where: { id: item.productId } });
          if (!product) {
            throw new Error(`Product with ID ${item.productId} not found`);
          }

          const unitPrice = item.unitPrice || product.baseRentalRate;
          const quantity = item.quantity;
          const rentalDays = item.rentalDays || 1;
          const itemTotal = unitPrice * quantity * rentalDays;

          const quotationItem = manager.create(QuotationItem, {
            quotationId: quotation.id,
            productId: item.productId,
            quantity,
            rentalDays,
            unitPrice,
            totalPrice: itemTotal,
            description: item.description || product.description
          });

          await manager.save(quotationItem);
          subtotal += itemTotal;
        }

        // Calculate discount and tax
        const discountAmount = subtotal * (discountPercentage / 100);
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = taxableAmount * (taxPercentage / 100);
        const totalAmount = taxableAmount + taxAmount;

        // Update quotation with totals
        quotation.subtotal = subtotal;
        quotation.discountAmount = discountAmount;
        quotation.taxAmount = taxAmount;
        quotation.totalAmount = totalAmount;
        await manager.save(quotation);

        // Fetch the complete quotation with relations
        const completeQuotation = await manager
          .createQueryBuilder(Quotation, 'quotation')
          .leftJoinAndSelect('quotation.customer', 'customer')
          .leftJoinAndSelect('quotation.items', 'items')
          .leftJoinAndSelect('items.product', 'product')
          .where('quotation.id = :id', { id: quotation.id })
          .getOne();

        res.status(201).json({
          success: true,
          message: 'Quotation created successfully',
          data: { quotation: completeQuotation }
        });
      });

    } catch (error: any) {
      console.error('Create quotation error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create quotation',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Update quotation
  async updateQuotation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
        return;
      }

      const quotation = await this.quotationRepository.findOne({ where: { id: Number(id) } });
      if (!quotation) {
        res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
        return;
      }

      // Check if quotation can be updated
      if (quotation.status === QuotationStatus.CONVERTED || quotation.status === QuotationStatus.EXPIRED) {
        res.status(400).json({
          success: false,
          message: 'Cannot update converted or expired quotation'
        });
        return;
      }

      // Update quotation
      await this.quotationRepository.update(id, updateData);

      // Fetch updated quotation with relations
      const updatedQuotation = await this.quotationRepository
        .createQueryBuilder('quotation')
        .leftJoinAndSelect('quotation.customer', 'customer')
        .leftJoinAndSelect('quotation.items', 'items')
        .leftJoinAndSelect('items.product', 'product')
        .where('quotation.id = :id', { id })
        .getOne();

      res.json({
        success: true,
        message: 'Quotation updated successfully',
        data: { quotation: updatedQuotation }
      });
    } catch (error: any) {
      console.error('Update quotation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update quotation',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Send quotation to customer
  async sendQuotation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { emailSubject, emailMessage } = req.body;

      const quotation = await this.quotationRepository.findOne({
        where: { id: Number(id) },
        relations: ['customer']
      });

      if (!quotation) {
        res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
        return;
      }

      // Update status to sent
      quotation.status = QuotationStatus.SENT;
      await this.quotationRepository.save(quotation);

      // TODO: Implement email sending logic here
      // This would typically involve integrating with an email service like SendGrid, Mailgun, etc.

      res.json({
        success: true,
        message: 'Quotation sent successfully',
        data: { quotation }
      });
    } catch (error: any) {
      console.error('Send quotation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send quotation',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Accept quotation
  async acceptQuotation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const quotation = await this.quotationRepository.findOne({ where: { id: Number(id) } });
      if (!quotation) {
        res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
        return;
      }

      // Check if quotation is still valid
      const now = new Date();
      if (quotation.expiryDate && quotation.expiryDate < now) {
        quotation.status = QuotationStatus.EXPIRED;
        await this.quotationRepository.save(quotation);
        
        res.status(400).json({
          success: false,
          message: 'Quotation has expired'
        });
        return;
      }

      quotation.status = QuotationStatus.ACCEPTED;
      await this.quotationRepository.save(quotation);

      res.json({
        success: true,
        message: 'Quotation accepted successfully',
        data: { quotation }
      });
    } catch (error: any) {
      console.error('Accept quotation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to accept quotation',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Reject quotation
  async rejectQuotation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;

      const quotation = await this.quotationRepository.findOne({ where: { id: Number(id) } });
      if (!quotation) {
        res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
        return;
      }

      quotation.status = QuotationStatus.REJECTED;
      if (rejectionReason) {
        quotation.notes = `${quotation.notes || ''}\nRejection reason: ${rejectionReason}`;
      }
      await this.quotationRepository.save(quotation);

      res.json({
        success: true,
        message: 'Quotation rejected successfully',
        data: { quotation }
      });
    } catch (error: any) {
      console.error('Reject quotation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reject quotation',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get quotation statistics
  async getQuotationStats(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const queryBuilder = this.quotationRepository.createQueryBuilder('quotation');

      if (startDate) {
        queryBuilder.andWhere('quotation.createdAt >= :startDate', { startDate });
      }

      if (endDate) {
        queryBuilder.andWhere('quotation.createdAt <= :endDate', { endDate });
      }

      // Get quotations by status
      const statusStats = await queryBuilder
        .select('quotation.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(quotation.totalAmount)', 'totalValue')
        .groupBy('quotation.status')
        .getRawMany();

      // Get conversion rate
      const totalQuotations = await queryBuilder.getCount();
      const convertedQuotations = await queryBuilder
        .andWhere('quotation.status = :status', { status: QuotationStatus.CONVERTED })
        .getCount();

      const conversionRate = totalQuotations > 0 ? (convertedQuotations / totalQuotations) * 100 : 0;

      // Get monthly trends
      const monthlyTrends = await this.quotationRepository
        .createQueryBuilder('quotation')
        .select('DATE_TRUNC(\'month\', quotation.createdAt)', 'month')
        .addSelect('COUNT(*)', 'quotations')
        .addSelect('SUM(quotation.totalAmount)', 'totalValue')
        .groupBy('DATE_TRUNC(\'month\', quotation.createdAt)')
        .orderBy('DATE_TRUNC(\'month\', quotation.createdAt)', 'DESC')
        .limit(12)
        .getRawMany();

      res.json({
        success: true,
        data: {
          statusStats,
          conversionRate: Math.round(conversionRate * 100) / 100,
          monthlyTrends,
          totalQuotations
        }
      });
    } catch (error: any) {
      console.error('Get quotation stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quotation statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Helper method to generate quotation number
  private async generateQuotationNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    const prefix = `QT${year}${month}`;
    
    // Get the last quotation number for this month
    const lastQuotation = await this.quotationRepository
      .createQueryBuilder('quotation')
      .where('quotation.quotationNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('quotation.quotationNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastQuotation && lastQuotation.quotationNumber) {
      const lastSequence = parseInt(lastQuotation.quotationNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }
}
