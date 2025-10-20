import { Request, Response } from 'express';
import { ProductModel } from '../models/Product.model';
import { CategoryModel } from '../models/Category.model';

export class ProductController {
  // Get all products with pagination and filtering
  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const categoryId = req.query.categoryId as string;
      const condition = req.query.condition as string;
      
      const query: any = {};

      if (search) {
        query.$or = [
          { name: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') }
        ];
      }

      if (categoryId) {
        query.categoryId = categoryId;
      }

      if (condition) {
        query.condition = condition;
      }

      const products = await ProductModel
        .find(query)
        .populate('categoryId', 'name')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await ProductModel.countDocuments(query);

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get single product
  async getProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const product = await ProductModel
        .findById(id)
        .populate('categoryId', 'name');

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product'
      });
    }
  }

  // Create product
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const productData = req.body;

      // Auto-generate slug from name if not provided
      if (!productData.slug && productData.name) {
        productData.slug = productData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      // Set ownerId from authenticated user or use a default
      if (!productData.ownerId) {
        // TODO: Get from req.user when auth is implemented
        // For now, use a mock ObjectId or make it optional
        productData.ownerId = new (require('mongoose').Types.ObjectId)();
      }

      // Handle categoryId - convert to ObjectId or set default
      if (productData.categoryId === 0 || !productData.categoryId) {
        // Create a default category ObjectId
        productData.categoryId = new (require('mongoose').Types.ObjectId)();
      }

      const product = await ProductModel.create(productData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update product
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const product = await ProductModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('categoryId', 'name');

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product'
      });
    }
  }

  // Delete product
  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const product = await ProductModel.findByIdAndDelete(id);

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product'
      });
    }
  }

  // Get all categories
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await CategoryModel.find().sort({ name: 1 });

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories'
      });
    }
  }

  // Get available products (for booking)
  async getAvailableProducts(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const categoryId = req.query.categoryId as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      const query: any = {
        isActive: true,
        isRentable: true,
        totalQuantity: { $gt: 0 }
      };

      if (search) {
        query.$or = [
          { name: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') }
        ];
      }

      if (categoryId) {
        query.categoryId = categoryId;
      }

      // TODO: Add date availability check based on bookings
      // For now, we return all active rentable products

      const products = await ProductModel
        .find(query)
        .populate('categoryId', 'name')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await ProductModel.countDocuments(query);

      res.json({
        success: true,
        data: {
          products,
          total,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get available products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch available products',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
