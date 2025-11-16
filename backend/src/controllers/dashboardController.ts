import { Request, Response } from 'express';
import { UserModel } from '../models/User.model';
import { ProductModel } from '../models/Product.model';
import { BookingOrderModel } from '../models/BookingOrder.model';
import { PaymentModel } from '../models/Payment.model';

export class DashboardController {
  // Get dashboard statistics
  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const { period = '30' } = req.query;
      const periodDays = parseInt(period as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      // Get total revenue
      const revenueResult = await PaymentModel.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);
      const totalRevenue = revenueResult[0]?.total || 0;

      // Get active rentals
      const activeRentals = await BookingOrderModel.countDocuments({
        status: { $in: ['confirmed', 'active'] }
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newToday = await BookingOrderModel.countDocuments({
        createdAt: { $gte: today }
      });

      // Get total customers
      const totalCustomers = await UserModel.countDocuments({
        role: 'customer'
      });

      // Get pending returns
      const now = new Date();
      const pendingReturns = await BookingOrderModel.countDocuments({
        status: 'active',
        returnDate: { $lt: now }
      });

      const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const overdue = await BookingOrderModel.countDocuments({
        status: 'active',
        returnDate: { $lt: cutoff }
      });

      const stats = {
        totalRevenue: {
          value: totalRevenue,
          change: '+12.5%',
          changeText: `from last ${periodDays} days`,
          changeType: 'positive'
        },
        activeRentals: {
          value: activeRentals,
          change: `+${newToday}`,
          changeText: 'from yesterday',
          changeType: 'positive'
        },
        totalCustomers: {
          value: totalCustomers,
          change: '+8.2%',
          changeText: `from last ${periodDays} days`,
          changeType: 'positive'
        },
        pendingReturns: {
          value: pendingReturns,
          change: `${overdue} overdue`,
          changeText: 'requires attention',
          changeType: overdue > 0 ? 'negative' : 'positive'
        }
      };

      res.json({
        success: true,
        data: {
          stats,
          popularProducts: [],
          revenueChart: []
        }
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get recent bookings
  async getRecentBookings(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query;

      const recentBookings = await BookingOrderModel
        .find()
        .populate('customerId', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit as string));

      const formattedBookings = recentBookings.map((booking: any) => ({
        id: booking._id,
        customer: booking.customerId?.name || 'Unknown',
        product: 'Product',
        amount: `₹${booking.totalAmount.toLocaleString()}`,
        status: booking.status,
        date: new Date(booking.createdAt).toISOString().split('T')[0],
        createdAt: booking.createdAt
      }));

      res.json({
        success: true,
        data: formattedBookings
      });
    } catch (error) {
      console.error('Get recent bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent bookings'
      });
    }
  }

  // Get recent activities
  async getRecentActivities(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query;

      const activities = [
        {
          type: 'booking',
          message: 'New booking created',
          details: 'Sample booking activity',
          timestamp: new Date(),
          color: 'blue',
          timeAgo: 'Just now'
        }
      ];

      res.json({
        success: true,
        data: activities
      });
    } catch (error) {
      console.error('Get recent activities error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent activities'
      });
    }
  }
}
