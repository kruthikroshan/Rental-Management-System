import { Request, Response } from 'express';
import { UserModel } from '../models/User.model';
import { ProductModel } from '../models/Product.model';
import { BookingOrderModel } from '../models/BookingOrder.model';
import { PaymentModel } from '../models/Payment.model';

export class DashboardController {
  constructor() {
    // No initialization needed for Mongoose models
  }

  // Get dashboard statistics
  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      console.log('Dashboard stats request received');
      const { period = '30' } = req.query; // days
      const periodDays = parseInt(period as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);
      console.log('Period:', periodDays, 'Start date:', startDate);

      // Get current period stats with individual error handling
      let totalRevenue, activeRentals, totalCustomers, pendingReturns;
      let revenueComparison, customerGrowth, popularProducts;

      try {
        console.log('Getting total revenue...');
        totalRevenue = await this.getTotalRevenue(startDate);
        console.log('Total revenue result:', totalRevenue);
      } catch (error) {
        console.error('Error getting total revenue:', error);
        totalRevenue = { total: 0 };
      }

      try {
        console.log('Getting active rentals...');
        activeRentals = await this.getActiveRentals();
        console.log('Active rentals result:', activeRentals);
      } catch (error) {
        console.error('Error getting active rentals:', error);
        activeRentals = { count: 0, newToday: 0 };
      }

      try {
        console.log('Getting total customers...');
        totalCustomers = await this.getTotalCustomers();
        console.log('Total customers result:', totalCustomers);
      } catch (error) {
        console.error('Error getting total customers:', error);
        totalCustomers = { count: 0 };
      }

      try {
        console.log('Getting pending returns...');
        pendingReturns = await this.getPendingReturns();
        console.log('Pending returns result:', pendingReturns);
      } catch (error) {
        console.error('Error getting pending returns:', error);
        pendingReturns = { count: 0, overdue: 0 };
      }

      try {
        console.log('Getting revenue comparison...');
        revenueComparison = await this.getRevenueComparison(periodDays);
        console.log('Revenue comparison result:', revenueComparison);
      } catch (error) {
        console.error('Error getting revenue comparison:', error);
        revenueComparison = { changePercent: 0, chartData: [] };
      }

      try {
        console.log('Getting customer growth...');
        customerGrowth = await this.getCustomerGrowth(periodDays);
        console.log('Customer growth result:', customerGrowth);
      } catch (error) {
        console.error('Error getting customer growth:', error);
        customerGrowth = { changePercent: 0 };
      }

      try {
        console.log('Getting popular products...');
        popularProducts = await this.getPopularProducts(startDate);
        console.log('Popular products result:', popularProducts);
      } catch (error) {
        console.error('Error getting popular products:', error);
        popularProducts = [];
      }

      const stats = {
        totalRevenue: {
          value: totalRevenue.total,
          change: `${revenueComparison.changePercent >= 0 ? '+' : ''}${revenueComparison.changePercent}%`,
          changeText: `from last ${periodDays} days`,
          changeType: revenueComparison.changePercent >= 0 ? 'positive' : 'negative'
        },
        activeRentals: {
          value: activeRentals.count,
          change: `+${activeRentals.newToday}`,
          changeText: 'from yesterday',
          changeType: activeRentals.newToday >= 0 ? 'positive' : 'negative'
        },
        totalCustomers: {
          value: totalCustomers.count,
          change: `${customerGrowth.changePercent >= 0 ? '+' : ''}${customerGrowth.changePercent}%`,
          changeText: `from last ${periodDays} days`,
          changeType: customerGrowth.changePercent >= 0 ? 'positive' : 'negative'
        },
        pendingReturns: {
          value: pendingReturns.count,
          change: `${pendingReturns.overdue} overdue`,
          changeText: 'requires attention',
          changeType: pendingReturns.overdue > 0 ? 'negative' : 'positive'
        }
      };

      console.log('Final stats:', stats);

      res.json({
        success: true,
        data: {
          stats,
          popularProducts,
          revenueChart: revenueComparison.chartData
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

  // Get recent bookings/rentals
  async getRecentBookings(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query;

      const recentBookings = await BookingOrderModel
        .find()
        .populate('customer', 'name email')
        .populate('items.product', 'name')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit as string))
        .lean();

      const formattedBookings = recentBookings.map(booking => ({
        id: booking._id,
        customer: booking.customer?.name || 'Unknown',
        product: booking.items?.[0]?.product?.name || 'Multiple Items',
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
      const limitNum = parseInt(limit as string);

      // Get recent payments
      const recentPayments = await PaymentModel
        .find({ status: 'completed' })
        .populate({
          path: 'booking',
          populate: { path: 'customer', select: 'name' }
        })
        .sort({ createdAt: -1 })
        .limit(Math.floor(limitNum / 2))
        .lean();

      // Get recent bookings
      const recentBookings = await BookingOrderModel
        .find()
        .populate('customer', 'name')
        .populate('items.product', 'name')
        .sort({ createdAt: -1 })
        .limit(Math.floor(limitNum / 2))
        .lean();

      const activities: Array<{
        type: string;
        message: string;
        details: string;
        timestamp: Date;
        color: string;
      }> = [];

      // Add payment activities
      recentPayments.forEach(payment => {
        activities.push({
          type: 'payment',
          message: `Payment received from ${payment.booking?.customer?.name || 'Customer'}`,
          details: `₹${payment.amount.toLocaleString()} for rental`,
          timestamp: payment.createdAt,
          color: 'green'
        });
      });

      // Add booking activities
      recentBookings.forEach(booking => {
        activities.push({
          type: 'booking',
          message: `New booking created`,
          details: `${booking.items?.[0]?.product?.name || 'Product'} for ${booking.customer?.name || 'Customer'}`,
          timestamp: booking.createdAt,
          color: 'blue'
        });
      });

      // Sort by timestamp and limit
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limitNum)
        .map(activity => ({
          ...activity,
          timeAgo: this.getTimeAgo(activity.timestamp)
        }));

      res.json({
        success: true,
        data: sortedActivities
      });
    } catch (error) {
      console.error('Get recent activities error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent activities'
      });
    }
  }

  // Helper methods
  private async getTotalRevenue(startDate: Date) {
    const result = await PaymentModel.aggregate([
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

    return {
      total: result[0]?.total || 0
    };
  }

  private async getActiveRentals() {
    const activeCount = await BookingOrderModel.countDocuments({
      status: { $in: ['confirmed', 'active'] }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newToday = await BookingOrderModel.countDocuments({
      createdAt: { $gte: today }
    });

    return {
      count: activeCount,
      newToday
    };
  }

  private async getTotalCustomers() {
    const count = await UserModel.countDocuments({
      role: 'customer'
    });

    return { count };
  }

  private async getPendingReturns() {
    const now = new Date();
    
    const pendingReturns = await BookingOrderModel.countDocuments({
      status: 'active',
      returnDate: { $lt: now }
    });

    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    const overdue = await BookingOrderModel.countDocuments({
      status: 'active',
      returnDate: { $lt: cutoff }
    });

    return {
      count: pendingReturns,
      overdue
    };
  }

  private async getRevenueComparison(periodDays: number) {
    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(currentPeriodStart.getDate() - periodDays);

    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (periodDays * 2));

    const currentRevenue = await this.getTotalRevenue(currentPeriodStart);
    
    // For previous period
    const previousResult = await PaymentModel.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { 
            $gte: previousPeriodStart,
            $lt: currentPeriodStart
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const previousRevenue = { total: previousResult[0]?.total || 0 };

    const changePercent = previousRevenue.total > 0 
      ? ((currentRevenue.total - previousRevenue.total) / previousRevenue.total) * 100
      : 0;

    // Generate chart data for the last 7 days
    const chartData: Array<{
      date: string;
      revenue: number;
    }> = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayRevenueResult = await PaymentModel.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { 
              $gte: date,
              $lt: nextDate
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      chartData.push({
        date: date.toISOString().split('T')[0],
        revenue: dayRevenueResult[0]?.total || 0
      });
    }

    return {
      changePercent: Math.round(changePercent * 100) / 100,
      chartData
    };
  }

  private async getCustomerGrowth(periodDays: number) {
    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(currentPeriodStart.getDate() - periodDays);

    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (periodDays * 2));

    const currentCustomers = await UserModel.countDocuments({
      role: 'customer',
      createdAt: { $gte: currentPeriodStart }
    });

    const previousCustomers = await UserModel.countDocuments({
      role: 'customer',
      createdAt: { 
        $gte: previousPeriodStart,
        $lt: currentPeriodStart
      }
    });

    const changePercent = previousCustomers > 0 
      ? ((currentCustomers - previousCustomers) / previousCustomers) * 100
      : 0;

    return {
      changePercent: Math.round(changePercent * 100) / 100
    };
  }

  private async getPopularProducts(startDate: Date) {
    const popularProducts = await BookingOrderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      {
        $unwind: '$productInfo'
      },
      {
        $group: {
          _id: '$productInfo._id',
          productName: { $first: '$productInfo.name' },
          bookingCount: { $sum: 1 },
          totalRevenue: { $sum: '$items.lineTotal' }
        }
      },
      {
        $sort: { bookingCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    return popularProducts.map(product => ({
      name: product.productName,
      bookings: product.bookingCount,
      revenue: product.totalRevenue || 0
    }));
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  }
}
