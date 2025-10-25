import { Request, Response } from 'express';

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
  constructor() {}

  async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const limit = parseInt(req.query.limit as string) || 4;

      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const mockRecommendations: RecommendedProduct[] = [
        {
          id: 1,
          name: 'Professional Camera Kit',
          sku: 'PRD-001',
          category: 'Photography',
          baseRentalRate: 1500,
          images: [{ url: 'https://placehold.co/400x300?text=Camera', altText: 'Camera' }],
          matchScore: 95,
          reason: 'Based on your previous photography equipment rentals'
        }
      ];

      res.status(200).json({
        success: true,
        data: { recommendations: mockRecommendations.slice(0, limit), totalCount: mockRecommendations.length }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to get recommendations' });
    }
  }

  async getUsageInsights(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const mockInsights: UsageInsight = {
        totalBookings: 12,
        totalSpent: 45600,
        averageDuration: 4.5,
        favoriteCategory: 'Photography',
        monthlyAverage: 3800,
        memberStatus: 'Gold',
        categoryBreakdown: [
          { category: 'Photography', count: 6, totalAmount: 22000, percentage: 48 }
        ],
        recentTrends: { bookingsGrowth: 15, spendingGrowth: 22 }
      };

      res.status(200).json({ success: true, data: mockInsights });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to get usage insights' });
    }
  }
}

export default new RecommendationController();
