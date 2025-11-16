import { Request, Response } from 'express';
import { UserModel } from '../models/User.model';

export class CustomerController {
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

      const query: any = {
        role: 'customer'
      };

      if (search) {
        query.$or = [
          { name: new RegExp(search as string, 'i') },
          { email: new RegExp(search as string, 'i') }
        ];
      }

      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }

      const sortOptions: any = {};
      sortOptions[sortBy as string] = sortOrder === 'DESC' ? -1 : 1;

      const customers = await UserModel
        .find(query)
        .select('-password -refreshToken')
        .sort(sortOptions)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const total = await UserModel.countDocuments(query);

      res.json({
        success: true,
        data: customers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Get customers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customers',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get single customer
  async getCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const customer = await UserModel
        .findOne({ _id: id, role: 'customer' })
        .select('-password -refreshToken');

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

  // Create customer
  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const customerData = {
        ...req.body,
        role: 'customer'
      };

      // Check if email already exists
      const existingCustomer = await UserModel.findOne({ email: customerData.email });
      if (existingCustomer) {
        res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
        return;
      }

      const customer = await UserModel.create(customerData);
      
      // Remove password from response
      const customerResponse = customer.toJSON();
      delete (customerResponse as any).passwordHash;

      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: customerResponse
      });
    } catch (error) {
      console.error('Create customer error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create customer',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update customer
  async updateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Don't allow role or password updates through this endpoint
      delete updateData.role;
      delete updateData.password;

      const customer = await UserModel.findOneAndUpdate(
        { _id: id, role: 'customer' },
        updateData,
        { new: true, runValidators: true }
      ).select('-password -refreshToken');

      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Customer updated successfully',
        data: customer
      });
    } catch (error) {
      console.error('Update customer error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update customer'
      });
    }
  }

  // Delete/deactivate customer
  async deleteCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Instead of deleting, deactivate the customer
      const customer = await UserModel.findOneAndUpdate(
        { _id: id, role: 'customer' },
        { isActive: false },
        { new: true }
      ).select('-password -refreshToken');

      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Customer deactivated successfully',
        data: customer
      });
    } catch (error) {
      console.error('Delete customer error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete customer'
      });
    }
  }
}
