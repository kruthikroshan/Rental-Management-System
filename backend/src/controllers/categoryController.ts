import { Request, Response } from 'express';
import { Repository, DataSource, Like, Not } from 'typeorm';
import { validationResult } from 'express-validator';
import { Category } from '../entities/Category';

export class CategoryController {
  private categoryRepository: Repository<Category>;

  constructor(dataSource: DataSource) {
    this.categoryRepository = dataSource.getRepository(Category);
  }

  // Get all categories with optional search and pagination
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        parentId,
        isActive
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {};

      if (search) {
        where.name = Like(`%${search}%`);
      }

      if (parentId !== undefined) {
        where.parentId = parentId === 'null' ? null : Number(parentId);
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const [categories, total] = await this.categoryRepository.findAndCount({
        where,
        take: Number(limit),
        skip,
        order: {
          sortOrder: 'ASC',
          name: 'ASC'
        },
        relations: ['parent', 'children']
      });

      res.json({
        success: true,
        data: categories,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories'
      });
    }
  }

  // Get category by ID
  async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const category = await this.categoryRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['parent', 'children', 'products']
      });

      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found'
        });
        return;
      }

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Get category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category'
      });
    }
  }

  // Create new category
  async createCategory(req: Request, res: Response): Promise<void> {
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
        parentId,
        isActive,
        sortOrder,
        imageUrl
      } = req.body;

      // Check if parent category exists (if parentId is provided)
      if (parentId) {
        const parentCategory = await this.categoryRepository.findOne({
          where: { id: parentId }
        });

        if (!parentCategory) {
          res.status(400).json({
            success: false,
            message: 'Parent category not found'
          });
          return;
        }
      }

      // Check if category name already exists at the same level
      const existingCategory = await this.categoryRepository.findOne({
        where: {
          name,
          parentId: parentId || null
        }
      });

      if (existingCategory) {
        res.status(400).json({
          success: false,
          message: 'Category name already exists at this level'
        });
        return;
      }

      const category = this.categoryRepository.create({
        name,
        description,
        parentId: parentId || null,
        isActive: isActive !== false,
        sortOrder: sortOrder || 0,
        imageUrl
      });

      await this.categoryRepository.save(category);

      const savedCategory = await this.categoryRepository.findOne({
        where: { id: category.id },
        relations: ['parent', 'children']
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: savedCategory
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create category'
      });
    }
  }

  // Update category
  async updateCategory(req: Request, res: Response): Promise<void> {
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
        description,
        parentId,
        isActive,
        sortOrder,
        imageUrl
      } = req.body;

      const category = await this.categoryRepository.findOne({
        where: { id: parseInt(id) }
      });

      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found'
        });
        return;
      }

      // Check if parent category exists (if parentId is provided and changed)
      if (parentId && parentId !== category.parentId) {
        const parentCategory = await this.categoryRepository.findOne({
          where: { id: parentId }
        });

        if (!parentCategory) {
          res.status(400).json({
            success: false,
            message: 'Parent category not found'
          });
          return;
        }

        // Prevent circular reference (category cannot be its own parent)
        if (parentId === parseInt(id)) {
          res.status(400).json({
            success: false,
            message: 'Category cannot be its own parent'
          });
          return;
        }
      }

      // Check if category name already exists at the same level (excluding current category)
      if (name && name !== category.name) {
        const existingCategory = await this.categoryRepository.findOne({
          where: {
            name,
            parentId: parentId || null,
            id: Not(parseInt(id))
          }
        });

        if (existingCategory) {
          res.status(400).json({
            success: false,
            message: 'Category name already exists at this level'
          });
          return;
        }
      }

      // Update category
      await this.categoryRepository.update(parseInt(id), {
        name: name || category.name,
        description: description !== undefined ? description : category.description,
        parentId: parentId !== undefined ? (parentId || null) : category.parentId,
        isActive: isActive !== undefined ? isActive : category.isActive,
        sortOrder: sortOrder !== undefined ? sortOrder : category.sortOrder,
        imageUrl: imageUrl !== undefined ? imageUrl : category.imageUrl
      });

      const updatedCategory = await this.categoryRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['parent', 'children']
      });

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: updatedCategory
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update category'
      });
    }
  }

  // Delete category
  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const category = await this.categoryRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['children', 'products']
      });

      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found'
        });
        return;
      }

      // Check if category has subcategories
      if (category.children && category.children.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Cannot delete category with subcategories'
        });
        return;
      }

      // Check if category has products
      if (category.products && category.products.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Cannot delete category with products'
        });
        return;
      }

      await this.categoryRepository.remove(category);

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete category'
      });
    }
  }

  // Get category tree (hierarchical structure)
  async getCategoryTree(req: Request, res: Response): Promise<void> {
    try {
      const { includeInactive = false } = req.query;

      const where: any = {};
      if (!includeInactive) {
        where.isActive = true;
      }

      // Get all root categories (no parent)
      const rootCategories = await this.categoryRepository.find({
        where: { ...where, parentId: null },
        order: {
          sortOrder: 'ASC',
          name: 'ASC'
        }
      });

      // Build tree structure recursively
      const buildTree = async (categories: Category[]): Promise<any[]> => {
        const tree: any[] = [];
        
        for (const category of categories) {
          const subcategories = await this.categoryRepository.find({
            where: { ...where, parentId: category.id },
            order: {
              sortOrder: 'ASC',
              name: 'ASC'
            }
          });

          const categoryWithChildren = {
            ...category,
            children: subcategories.length > 0 ? await buildTree(subcategories) : []
          };

          tree.push(categoryWithChildren);
        }

        return tree;
      };

      const categoryTree = await buildTree(rootCategories);

      res.json({
        success: true,
        data: categoryTree
      });
    } catch (error) {
      console.error('Get category tree error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category tree'
      });
    }
  }
}
