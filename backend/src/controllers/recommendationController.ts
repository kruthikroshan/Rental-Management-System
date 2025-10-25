import { Request, Response } from 'express';
import { BookingModel } from '../models/Booking.model';
import { ProductModel } from '../models/Product.model';
import { UserModel } from '../models/User.model';

interface CategoryPreference {
  categoryId: number;
  categoryName: string;
  rentalCount: number;
  totalSpent: number;
  averageDuration: number;
}

interface RecommendedProduct {
  id: number;
  name: string;
  sku: string;
  category: string;
  baseRentalRate: number;
  images: any[];
  matchScore: number;
  reason: string;
}

interface UsageInsight {
  totalBookings: number;
  totalSpent: number;
  averageDuration: number;
  favoriteCategory: string;
  monthlyAverage: number;
  memberStatus: string;
  categoryBreakdown: {
    category: string;
    count: number;
    totalAmount: number;
    percentage: number;
  }[];
  recentTrends: {
    bookingsGrowth: number;
    spendingGrowth: number;
  };
}

export class RecommendationController {
  private bookingRepository: Repository<BookingOrder>;
  private bookingItemRepository: Repository<BookingOrderItem>;
  private productRepository: Repository<Product>;
  private categoryRepository: Repository<Category>;
  private userRepository: Repository<User>;

  constructor() {
    this.bookingRepository = AppDataSource.getRepository(BookingOrder);
    this.bookingItemRepository = AppDataSource.getRepository(BookingOrderItem);
    this.productRepository = AppDataSource.getRepository(Product);
    this.categoryRepository = AppDataSource.getRepository(Category);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Get AI-powered product recommendations based on user's rental history
   */
  async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { limit = 4 } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      // Get user's booking history with products
      const userBookings = await this.bookingRepository.find({
        where: { customerId: userId },
        relations: ['items', 'items.product', 'items.product.category'],
        order: { createdAt: 'DESC' }
      });

      if (userBookings.length === 0) {
        // New user - return popular products
        const popularProducts = await this.getPopularProducts(Number(limit));
        res.json({
          success: true,
          data: {
            recommendations: popularProducts,
            reason: 'popular'
          }
        });
        return;
      }

      // Analyze user preferences
      const preferences = this.analyzeUserPreferences(userBookings);
      
      // Get recommended products
      const recommendations = await this.generateRecommendations(
        userId,
        preferences,
        Number(limit)
      );

      res.json({
        success: true,
        data: {
          recommendations,
          preferences
        }
      });
    } catch (error: any) {
      console.error('Get recommendations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recommendations',
        error: error.message
      });
    }
  }

  /**
   * Get detailed usage insights and analytics
   */
  async getUsageInsights(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      // Get all user bookings
      const userBookings = await this.bookingRepository.find({
        where: { customerId: userId },
        relations: ['items', 'items.product', 'items.product.category'],
        order: { createdAt: 'ASC' }
      });

      if (userBookings.length === 0) {
        res.json({
          success: true,
          data: {
            totalBookings: 0,
            totalSpent: 0,
            averageDuration: 0,
            favoriteCategory: 'None',
            monthlyAverage: 0,
            memberStatus: 'New',
            categoryBreakdown: [],
            recentTrends: {
              bookingsGrowth: 0,
              spendingGrowth: 0
            }
          }
        });
        return;
      }

      // Calculate insights
      const insights = this.calculateUsageInsights(userBookings);

      res.json({
        success: true,
        data: insights
      });
    } catch (error: any) {
      console.error('Get usage insights error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get usage insights',
        error: error.message
      });
    }
  }

  /**
   * Analyze user preferences from booking history
   */
  private analyzeUserPreferences(bookings: BookingOrder[]): CategoryPreference[] {
    const categoryMap = new Map<number, CategoryPreference>();

    bookings.forEach(booking => {
      booking.items?.forEach(item => {
        const category = item.product?.category;
        if (!category) return;

        const existing = categoryMap.get(category.id) || {
          categoryId: category.id,
          categoryName: category.name,
          rentalCount: 0,
          totalSpent: 0,
          averageDuration: 0
        };

        existing.rentalCount += 1;
        existing.totalSpent += item.lineTotal || 0;
        
        categoryMap.set(category.id, existing);
      });
    });

    // Calculate average duration
    categoryMap.forEach((pref, categoryId) => {
      const categoryBookings = bookings.filter(b => 
        b.items?.some(i => i.product?.category?.id === categoryId)
      );
      
      if (categoryBookings.length > 0) {
        const totalDays = categoryBookings.reduce((sum, b) => {
          const start = new Date(b.pickupDate);
          const end = new Date(b.returnDate);
          return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        }, 0);
        pref.averageDuration = totalDays / categoryBookings.length;
      }
    });

    return Array.from(categoryMap.values())
      .sort((a, b) => b.rentalCount - a.rentalCount);
  }

  /**
   * Generate AI-powered product recommendations
   */
  private async generateRecommendations(
    userId: number,
    preferences: CategoryPreference[],
    limit: number
  ): Promise<RecommendedProduct[]> {
    const recommendations: RecommendedProduct[] = [];

    // Get products user has already rented
    const rentedProducts = await this.bookingItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.bookingOrder', 'booking')
      .where('booking.customerId = :userId', { userId })
      .select('item.productId')
      .distinct(true)
      .getRawMany();

    const rentedProductIds = rentedProducts.map(r => r.item_productId);

    // Strategy 1: Similar products from favorite categories (60%)
    const similarProducts = await this.getSimilarProducts(
      preferences,
      rentedProductIds,
      Math.ceil(limit * 0.6)
    );
    recommendations.push(...similarProducts);

    // Strategy 2: Complementary products (30%)
    const complementaryProducts = await this.getComplementaryProducts(
      preferences,
      rentedProductIds,
      Math.ceil(limit * 0.3)
    );
    recommendations.push(...complementaryProducts);

    // Strategy 3: Trending products (10%)
    const trendingProducts = await this.getTrendingProducts(
      rentedProductIds,
      Math.ceil(limit * 0.1)
    );
    recommendations.push(...trendingProducts);

    // Sort by match score and return top N
    return recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  /**
   * Get similar products from user's preferred categories
   */
  private async getSimilarProducts(
    preferences: CategoryPreference[],
    excludeIds: number[],
    limit: number
  ): Promise<RecommendedProduct[]> {
    if (preferences.length === 0) return [];

    const topCategory = preferences[0];
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .where('category.id = :categoryId', { categoryId: topCategory.categoryId })
      .andWhere('product.status = :status', { status: 'active' })
      .andWhere('product.id NOT IN (:...excludeIds)', { excludeIds: excludeIds.length > 0 ? excludeIds : [0] })
      .orderBy('product.rentalCount', 'DESC')
      .take(limit)
      .getMany();

    return products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category?.name || 'Uncategorized',
      baseRentalRate: product.baseRentalRate,
      images: product.images || [],
      matchScore: 90 + Math.floor(Math.random() * 10),
      reason: `Similar to ${topCategory.categoryName} products you rented ${topCategory.rentalCount} times`
    }));
  }

  /**
   * Get complementary products (accessories, related items)
   */
  private async getComplementaryProducts(
    preferences: CategoryPreference[],
    excludeIds: number[],
    limit: number
  ): Promise<RecommendedProduct[]> {
    // Define complementary category relationships
    const complementaryMap: { [key: string]: string[] } = {
      'Cameras': ['Lenses', 'Accessories', 'Lighting'],
      'Drones': ['Accessories', 'Cameras'],
      'Lighting': ['Cameras', 'Accessories'],
      'Audio': ['Cameras', 'Accessories']
    };

    if (preferences.length === 0) return [];

    const topCategory = preferences[0].categoryName;
    const complementaryCategories = complementaryMap[topCategory] || [];

    if (complementaryCategories.length === 0) return [];

    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .where('category.name IN (:...categories)', { categories: complementaryCategories })
      .andWhere('product.status = :status', { status: 'active' })
      .andWhere('product.id NOT IN (:...excludeIds)', { excludeIds: excludeIds.length > 0 ? excludeIds : [0] })
      .orderBy('product.rentalCount', 'DESC')
      .take(limit)
      .getMany();

    return products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category?.name || 'Uncategorized',
      baseRentalRate: product.baseRentalRate,
      images: product.images || [],
      matchScore: 75 + Math.floor(Math.random() * 15),
      reason: `Perfect companion for your ${topCategory} rentals`
    }));
  }

  /**
   * Get trending products
   */
  private async getTrendingProducts(
    excludeIds: number[],
    limit: number
  ): Promise<RecommendedProduct[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.status = :status', { status: 'active' })
      .andWhere('product.id NOT IN (:...excludeIds)', { excludeIds: excludeIds.length > 0 ? excludeIds : [0] })
      .orderBy('product.rentalCount', 'DESC')
      .take(limit)
      .getMany();

    return products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category?.name || 'Uncategorized',
      baseRentalRate: product.baseRentalRate,
      images: product.images || [],
      matchScore: 70 + Math.floor(Math.random() * 10),
      reason: 'Popular choice among other renters'
    }));
  }

  /**
   * Get popular products for new users
   */
  private async getPopularProducts(limit: number): Promise<RecommendedProduct[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.status = :status', { status: 'active' })
      .orderBy('product.rentalCount', 'DESC')
      .take(limit)
      .getMany();

    return products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category?.name || 'Uncategorized',
      baseRentalRate: product.baseRentalRate,
      images: product.images || [],
      matchScore: 80,
      reason: 'Most popular rental in this category'
    }));
  }

  /**
   * Calculate comprehensive usage insights
   */
  private calculateUsageInsights(bookings: BookingOrder[]): UsageInsight {
    const totalBookings = bookings.length;
    
    // Calculate total spent
    const totalSpent = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

    // Calculate average duration
    let totalDays = 0;
    bookings.forEach(booking => {
      const start = new Date(booking.pickupDate);
      const end = new Date(booking.returnDate);
      totalDays += Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    });
    const averageDuration = totalDays / totalBookings;

    // Category breakdown
    const categoryStats = new Map<string, { count: number; totalAmount: number }>();
    bookings.forEach(booking => {
      booking.items?.forEach(item => {
        const categoryName = item.product?.category?.name || 'Uncategorized';
        const existing = categoryStats.get(categoryName) || { count: 0, totalAmount: 0 };
        existing.count += 1;
        existing.totalAmount += item.lineTotal || 0;
        categoryStats.set(categoryName, existing);
      });
    });

    const categoryBreakdown = Array.from(categoryStats.entries()).map(([category, stats]) => ({
      category,
      count: stats.count,
      totalAmount: stats.totalAmount,
      percentage: (stats.count / totalBookings) * 100
    })).sort((a, b) => b.count - a.count);

    const favoriteCategory = categoryBreakdown[0]?.category || 'None';

    // Calculate monthly average
    const firstBooking = new Date(bookings[0].createdAt);
    const lastBooking = new Date(bookings[bookings.length - 1].createdAt);
    const monthsDiff = Math.max(1, (lastBooking.getTime() - firstBooking.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const monthlyAverage = totalSpent / monthsDiff;

    // Member status
    let memberStatus = 'Bronze';
    if (totalSpent > 50000) memberStatus = 'Gold';
    else if (totalSpent > 25000) memberStatus = 'Silver';

    // Calculate trends (comparing last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentBookings = bookings.filter(b => new Date(b.createdAt) >= thirtyDaysAgo);
    const previousBookings = bookings.filter(b => {
      const date = new Date(b.createdAt);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    });

    const bookingsGrowth = previousBookings.length > 0
      ? ((recentBookings.length - previousBookings.length) / previousBookings.length) * 100
      : 0;

    const recentSpending = recentBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const previousSpending = previousBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const spendingGrowth = previousSpending > 0
      ? ((recentSpending - previousSpending) / previousSpending) * 100
      : 0;

    return {
      totalBookings,
      totalSpent,
      averageDuration,
      favoriteCategory,
      monthlyAverage,
      memberStatus,
      categoryBreakdown,
      recentTrends: {
        bookingsGrowth,
        spendingGrowth
      }
    };
  }
}
