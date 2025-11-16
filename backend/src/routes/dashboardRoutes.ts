import { Router } from 'express';
import { body } from 'express-validator';
import { DashboardController } from '../controllers/dashboardController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const dashboardController = new DashboardController();

// Test endpoint with mock data (no auth required for testing)
router.get('/stats-mock', (req, res) => {
  const mockStats = {
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

  res.json({
    success: true,
    data: mockStats
  });
});

// Mock recent bookings
router.get('/recent-bookings-mock', (req, res) => {
  const mockBookings = [
    { 
      id: "RNT-001", 
      customer: "Rajesh Kumar", 
      product: "Professional Camera Kit",
      amount: "₹15,000",
      status: "active",
      date: "2025-08-10",
      createdAt: new Date().toISOString()
    },
    { 
      id: "RNT-002", 
      customer: "Priya Sharma", 
      product: "Wedding Decoration Set",
      amount: "₹12,500",
      status: "pending",
      date: "2025-08-11",
      createdAt: new Date().toISOString()
    },
    { 
      id: "RNT-003", 
      customer: "Arjun Singh", 
      product: "Sound System Pro",
      amount: "₹8,000",
      status: "overdue",
      date: "2025-08-09",
      createdAt: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    data: mockBookings
  });
});

// Mock recent activities
router.get('/recent-activities-mock', (req, res) => {
  const mockActivities = [
    {
      type: 'payment',
      message: 'Payment received from Rajesh Kumar',
      details: '₹15,000 for Camera Kit rental',
      timestamp: new Date(),
      color: 'green',
      timeAgo: '2 minutes ago'
    },
    {
      type: 'booking',
      message: 'New booking created',
      details: 'Wedding Decoration Set for Priya Sharma',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      color: 'blue',
      timeAgo: '5 minutes ago'
    },
    {
      type: 'overdue',
      message: 'Return overdue',
      details: 'Sound System Pro from Arjun Singh',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      color: 'orange',
      timeAgo: '1 hour ago'
    }
  ];

  res.json({
    success: true,
    data: mockActivities
  });
});

// Get dashboard statistics (temporarily remove auth for testing)
router.get('/stats', 
  dashboardController.getDashboardStats.bind(dashboardController)
);

// Get recent bookings (temporarily remove auth for testing)
router.get('/recent-bookings',
  dashboardController.getRecentBookings.bind(dashboardController)
);

// Get recent activities (temporarily remove auth for testing)
router.get('/recent-activities',
  dashboardController.getRecentActivities.bind(dashboardController)
);

// Get revenue chart data
router.get('/revenue-chart', (req, res) => {
  const { range = '7days' } = req.query;
  
  // Generate mock revenue data based on range
  const days = range === '7days' ? 7 : range === '30days' ? 30 : 90;
  const chartData: Array<{ date: string; revenue: number }> = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const revenue = Math.floor(Math.random() * 20000) + 10000; // Random revenue between 10k-30k
    
    chartData.push({
      date: date.toISOString().split('T')[0],
      revenue: revenue
    });
  }
  
  res.json({
    success: true,
    data: chartData
  });
});

export default router;
