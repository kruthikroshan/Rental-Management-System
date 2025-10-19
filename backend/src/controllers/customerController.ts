import { Request, Response } from 'express';
import { Repository, DataSource, Like } from 'typeorm';
import { validationResult } from 'express-validator';
import { User, UserRole } from '../entities/User';

export class CustomerController {
  private userRepository: Repository<User>;

  constructor(dataSource: DataSource) {
    this.userRepository = dataSource.getRepository(User);
  }

  // Get all customers with optional search and pagination
  async getCustomers(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        isActive,
        sortBy = 'name',
        sortOrder = 'ASC'
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {
        role: UserRole.CUSTOMER
      };

      if (search) {
        where.name = Like(`%${search}%`);
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const [customers, total] = await this.userRepository.findAndCount({
        where,
        take: Number(limit),
        skip,
        order: {
          [String(sortBy)]: sortOrder === 'DESC' ? 'DESC' : 'ASC'
        },
        relations: ['profile', 'bookings', 'quotations']
      });

      res.json({
        success: true,
        data: customers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Get customers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customers'
      });
    }
  }

  // Get customer by ID
  async getCustomerById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const customer = await this.userRepository.findOne({
        where: { 
          id: parseInt(id),
          role: UserRole.CUSTOMER
        },
        relations: ['profile', 'bookings', 'quotations', 'payments']
      });

      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
        return;
      }

      res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      console.error('Get customer error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customer'
      });
    }
  }

  // Create new customer
  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const {
        name,
        email,
        phone,
        password,
        isActive
      } = req.body;

      // Check if email already exists
      const existingCustomer = await this.userRepository.findOne({
        where: { email }
      });

      if (existingCustomer) {
        res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
        return;
      }

      const customer = this.userRepository.create({
        name,
        email,
        phone,
        password,
        role: UserRole.CUSTOMER,
        isActive: isActive !== false
      });

      await this.userRepository.save(customer);

      // Remove password from response
      const { passwordHash, ...customerResponse } = customer;

      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: customerResponse
      });
    } catch (error) {
      console.error('Create customer error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create customer'
      });
    }
  }

  // Update customer
  async updateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { id } = req.params;
      const {
        name,
        email,
        phone,
        isActive
      } = req.body;

      const customer = await this.userRepository.findOne({
        where: { 
          id: parseInt(id),
          role: UserRole.CUSTOMER
        }
      });

      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
        return;
      }

      // Check if email already exists (excluding current customer)
      if (email && email !== customer.email) {
        const existingCustomer = await this.userRepository.findOne({
          where: { email }
        });

        if (existingCustomer) {
          res.status(400).json({
            success: false,
            message: 'Email already exists'
          });
          return;
        }
      }

      // Update customer
      await this.userRepository.update(parseInt(id), {
        name: name || customer.name,
        email: email || customer.email,
        phone: phone !== undefined ? phone : customer.phone,
        isActive: isActive !== undefined ? isActive : customer.isActive
      });

      const updatedCustomer = await this.userRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['profile', 'bookings']
      });

      res.json({
        success: true,
        message: 'Customer updated successfully',
        data: updatedCustomer
      });
    } catch (error) {
      console.error('Update customer error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update customer'
      });
    }
  }

  // Delete customer
  async deleteCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const customer = await this.userRepository.findOne({
        where: { 
          id: parseInt(id),
          role: UserRole.CUSTOMER
        },
        relations: ['bookings', 'quotations']
      });

      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
        return;
      }

      // Check if customer has active bookings
      const activeBookings = customer.bookings?.filter(booking => 
        booking.status === 'confirmed' || booking.status === 'active'
      );

      if (activeBookings && activeBookings.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Cannot delete customer with active bookings'
        });
        return;
      }

      // Soft delete by setting isActive to false
      await this.userRepository.update(parseInt(id), {
        isActive: false
      });

      res.json({
        success: true,
        message: 'Customer deactivated successfully'
      });
    } catch (error) {
      console.error('Delete customer error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete customer'
      });
    }
  }

  // Get customer statistics
  async getCustomerStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const customer = await this.userRepository.findOne({
        where: { 
          id: parseInt(id),
          role: UserRole.CUSTOMER
        },
        relations: ['bookings', 'quotations', 'payments']
      });

      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
        return;
      }

      const stats = {
        totalBookings: customer.bookings?.length || 0,
        activeBookings: customer.bookings?.filter(booking => 
          booking.status === 'confirmed' || booking.status === 'active'
        ).length || 0,
        completedBookings: customer.bookings?.filter(booking => 
          booking.status === 'completed'
        ).length || 0,
        totalQuotations: customer.quotations?.length || 0,
        totalPayments: customer.payments?.length || 0,
        totalSpent: customer.payments?.reduce((sum, payment) => 
          sum + parseFloat(payment.amount.toString()), 0
        ) || 0,
        averageOrderValue: 0,
        lastBookingDate: customer.bookings?.length > 0 
          ? Math.max(...customer.bookings.map(booking => 
              new Date(booking.createdAt).getTime()
            )) 
          : null
      };

      if (stats.totalBookings > 0) {
        stats.averageOrderValue = stats.totalSpent / stats.totalBookings;
      }

      res.json({
        success: true,
        data: {
          customer: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            role: customer.role,
            createdAt: customer.createdAt
          },
          stats
        }
      });
    } catch (error) {
      console.error('Get customer stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customer statistics'
      });
    }
  }

  // Search customers
  async searchCustomers(req: Request, res: Response): Promise<void> {
    try {
      const { q, limit = 10 } = req.query;

      if (!q || typeof q !== 'string' || q.length < 2) {
        res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters'
        });
        return;
      }

      const customers = await this.userRepository
        .createQueryBuilder('user')
        .where('user.role = :role', { role: UserRole.CUSTOMER })
        .andWhere(
          'user.name ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search',
          { search: `%${q}%` }
        )
        .andWhere('user.isActive = :isActive', { isActive: true })
        .orderBy('user.name', 'ASC')
        .limit(Number(limit))
        .getMany();

      res.json({
        success: true,
        data: customers.map(customer => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          role: customer.role
        }))
      });
    } catch (error) {
      console.error('Search customers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search customers'
      });
    }
  }
}
