import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import { Category } from '../entities/Category';
import { ProductVariant } from '../entities/ProductVariant';
import { validationResult } from 'express-validator';

export class ProductController {
  private productRepository = AppDataSource.getRepository(Product);
  private categoryRepository = AppDataSource.getRepository(Category);
  private variantRepository = AppDataSource.getRepository(ProductVariant);

  // Get all products with pagination and filtering
  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const categoryId = req.query.categoryId as string;
      const condition = req.query.condition as string;
      
      const queryBuilder = this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndSelect('product.variants', 'variants')
        .skip((page - 1) * limit)
        .take(limit);

      if (search) {
        queryBuilder.andWhere(
          '(product.name ILIKE :search OR product.description ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      if (categoryId) {
        queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
      }

      if (condition) {
        queryBuilder.andWhere('product.condition = :condition', { condition });
      }

      const [products, total] = await queryBuilder.getManyAndCount();

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            current: page,
            total: Math.ceil(total / limit),
            count: products.length,
            totalItems: total
          }
        }
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products'
      });
    }
  }

  // Get single product by ID
  async getProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const product = await this.productRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['category', 'variants']
      });

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

  // Create new product
  async createProduct(req: Request, res: Response): Promise<void> {
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
        description,
        categoryId,
        baseRentalRate,
        rentalUnits,
        condition,
        specifications,
        images,
        tags,
        isActive,
        sku,
        totalQuantity,
        availableQuantity,
        securityDeposit,
        brand,
        model,
        weight,
        dimensions
      } = req.body;

      // Check if category exists
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId }
      });

      if (!category) {
        res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
        return;
      }

      const product = this.productRepository.create({
        name,
        description,
        categoryId,
        baseRentalRate,
        rentalUnits,
        condition,
        specifications,
        images,
        tags,
        isActive,
        sku: sku || `SKU-${Date.now()}`,
        totalQuantity: totalQuantity || 1,
        availableQuantity: availableQuantity || totalQuantity || 1,
        securityDeposit: securityDeposit || 0,
        brand,
        model,
        weight,
        dimensions
      });

      await this.productRepository.save(product);

      const savedProduct = await this.productRepository.findOne({
        where: { id: product.id },
        relations: ['category']
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: savedProduct
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product'
      });
    }
  }

  // Update product
  async updateProduct(req: Request, res: Response): Promise<void> {
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
      const updateData = req.body;

      const product = await this.productRepository.findOne({
        where: { id: parseInt(id) }
      });

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
      }

      // If categoryId is being updated, verify it exists
      if (updateData.categoryId) {
        const category = await this.categoryRepository.findOne({
          where: { id: updateData.categoryId }
        });

        if (!category) {
          res.status(400).json({
            success: false,
            message: 'Invalid category ID'
          });
          return;
        }
      }

      await this.productRepository.update(id, updateData);

      const updatedProduct = await this.productRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['category', 'variants']
      });

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
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

      const product = await this.productRepository.findOne({
        where: { id: parseInt(id) }
      });

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
      }

      await this.productRepository.remove(product);

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

  // Get product variants
  async getProductVariants(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const variants = await this.variantRepository.find({
        where: { productId: parseInt(id) }
      });

      res.json({
        success: true,
        data: variants
      });
    } catch (error) {
      console.error('Get product variants error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product variants'
      });
    }
  }

  // Add product variant
  async addProductVariant(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { 
        name, 
        type, 
        priceAdjustment, 
        description, 
        images, 
        stockQuantity, 
        isActive, 
        sortOrder 
      } = req.body;

      const product = await this.productRepository.findOne({
        where: { id: parseInt(id) }
      });

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
      }

      const variant = this.variantRepository.create({
        productId: parseInt(id),
        name,
        type,
        priceAdjustment: priceAdjustment || 0,
        description,
        images: images || [],
        stockQuantity: stockQuantity || 0,
        isActive: isActive !== false,
        sortOrder: sortOrder || 0
      });

      await this.variantRepository.save(variant);

      res.status(201).json({
        success: true,
        message: 'Product variant added successfully',
        data: variant
      });
    } catch (error) {
      console.error('Add product variant error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add product variant'
      });
    }
  }
}
