// Dashboard API Service
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token'); // Use correct token key
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token'); // Use correct token key
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface DashboardStats {
  totalRevenue: {
    value: number;
    change: string;
    changeText: string;
    changeType: 'positive' | 'negative';
  };
  activeRentals: {
    value: number;
    change: string;
    changeText: string;
    changeType: 'positive' | 'negative';
  };
  totalCustomers: {
    value: number;
    change: string;
    changeText: string;
    changeType: 'positive' | 'negative';
  };
  pendingReturns: {
    value: number;
    change: string;
    changeText: string;
    changeType: 'positive' | 'negative';
  };
}

export interface RecentBooking {
  id: string;
  customer: string;
  product: string;
  amount: string;
  status: string;
  date: string;
  createdAt: string;
}

export interface RecentActivity {
  type: string;
  message: string;
  details: string;
  timestamp: string;
  color: string;
  timeAgo: string;
}

export interface PopularProduct {
  name: string;
  bookings: number;
  revenue: number;
}

export interface ChartData {
  date: string;
  revenue: number;
}

export interface DashboardData {
  stats: DashboardStats;
  popularProducts: PopularProduct[];
  revenueChart: ChartData[];
}

class DashboardService {
  // Get dashboard statistics
  async getDashboardStats(period = '30'): Promise<DashboardData> {
    try {
      const response = await api.get(`/dashboard/stats?period=${period}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Fallback to mock data if real API fails
      console.log('Using fallback mock data for dashboard stats');
      return this.getMockDashboardData();
    }
  }

  // Get recent bookings
  async getRecentBookings(limit = 10): Promise<RecentBooking[]> {
    try {
      const response = await api.get(`/dashboard/recent-bookings?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
      // Fallback to mock data
      console.log('Using fallback mock data for recent bookings');
      return this.getMockRecentBookings();
    }
  }

  // Get recent activities
  async getRecentActivities(limit = 10): Promise<RecentActivity[]> {
    try {
      const response = await api.get(`/dashboard/recent-activities?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      // Fallback to mock data
      console.log('Using fallback mock data for recent activities');
      return this.getMockRecentActivities();
    }
  }

  // Mock data fallbacks
  private getMockDashboardData(): DashboardData {
    return {
      stats: {
        totalRevenue: {
          value: 245890,
          change: "+12.5%",
          changeText: "from last month",
          changeType: "positive"
        },
        activeRentals: {
          value: 347,
          change: "+23",
          changeText: "from yesterday",
          changeType: "positive"
        },
        totalCustomers: {
          value: 1249,
          change: "+18.2%",
          changeText: "from last month",
          changeType: "positive"
        },
        pendingReturns: {
          value: 12,
          change: "3 overdue",
          changeText: "requires attention",
          changeType: "negative"
        }
      },
      popularProducts: [
        { name: "Professional Camera Kit", bookings: 15, revenue: 75000 },
        { name: "Wedding Decoration Set", bookings: 12, revenue: 60000 },
        { name: "Sound System Pro", bookings: 8, revenue: 32000 }
      ],
      revenueChart: [
        { date: "2025-08-05", revenue: 12000 },
        { date: "2025-08-06", revenue: 15000 },
        { date: "2025-08-07", revenue: 18000 },
        { date: "2025-08-08", revenue: 14000 },
        { date: "2025-08-09", revenue: 22000 },
        { date: "2025-08-10", revenue: 25000 },
        { date: "2025-08-11", revenue: 28000 }
      ]
    };
  }

  private getMockRecentBookings(): RecentBooking[] {
    return [
      {
        id: "BO-001",
        customer: "John Smith",
        product: "Canon EOS R5 Camera",
        amount: "$525.00",
        status: "confirmed",
        date: "2025-08-12",
        createdAt: "2025-08-12T10:30:00Z"
      },
      {
        id: "BO-002",
        customer: "Sarah Johnson",
        product: "MacBook Pro 14\"",
        amount: "$250.00",
        status: "pending",
        date: "2025-08-12",
        createdAt: "2025-08-12T09:15:00Z"
      },
      {
        id: "BO-003",
        customer: "Mike Davis",
        product: "Executive Office Chair",
        amount: "$80.00",
        status: "active",
        date: "2025-08-11",
        createdAt: "2025-08-11T14:20:00Z"
      }
    ];
  }

  private getMockRecentActivities(): RecentActivity[] {
    return [
      {
        type: "booking",
        message: "New booking created",
        details: "Canon EOS R5 Camera by John Smith",
        timestamp: "2025-08-12T10:30:00Z",
        color: "blue",
        timeAgo: "30 minutes ago"
      },
      {
        type: "payment",
        message: "Payment received",
        details: "$525.00 for booking BO-001",
        timestamp: "2025-08-12T10:45:00Z",
        color: "green",
        timeAgo: "15 minutes ago"
      },
      {
        type: "return",
        message: "Equipment returned",
        details: "BMW X3 SUV returned by Sarah Johnson",
        timestamp: "2025-08-12T09:00:00Z",
        color: "purple",
        timeAgo: "2 hours ago"
      },
      {
        type: "overdue",
        message: "Overdue return alert",
        details: "iPad Pro 12.9\" should have been returned yesterday",
        timestamp: "2025-08-12T08:00:00Z",
        color: "red",
        timeAgo: "3 hours ago"
      }
    ];
  }

  // Real-time data polling
  startPolling(
    callback: (data: {
      stats: DashboardData;
      bookings: RecentBooking[];
      activities: RecentActivity[];
    }) => void,
    interval = 30000 // 30 seconds
  ): NodeJS.Timeout {
    const poll = async () => {
      try {
        const [stats, bookings, activities] = await Promise.all([
          this.getDashboardStats(),
          this.getRecentBookings(),
          this.getRecentActivities()
        ]);

        callback({ stats, bookings, activities });
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // Initial load
    poll();

    // Set up polling interval
    return setInterval(poll, interval);
  }

  stopPolling(intervalId: NodeJS.Timeout): void {
    clearInterval(intervalId);
  }
}

export default new DashboardService();
