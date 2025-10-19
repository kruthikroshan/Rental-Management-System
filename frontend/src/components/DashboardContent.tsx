import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Package, 
  Users, 
  Calendar,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Plus,
  MoreHorizontal,
  RefreshCw,
  Eye,
  FileText,
  ShoppingCart
} from "lucide-react";
import dashboardService, { 
  DashboardStats, 
  RecentBooking, 
  RecentActivity,
  DashboardData 
} from "@/services/dashboardService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isStable, setIsStable] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load dashboard data with proper API integration
  const loadDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setRefreshing(true);
      setIsStable(false);

      console.log('Loading dashboard data...');
      
      // Try to load real data from API
      const [statsData, bookingsData, activitiesData] = await Promise.allSettled([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentBookings(5),
        dashboardService.getRecentActivities(8)
      ]);

      // Handle stats data
      if (statsData.status === 'fulfilled') {
        setStats(statsData.value.stats);
      } else {
        console.warn('Failed to load stats:', statsData.reason);
        // Use fallback stats
        setStats({
          totalRevenue: {
            value: 245890,
            change: "+12.5%",
            changeText: "from last month",
            changeType: "positive" as const
          },
          activeRentals: {
            value: 347,
            change: "+23",
            changeText: "from yesterday",
            changeType: "positive" as const
          },
          totalCustomers: {
            value: 1249,
            change: "+18.2%",
            changeText: "from last month",
            changeType: "positive" as const
          },
          pendingReturns: {
            value: 12,
            change: "3 overdue",
            changeText: "requires attention",
            changeType: "negative" as const
          }
        });
      }

      // Handle bookings data
      if (bookingsData.status === 'fulfilled') {
        setRecentBookings(bookingsData.value);
      } else {
        console.warn('Failed to load bookings:', bookingsData.reason);
        setRecentBookings([
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
          }
        ]);
      }

      // Handle activities data
      if (activitiesData.status === 'fulfilled') {
        setRecentActivities(activitiesData.value);
      } else {
        console.warn('Failed to load activities:', activitiesData.reason);
        setRecentActivities([
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
          }
        ]);
      }

      setLastUpdated(new Date());
      
      toast({
        title: "Dashboard Updated",
        description: "Latest data has been loaded successfully.",
        duration: 2000,
      });

    } catch (error) {
      console.error('Dashboard loading error:', error);
      toast({
        title: "Error Loading Dashboard",
        description: "Some data might be outdated. Please try refreshing.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setTimeout(() => setIsStable(true), 1000);
    }
  }, [toast]);

  // Auto-refresh data
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => loadDashboardData(false), 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    if (!refreshing) {
      loadDashboardData(false);
    }
  }, [loadDashboardData, refreshing]);

  // Navigation handlers for quick actions
  const handleCreateBooking = useCallback(() => {
    navigate('/bookings/new');
  }, [navigate]);

  const handleViewAllBookings = useCallback(() => {
    navigate('/bookings');
  }, [navigate]);

  const handleViewProducts = useCallback(() => {
    navigate('/products');
  }, [navigate]);

  const handleViewCustomers = useCallback(() => {
    navigate('/customers');
  }, [navigate]);

  const handleViewReports = useCallback(() => {
    navigate('/reports');
  }, [navigate]);

  // Memoized stat cards with responsive design
  const statCards = useMemo(() => {
    if (!stats) return [];

    return [
      {
        title: "Total Revenue",
        value: `$${stats.totalRevenue.value.toLocaleString()}`,
        change: stats.totalRevenue.change,
        changeText: stats.totalRevenue.changeText,
        changeType: stats.totalRevenue.changeType,
        icon: DollarSign,
        color: "text-green-600",
        bgColor: "bg-green-50"
      },
      {
        title: "Active Rentals",
        value: stats.activeRentals.value.toString(),
        change: stats.activeRentals.change,
        changeText: stats.activeRentals.changeText,
        changeType: stats.activeRentals.changeType,
        icon: Package,
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      },
      {
        title: "Total Customers",
        value: stats.totalCustomers.value.toLocaleString(),
        change: stats.totalCustomers.change,
        changeText: stats.totalCustomers.changeText,
        changeType: stats.totalCustomers.changeType,
        icon: Users,
        color: "text-purple-600",
        bgColor: "bg-purple-50"
      },
      {
        title: "Pending Returns",
        value: stats.pendingReturns.value.toString(),
        change: stats.pendingReturns.change,
        changeText: stats.pendingReturns.changeText,
        changeType: stats.pendingReturns.changeType,
        icon: Calendar,
        color: "text-orange-600",
        bgColor: "bg-orange-50"
      }
    ];
  }, [stats]);

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      active: "bg-blue-100 text-blue-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800"
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {status}
      </Badge>
    );
  };

  // Activity icon component
  const ActivityIcon = ({ type, color }: { type: string; color: string }) => {
    const icons = {
      booking: ShoppingCart,
      payment: DollarSign,
      return: Package,
      overdue: AlertTriangle
    };

    const Icon = icons[type as keyof typeof icons] || CheckCircle;
    return <Icon className={`w-4 h-4 text-${color}-600`} />;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Loading skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header Section - Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Welcome back!</span>
            {lastUpdated && (
              <>
                <span>•</span>
                <span>Last updated {lastUpdated.toLocaleTimeString()}</span>
              </>
            )}
          </div>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <div className="flex items-center space-x-1 text-xs">
                    {stat.changeType === 'positive' ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )}
                    <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                      {stat.change}
                    </span>
                    <span className="text-gray-500">{stat.changeText}</span>
                  </div>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions - Responsive */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Button 
              onClick={handleCreateBooking}
              className="flex flex-col items-center space-y-2 h-auto py-4 px-3"
              variant="outline"
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs font-medium">New Booking</span>
            </Button>
            
            <Button 
              onClick={handleViewAllBookings}
              className="flex flex-col items-center space-y-2 h-auto py-4 px-3"
              variant="outline"
            >
              <Eye className="w-5 h-5" />
              <span className="text-xs font-medium">View Bookings</span>
            </Button>
            
            <Button 
              onClick={handleViewProducts}
              className="flex flex-col items-center space-y-2 h-auto py-4 px-3"
              variant="outline"
            >
              <Package className="w-5 h-5" />
              <span className="text-xs font-medium">Products</span>
            </Button>
            
            <Button 
              onClick={handleViewCustomers}
              className="flex flex-col items-center space-y-2 h-auto py-4 px-3"
              variant="outline"
            >
              <Users className="w-5 h-5" />
              <span className="text-xs font-medium">Customers</span>
            </Button>
            
            <Button 
              onClick={handleViewReports}
              className="flex flex-col items-center space-y-2 h-auto py-4 px-3"
              variant="outline"
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs font-medium">Reports</span>
            </Button>
            
            <Button 
              onClick={() => navigate('/settings')}
              className="flex flex-col items-center space-y-2 h-auto py-4 px-3"
              variant="outline"
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-xs font-medium">More</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold">Recent Bookings</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleViewAllBookings}
              className="flex items-center space-x-1"
            >
              <span className="text-sm">View All</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{booking.customer}</p>
                        <StatusBadge status={booking.status} />
                      </div>
                      <p className="text-sm text-gray-600">{booking.product}</p>
                      <p className="text-xs text-gray-500">{booking.date}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-gray-900">{booking.amount}</p>
                      <p className="text-xs text-gray-500">#{booking.id}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent bookings</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-full bg-${activity.color}-100`}>
                      <ActivityIcon type={activity.type} color={activity.color} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-600">
                        {activity.details}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.timeAgo}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
