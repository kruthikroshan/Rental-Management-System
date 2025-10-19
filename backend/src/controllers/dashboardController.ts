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

      const recentBookings = await this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.customer', 'customer')
        .leftJoinAndSelect('booking.items', 'items')
        .leftJoinAndSelect('items.product', 'product')
        .orderBy('booking.createdAt', 'DESC')
        .limit(parseInt(limit as string))
        .getMany();

      const formattedBookings = recentBookings.map(booking => ({
        id: booking.id,
        customer: booking.customer?.name || 'Unknown',
        product: booking.items?.[0]?.product?.name || 'Multiple Items',
        amount: `₹${booking.totalAmount.toLocaleString()}`,
        status: booking.status,
        date: booking.createdAt.toISOString().split('T')[0],
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

      // Get recent payments
      const recentPayments = await this.paymentRepository
        .createQueryBuilder('payment')
        .leftJoinAndSelect('payment.invoice', 'invoice')
        .leftJoinAndSelect('invoice.bookingOrder', 'booking')
        .leftJoinAndSelect('booking.customer', 'customer')
        .where('payment.status = :status', { status: 'completed' })
        .orderBy('payment.createdAt', 'DESC')
        .limit(parseInt(limit as string) / 2)
        .getMany();

      // Get recent bookings
      const recentBookings = await this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.customer', 'customer')
        .leftJoinAndSelect('booking.items', 'items')
        .leftJoinAndSelect('items.product', 'product')
        .orderBy('booking.createdAt', 'DESC')
        .limit(parseInt(limit as string) / 2)
        .getMany();

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
          message: `Payment received from ${payment.invoice?.bookingOrder?.customer?.name || 'Customer'}`,
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
        .slice(0, parseInt(limit as string))
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
    const activeCount = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.status IN (:...statuses)', { statuses: ['confirmed', 'active'] })
      .getCount();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newToday = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.createdAt >= :today', { today })
      .getCount();

    return {
      count: activeCount,
      newToday
    };
  }

  private async getTotalCustomers() {
    const count = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: 'customer' })
      .getCount();

    return { count };
  }

  private async getPendingReturns() {
    const now = new Date();
    
    const pendingReturns = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.status = :status', { status: 'active' })
      .andWhere('booking.returnDate < :now', { now })
      .getCount();

    const overdue = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.status = :status', { status: 'active' })
      .andWhere('booking.returnDate < :cutoff', { 
        cutoff: new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago
      })
      .getCount();

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
    const previousRevenue = await this.getTotalRevenue(previousPeriodStart);

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

      const dayRevenue = await this.paymentRepository
        .createQueryBuilder('payment')
        .select('SUM(payment.amount)', 'total')
        .where('payment.status = :status', { status: 'completed' })
        .andWhere('payment.createdAt >= :startDate', { startDate: date })
        .andWhere('payment.createdAt < :endDate', { endDate: nextDate })
        .getRawOne();

      chartData.push({
        date: date.toISOString().split('T')[0],
        revenue: parseFloat(dayRevenue.total) || 0
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

    const currentCustomers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: 'customer' })
      .andWhere('user.createdAt >= :startDate', { startDate: currentPeriodStart })
      .getCount();

    const previousCustomers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: 'customer' })
      .andWhere('user.createdAt >= :startDate', { startDate: previousPeriodStart })
      .andWhere('user.createdAt < :endDate', { endDate: currentPeriodStart })
      .getCount();

    const changePercent = previousCustomers > 0 
      ? ((currentCustomers - previousCustomers) / previousCustomers) * 100
      : 0;

    return {
      changePercent: Math.round(changePercent * 100) / 100
    };
  }

  private async getPopularProducts(startDate: Date) {
    const popularProducts = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoin('booking.items', 'item')
      .leftJoin('item.product', 'product')
      .select('product.name', 'productName')
      .addSelect('COUNT(item.id)', 'bookingCount')
      .addSelect('SUM(item.lineTotal)', 'totalRevenue')
      .where('booking.createdAt >= :startDate', { startDate })
      .groupBy('product.id, product.name')
      .orderBy('bookingCount', 'DESC')
      .limit(5)
      .getRawMany();

    return popularProducts.map(product => ({
      name: product.productName,
      bookings: parseInt(product.bookingCount),
      revenue: parseFloat(product.totalRevenue) || 0
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
