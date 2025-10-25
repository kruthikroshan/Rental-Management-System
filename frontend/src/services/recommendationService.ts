import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface RecommendedProduct {
  id: number;
  name: string;
  sku: string;
  category: string;
  baseRentalRate: number;
  images: any[];
  matchScore: number;
  reason: string;
}

export interface UsageInsight {
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

const recommendationService = {
  /**
   * Get AI-powered product recommendations
   */
  async getRecommendations(limit: number = 4): Promise<RecommendedProduct[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/recommendations`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: { limit }
      });
      
      return response.data.data.recommendations;
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch recommendations');
    }
  },

  /**
   * Get usage insights and analytics
   */
  async getUsageInsights(): Promise<UsageInsight> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/recommendations/usage-insights`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching usage insights:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch usage insights');
    }
  }
};

export default recommendationService;
