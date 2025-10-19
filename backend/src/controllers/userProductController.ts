import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Product, ApprovalStatus } from '../entities/Product';
import { User } from '../entities/User';
import { Category } from '../entities/Category';
import { validationResult } from 'express-validator';

export class UserProductController {
  private productRepository: Repository<Product>;
  private userRepository: Repository<User>;
  private categoryRepository: Repository<Category>;

  constructor() {
    this.productRepository = AppDataSource.getRepository(Product);
    this.userRepository = AppDataSource.getRepository(User);
    this.categoryRepository = AppDataSource.getRepository(Category);
  }

  // Get user's own products
  async getUserProducts(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 0;
      const { page = 1, limit = 10, search, categoryId, status } = req.query;

      const queryBuilder = this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .where('product.ownerId = :userId', { userId });

      if (search) {
        queryBuilder.andWhere(
          '(product.name ILIKE :search OR product.description ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      if (categoryId) {
        queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId: parseInt(categoryId as string) });
      }

      if (status) {
        queryBuilder.andWhere('product.isActive = :isActive', { isActive: status === 'active' });
      }

      // Calculate offset and apply pagination
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      queryBuilder.skip(offset).take(parseInt(limit as string));
      queryBuilder.orderBy('product.createdAt', 'DESC');

      const [products, total] = await queryBuilder.getManyAndCount();

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            totalPages: Math.ceil(total / parseInt(limit as string))
          }
        }
      });
    } catch (error: any) {
      console.error('Get user products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user products',
        error: error.message
      });
    }
  }

  // Add new rental product
  async addUserProduct(req: Request, res: Response): Promise<void> {
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
        name,
        description,
        shortDescription,
        categoryId,
        baseRentalRate,
        securityDeposit,
        totalQuantity,
        rentalUnits,
        minRentalDuration,
        maxRentalDuration,
        tags,
        images,
        specifications,
        condition
      } = req.body;

      // Verify category exists
      const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
      if (!category) {
        res.status(400).json({
          success: false,
          message: 'Category not found'
        });
        return;
      }

      // Generate unique SKU
      const sku = await this.generateSKU(name);

      // Generate slug
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const product = this.productRepository.create({
        name,
        slug,
        description,
        shortDescription,
        sku,
        categoryId,
        ownerId: userId, // Set the current user as owner
        baseRentalRate,
        securityDeposit,
        totalQuantity,
        availableQuantity: totalQuantity,
        reservedQuantity: 0,
        maintenanceQuantity: 0,
        rentalUnits,
        minRentalDuration,
        maxRentalDuration,
        tags: tags || [],
        images: images || [],
        specifications: specifications || {},
        condition,
        isRentable: true,
        isActive: false, // Require admin approval for new user products
        approvalStatus: ApprovalStatus.PENDING
      });

      const savedProduct = await this.productRepository.save(product);

      // Fetch the complete product with relations
      const completeProduct = await this.productRepository.findOne({
        where: { id: savedProduct.id },
        relations: ['category', 'owner']
      });

      res.status(201).json({
        success: true,
        message: 'Product added successfully. Pending admin approval.',
        data: { product: completeProduct }
      });
    } catch (error: any) {
      console.error('Add user product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add product',
        error: error.message
      });
    }
  }

  // Update user's product
  async updateUserProduct(req: Request, res: Response): Promise<void> {
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
      const { id } = req.params;
      const updateData = req.body;

      // Find product and verify ownership
      const product = await this.productRepository.findOne({
        where: { id: parseInt(id), ownerId: userId }
      });

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found or not owned by user'
        });
        return;
      }

      // Update fields
      Object.assign(product, {
        ...updateData,
        updatedAt: new Date(),
        // Reset approval if significant changes are made
        approvalStatus: this.requiresReApproval(updateData) ? 'pending' : product.approvalStatus,
        isActive: this.requiresReApproval(updateData) ? false : product.isActive
      });

      const savedProduct = await this.productRepository.save(product);

      // Fetch the complete product with relations
      const completeProduct = await this.productRepository.findOne({
        where: { id: savedProduct.id },
        relations: ['category', 'owner']
      });

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: { product: completeProduct }
      });
    } catch (error: any) {
      console.error('Update user product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: error.message
      });
    }
  }

  // Delete user's product
  async deleteUserProduct(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 0;
      const { id } = req.params;

      // Find product and verify ownership
      const product = await this.productRepository.findOne({
        where: { id: parseInt(id), ownerId: userId }
      });

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found or not owned by user'
        });
        return;
      }

      // Check if product has active bookings
      const hasActiveBookings = await this.checkActiveBookings(parseInt(id));
      if (hasActiveBookings) {
        res.status(400).json({
          success: false,
          message: 'Cannot delete product with active bookings'
        });
        return;
      }

      // Soft delete by marking as inactive
      product.isActive = false;
      product.deletedAt = new Date();
      await this.productRepository.save(product);

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete user product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: error.message
      });
    }
  }

  // Get user's product analytics
  async getUserProductAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 0;
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      // Get total products
      const totalProducts = await this.productRepository
        .createQueryBuilder('product')
        .where('product.ownerId = :userId', { userId })
        .getCount();

      // Get active products
      const activeProducts = await this.productRepository
        .createQueryBuilder('product')
        .where('product.ownerId = :userId', { userId })
        .andWhere('product.isActive = true')
        .getCount();

      // Get revenue from bookings
      const revenueQuery = await AppDataSource.query(`
        SELECT 
          COALESCE(SUM(p.amount), 0) as total_revenue,
          COUNT(DISTINCT b.id) as total_bookings,
          COALESCE(AVG(p.amount), 0) as average_booking_value
        FROM payments p
        JOIN booking_orders b ON p.booking_order_id = b.id
        JOIN booking_order_items bi ON bi.booking_order_id = b.id
        JOIN products pr ON bi.product_id = pr.id
        WHERE pr.owner_id = $1 
          AND p.status = 'completed'
          AND p.created_at BETWEEN $2 AND $3
      `, [userId, start, end]);

      // Get top performing products
      const topProducts = await AppDataSource.query(`
        SELECT 
          pr.id,
          pr.name,
          COUNT(bi.id) as booking_count,
          COALESCE(SUM(p.amount), 0) as revenue
        FROM products pr
        LEFT JOIN booking_order_items bi ON bi.product_id = pr.id
        LEFT JOIN booking_orders b ON bi.booking_order_id = b.id
        LEFT JOIN payments p ON p.booking_order_id = b.id AND p.status = 'completed'
        WHERE pr.owner_id = $1
          AND (p.created_at IS NULL OR p.created_at BETWEEN $2 AND $3)
        GROUP BY pr.id, pr.name
        ORDER BY revenue DESC, booking_count DESC
        LIMIT 5
      `, [userId, start, end]);

      const analytics = {
        totalProducts,
        activeProducts,
        pendingApproval: totalProducts - activeProducts,
        totalRevenue: parseFloat(revenueQuery[0]?.total_revenue || 0),
        totalBookings: parseInt(revenueQuery[0]?.total_bookings || 0),
        averageBookingValue: parseFloat(revenueQuery[0]?.average_booking_value || 0),
        topProducts: topProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          bookingCount: parseInt(p.booking_count || 0),
          revenue: parseFloat(p.revenue || 0)
        }))
      };

      res.json({
        success: true,
        data: { analytics }
      });
    } catch (error: any) {
      console.error('Get user product analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics',
        error: error.message
      });
    }
  }

  // Helper methods
  private async generateSKU(name: string): Promise<string> {
    const prefix = name.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  private requiresReApproval(updateData: any): boolean {
    const significantFields = ['name', 'description', 'baseRentalRate', 'securityDeposit', 'categoryId'];
    return significantFields.some(field => updateData.hasOwnProperty(field));
  }

  private async checkActiveBookings(productId: number): Promise<boolean> {
    const activeBookings = await AppDataSource.query(`
      SELECT COUNT(*) as count
      FROM booking_order_items bi
      JOIN booking_orders b ON bi.booking_order_id = b.id
      WHERE bi.product_id = $1 
        AND b.status IN ('confirmed', 'active', 'picked_up')
    `, [productId]);

    return parseInt(activeBookings[0]?.count || 0) > 0;
  }
}
