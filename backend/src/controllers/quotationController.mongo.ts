import { Request, Response } from 'express';
import { QuotationModel } from '../models/Quotation.model';
import { UserModel } from '../models/User.model';

export class QuotationController {
  // Get all quotations with pagination and filtering
  async getQuotations(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        customerId,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const query: any = {};

      if (status) {
        query.status = status;
      }

      if (customerId) {
        query.customerId = customerId;
      }

      const sortOptions: any = {};
      sortOptions[sortBy as string] = sortOrder === 'DESC' ? -1 : 1;

      const quotations = await QuotationModel
        .find(query)
        .populate('customerId', 'name email')
        .sort(sortOptions)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const total = await QuotationModel.countDocuments(query);

      res.json({
        success: true,
        data: {
          quotations,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get quotations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quotations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get single quotation
  async getQuotation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const quotation = await QuotationModel
        .findById(id)
        .populate('customerId', 'name email phone');

      if (!quotation) {
        res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
        return;
      }

      res.json({
        success: true,
        data: quotation
      });
    } catch (error) {
      console.error('Get quotation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quotation'
      });
    }
  }

  // Create quotation
  async createQuotation(req: Request, res: Response): Promise<void> {
    try {
      const quotationData = req.body;

      // Validate customer exists
      const customer = await UserModel.findById(quotationData.customerId);
      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
        return;
      }

      const quotation = await QuotationModel.create(quotationData);

      res.status(201).json({
        success: true,
        message: 'Quotation created successfully',
        data: quotation
      });
    } catch (error) {
      console.error('Create quotation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create quotation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update quotation
  async updateQuotation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const quotation = await QuotationModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('customerId', 'name email');

      if (!quotation) {
        res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Quotation updated successfully',
        data: quotation
      });
    } catch (error) {
      console.error('Update quotation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update quotation'
      });
    }
  }

  // Delete quotation
  async deleteQuotation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const quotation = await QuotationModel.findByIdAndDelete(id);

      if (!quotation) {
        res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Quotation deleted successfully'
      });
    } catch (error) {
      console.error('Delete quotation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete quotation'
      });
    }
  }
}
