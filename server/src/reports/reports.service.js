import mongoose from 'mongoose';

const Product = mongoose.model('Product');
const Rental = mongoose.model('Rental');
const User = mongoose.model('User');

export class ReportsService {
  // Get dashboard overview statistics
  static async getDashboardStats() {
    try {
      const totalProducts = await Product.countDocuments({});
      const totalRentals = await Rental.countDocuments({});
      const activeRentals = await Rental.countDocuments({
        status: { $in: ['CONFIRMED', 'PICKED_UP'] }
      });

      const revenueResult = await Rental.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' }
          }
        }
      ]);

      const totalRevenue = revenueResult[0]?.totalRevenue || 0;

      const ratingResult = await Product.aggregate([
        { $match: { reviewCount: { $gt: 0 } } },
        { 
          $group: { 
            _id: null, 
            avg: { $avg: '$averageRating' } 
          } 
        }
      ]);
      const averagePlatformRating = ratingResult[0]?.avg || 0;

      return {
        totalProducts,
        totalRentals,
        activeRentals,
        totalRevenue,
        averagePlatformRating
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalProducts: 0,
        totalRentals: 0,
        activeRentals: 0,
        totalRevenue: 0,
        averagePlatformRating: 0
      };
    }
  }

  // Get top categories by rental count
  static async getTopCategories(limit = 10) {
    try {
      const topCategories = await Rental.aggregate([
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $group: {
            _id: '$product.category',
            name: { $first: '$product.category' },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: limit }
      ]);

      return topCategories.map(cat => ({
        name: cat.name || 'Uncategorized',
        count: cat.count
      }));
    } catch (error) {
      console.error('Error getting top categories:', error);
      return [];
    }
  }

  // Get top products by rental count and revenue
  static async getTopProducts(limit = 10) {
    try {
      const topProducts = await Rental.aggregate([
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $group: {
            _id: '$productId',
            name: { $first: '$product.name' },
            category: { $first: '$product.category' },
            rentalCount: { $sum: 1 },
            totalRevenue: { $sum: '$totalPrice' }
          }
        },
        { $sort: { rentalCount: -1 } },
        { $limit: limit }
      ]);

      return topProducts;
    } catch (error) {
      console.error('Error getting top products:', error);
      return [];
    }
  }

  // Get top customers by rental count and spending
  static async getTopCustomers(limit = 10) {
    try {
      const topCustomers = await Rental.aggregate([
        {
          $group: {
            _id: '$userId',
            name: { $first: '$userName' },
            email: { $first: '$userEmail' },
            rentalCount: { $sum: 1 },
            totalSpent: { $sum: '$totalPrice' }
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: limit }
      ]);

      return topCustomers.map(customer => ({
        id: customer._id,
        name: customer.name,
        email: customer.email,
        rentalCount: customer.rentalCount,
        totalSpent: customer.totalSpent
      }));
    } catch (error) {
      console.error('Error getting top customers:', error);
      return [];
    }
  }

  // Get revenue trends over time
  static async getRevenueTrends(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const trends = await Rental.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            revenue: { $sum: '$totalPrice' }
          }
        },
        {
          $project: {
            _id: 0,
            period: '$_id',
            revenue: 1
          }
        },
        { $sort: { period: 1 } }
      ]);

      return trends;
    } catch (error) {
      console.error('Error getting revenue trends:', error);
      return [];
    }
  }

  // Get rental status distribution
  static async getRentalStatusStats() {
    try {
      const stats = await Rental.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      return stats.map(stat => ({
        status: stat._id,
        count: stat.count
      }));
    } catch (error) {
      console.error('Error getting rental status stats:', error);
      return [];
    }
  }

  // Get complete analytics report
  static async getAnalyticsReport() {
    try {
      const [dashboardStats, topCategories, topProducts, topCustomers, revenueTrends] = await Promise.all([
        this.getDashboardStats(),
        this.getTopCategories(5),
        this.getTopProducts(5),
        this.getTopCustomers(5),
        this.getRevenueTrends(30)
      ]);

      return {
        dashboardStats,
        topCategories,
        topProducts,
        topCustomers,
        revenueTrends
      };
    } catch (error) {
      console.error('Error getting analytics report:', error);
      return {
        dashboardStats: {
          totalProducts: 0,
          totalRentals: 0,
          activeRentals: 0,
          totalRevenue: 0
        },
        topCategories: [],
        topProducts: [],
        topCustomers: [],
        revenueTrends: []
      };
    }
  }
}
