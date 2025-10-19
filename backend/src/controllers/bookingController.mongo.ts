import { Request, Response } from 'express';
import { BookingOrderModel } from '../models/BookingOrder.model';
import { ProductModel } from '../models/Product.model';
import { UserModel } from '../models/User.model';

export class BookingController {
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

      if (startDate || endDate) {
        query.startDate = {};
        if (startDate) {
          query.startDate.$gte = new Date(startDate as string);
        }
        if (endDate) {
          query.startDate.$lte = new Date(endDate as string);
        }
      }

      const sortOptions: any = {};
      sortOptions[sortBy as string] = sortOrder === 'DESC' ? -1 : 1;

      const bookings = await BookingOrderModel
        .find(query)
        .populate('customerId', 'name email')
        .sort(sortOptions)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const total = await BookingOrderModel.countDocuments(query);

      res.json({
        success: true,
        data: {
          bookings,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bookings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get single booking
  async getBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const booking = await BookingOrderModel
        .findById(id)
        .populate('customerId', 'name email phone');

      if (!booking) {
        res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
        return;
      }

      res.json({
        success: true,
        data: booking
      });
    } catch (error) {
      console.error('Get booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch booking'
      });
    }
  }

  // Create booking
  async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const bookingData = req.body;

      // Validate customer exists
      const customer = await UserModel.findById(bookingData.customerId);
      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
        return;
      }

      const booking = await BookingOrderModel.create(bookingData);

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking
      });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create booking',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update booking
  async updateBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const booking = await BookingOrderModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('customerId', 'name email');

      if (!booking) {
        res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Booking updated successfully',
        data: booking
      });
    } catch (error) {
      console.error('Update booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update booking'
      });
    }
  }

  // Delete booking
  async deleteBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const booking = await BookingOrderModel.findByIdAndDelete(id);

      if (!booking) {
        res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Booking deleted successfully'
      });
    } catch (error) {
      console.error('Delete booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete booking'
      });
    }
  }

  // Update booking status
  async updateBookingStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const booking = await BookingOrderModel.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!booking) {
        res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Booking status updated successfully',
        data: booking
      });
    } catch (error) {
      console.error('Update booking status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update booking status'
      });
    }
  }
}
