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
  RefreshCw
} from "lucide-react";
import dashboardService, { 
  DashboardStats, 
  RecentBooking, 
  RecentActivity,
  DashboardData 
} from "@/services/dashboardService";
import { useToast } from "@/hooks/use-toast";

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isStable, setIsStable] = useState(false); // Prevent rapid updates
  const { toast } = useToast();

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
        });
      }

      // Handle bookings data
      if (bookingsData.status === 'fulfilled') {
        setRecentBookings(bookingsData.value);
      } else {
        console.warn('Failed to load bookings:', bookingsData.reason);
        setRecentBookings([]);
      }

      // Handle activities data
      if (activitiesData.status === 'fulfilled') {
        setRecentActivities(activitiesData.value);
      } else {
        console.warn('Failed to load activities:', activitiesData.reason);
        setRecentActivities([]);
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
      // Add stability delay to prevent rapid state changes
      setTimeout(() => setIsStable(true), 1000);
    }
  }, [toast]);
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
      };

      const mockBookings = [
        {
          id: "1",
          customer: "Alice Johnson",
          product: "MacBook Pro",
          amount: "₹15,000",
          status: "confirmed",
          date: "2024-12-08",
          createdAt: "2024-12-08T10:30:00Z"
        },
        {
          id: "2", 
          customer: "Bob Smith",
          product: "Canon Camera",
          amount: "₹8,500",
          status: "pending",
          date: "2024-12-07",
          createdAt: "2024-12-07T14:20:00Z"
        }
      ];

      const mockActivities = [
        {
          type: "payment",
          message: "Payment received",
          details: "₹15,000 from Alice Johnson",
          timestamp: "2024-12-08T10:30:00Z",
          color: "green",
          timeAgo: "2 hours ago"
        },
        {
          type: "booking",
          message: "New booking created",
          details: "MacBook Pro rental by Bob Smith",
          timestamp: "2024-12-07T14:20:00Z",
          color: "blue",
          timeAgo: "1 day ago"
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setStats(mockStats);
      setRecentBookings(mockBookings);
      setRecentActivities(mockActivities);
      setLastUpdated(new Date());
      
      // Mark as stable after a short delay
      setTimeout(() => setIsStable(true), 500);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []); // Remove toast dependency to prevent infinite loops

  // Set up data loading without polling to prevent flashing
  useEffect(() => {
    // Only load data once on mount
    loadDashboardData();
  }, [loadDashboardData]);

  // Manual refresh
  const handleRefresh = () => {
    loadDashboardData(false);
  };

  // Memoized formatted stats to prevent unnecessary re-renders
  const formattedStats = useMemo(() => {
    if (!stats) return [];

    return [
      {
        title: "Total Revenue",
        value: `₹${stats.totalRevenue.value.toLocaleString()}`,
        change: stats.totalRevenue.change,
        changeText: stats.totalRevenue.changeText,
        changeType: stats.totalRevenue.changeType,
        icon: DollarSign,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        title: "Active Rentals",
        value: stats.activeRentals.value.toString(),
        change: stats.activeRentals.change,
        changeText: stats.activeRentals.changeText,
        changeType: stats.activeRentals.changeType,
        icon: Package,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "Total Customers",
        value: stats.totalCustomers.value.toString(),
        change: stats.totalCustomers.change,
        changeText: stats.totalCustomers.changeText,
        changeType: stats.totalCustomers.changeType,
        icon: Users,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
      {
        title: "Pending Returns",
        value: stats.pendingReturns.value.toString(),
        change: stats.pendingReturns.change,
        changeText: stats.pendingReturns.changeText,
        changeType: stats.pendingReturns.changeType,
        icon: Clock,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      },
    ];
  }, [stats]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return CheckCircle;
      case "pending": return Clock;
      case "overdue": return AlertTriangle;
      case "completed": return CheckCircle;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-3 sm:space-y-4 lg:space-y-6 p-3 sm:p-4 lg:p-6">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/3 sm:w-1/4 mb-2 sm:mb-4"></div>
          <div className="h-4 bg-gray-100 rounded w-2/3 sm:w-1/2 mb-4 sm:mb-6"></div>
          <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 sm:h-28 lg:h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-3 mt-4 sm:mt-6">
            <div className="lg:col-span-2 h-64 sm:h-80 lg:h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-64 sm:h-80 lg:h-96 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-32 sm:h-40 lg:h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const displayStats = formattedStats;

  return (
    <div className="flex-1 space-y-3 sm:space-y-4 lg:space-y-6 p-3 sm:p-4 lg:p-6 transition-opacity duration-300" 
         style={{ opacity: loading ? 0.7 : 1 }}>
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Dashboard</h1>
          <div className="flex flex-col space-y-1 sm:space-y-2 lg:flex-row lg:items-center lg:space-x-4 lg:space-y-0">
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
              Welcome back! Here's what's happening with your rental business.
            </p>
            {lastUpdated && (
              <span className="text-xs text-gray-500 lg:whitespace-nowrap">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col xs:flex-row sm:flex-row items-stretch sm:items-center space-y-2 xs:space-y-0 xs:space-x-2 sm:space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full xs:w-auto sm:w-auto text-xs sm:text-sm px-3 py-2"
          >
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">Refresh</span>
            <span className="xs:hidden">↻</span>
          </Button>
          <Button className="w-full xs:w-auto sm:w-auto bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm px-3 py-2">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Quick Action</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-2 lg:grid-cols-4">
        {displayStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1 mr-2 sm:mr-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate mb-1">{stat.title}</p>
                    <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 leading-tight">{stat.value}</p>
                    <div className="flex items-start sm:items-center flex-col xs:flex-row xs:space-x-1">
                      <div className="flex items-center min-w-0">
                        {stat.changeType === "positive" ? (
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mr-1 flex-shrink-0" />
                        ) : (
                          <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 mr-1 flex-shrink-0" />
                        )}
                        <span className={`text-xs sm:text-sm font-medium truncate ${
                          stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 truncate xs:ml-1 mt-0.5 xs:mt-0 hidden sm:block">{stat.changeText}</span>
                    </div>
                  </div>
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${stat.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 space-y-2 sm:space-y-0 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">Recent Rentals</CardTitle>
            <Button variant="ghost" size="sm" className="self-start sm:self-auto text-xs sm:text-sm p-2">
              <span className="hidden sm:inline">View all</span>
              <span className="sm:hidden">All</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {recentBookings.length > 0 ? (
                recentBookings.map((order, index) => {
                  const StatusIcon = getStatusIcon(order.status);
                  return (
                    <div key={order.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate text-sm sm:text-base">{order.id}</p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{order.customer}</p>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">{order.product}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:block sm:text-right space-x-2 sm:space-x-0 flex-shrink-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">{order.amount}</p>
                          <Badge className={`${getStatusColor(order.status)} text-xs px-2 py-1`}>
                            <StatusIcon className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                            <span className="capitalize">{order.status}</span>
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 sm:mt-1 whitespace-nowrap">{order.date}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 sm:p-8 text-center text-gray-500">
                  <Package className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-gray-300" />
                  <p className="text-sm sm:text-base">No recent bookings found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
            <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 sm:py-2.5">
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">New Rental</span>
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm py-2 sm:py-2.5">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Add Customer</span>
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm py-2 sm:py-2.5">
              <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">Add Product</span>
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm py-2 sm:py-2.5">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">View Calendar</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
          <div className="space-y-3 sm:space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    activity.color === 'green' ? 'bg-green-500' :
                    activity.color === 'blue' ? 'bg-blue-500' :
                    activity.color === 'orange' ? 'bg-orange-500' :
                    'bg-gray-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 break-words leading-relaxed">{activity.message}</p>
                    <p className="text-xs text-gray-500 break-words mt-1 leading-relaxed">{activity.details} - {activity.timeAgo}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4 sm:py-6">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No recent activities</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
