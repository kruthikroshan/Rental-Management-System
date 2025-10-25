import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  Star,
  Sparkles,
  BarChart3,
  ShoppingCart,
  ArrowRight,
  Target,
  Award,
  Zap
} from "lucide-react";

interface BookingHistory {
  id: number;
  productName: string;
  productImage: string;
  category: string;
  rentalDate: string;
  duration: number;
  amount: number;
  status: string;
}

interface RecommendedProduct {
  id: number;
  name: string;
  image: string;
  category: string;
  baseRentalRate: number;
  matchScore: number;
  reason: string;
}

interface UsageInsight {
  icon: any;
  title: string;
  value: string;
  description: string;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  color: string;
  bgColor: string;
}

export default function UserProfile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Mock booking history (replace with actual API call)
  const [bookingHistory, setBookingHistory] = useState<BookingHistory[]>([
    {
      id: 1,
      productName: "Canon EOS R5",
      productImage: "/api/placeholder/100/100",
      category: "Cameras",
      rentalDate: "2025-10-15",
      duration: 3,
      amount: 15000,
      status: "completed"
    },
    {
      id: 2,
      productName: "DJI Mavic 3 Pro",
      productImage: "/api/placeholder/100/100",
      category: "Drones",
      rentalDate: "2025-09-28",
      duration: 2,
      amount: 12000,
      status: "completed"
    },
    {
      id: 3,
      productName: "Sony A7 IV",
      productImage: "/api/placeholder/100/100",
      category: "Cameras",
      rentalDate: "2025-09-10",
      duration: 5,
      amount: 22500,
      status: "completed"
    },
    {
      id: 4,
      productName: "Tripod Carbon Fiber",
      productImage: "/api/placeholder/100/100",
      category: "Accessories",
      rentalDate: "2025-08-20",
      duration: 4,
      amount: 3200,
      status: "completed"
    },
    {
      id: 5,
      productName: "Godox AD600 Pro",
      productImage: "/api/placeholder/100/100",
      category: "Lighting",
      rentalDate: "2025-08-05",
      duration: 3,
      amount: 9000,
      status: "completed"
    }
  ]);

  // AI-Powered Recommended Products
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([
    {
      id: 101,
      name: "Nikon Z9",
      image: "/api/placeholder/120/120",
      category: "Cameras",
      baseRentalRate: 5500,
      matchScore: 95,
      reason: "Similar to Canon EOS R5 you rented 3 times"
    },
    {
      id: 102,
      name: "Professional Gimbal Stabilizer",
      image: "/api/placeholder/120/120",
      category: "Accessories",
      baseRentalRate: 2500,
      matchScore: 88,
      reason: "Perfect companion for your drone rentals"
    },
    {
      id: 103,
      name: "Sigma 24-70mm f/2.8 Lens",
      image: "/api/placeholder/120/120",
      category: "Lenses",
      baseRentalRate: 3000,
      matchScore: 85,
      reason: "Complements your camera rentals"
    },
    {
      id: 104,
      name: "Wireless Microphone System",
      image: "/api/placeholder/120/120",
      category: "Audio",
      baseRentalRate: 1800,
      matchScore: 78,
      reason: "Users who rent cameras also rent audio equipment"
    }
  ]);

  // Calculate usage insights
  const calculateUsageInsights = (): UsageInsight[] => {
    const totalSpent = bookingHistory.reduce((sum, booking) => sum + booking.amount, 0);
    const totalBookings = bookingHistory.length;
    const averageDuration = bookingHistory.reduce((sum, booking) => sum + booking.duration, 0) / totalBookings;
    
    // Category analysis
    const categoryCount: { [key: string]: number } = {};
    bookingHistory.forEach(booking => {
      categoryCount[booking.category] = (categoryCount[booking.category] || 0) + 1;
    });
    const mostRentedCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];

    // Calculate monthly average
    const uniqueMonths = new Set(bookingHistory.map(b => b.rentalDate.substring(0, 7))).size;
    const monthlyAverage = totalSpent / (uniqueMonths || 1);

    return [
      {
        icon: DollarSign,
        title: "Total Spending",
        value: `₹${totalSpent.toLocaleString()}`,
        description: "Lifetime rental spending",
        trend: "+12%",
        trendType: "up",
        color: "text-green-600",
        bgColor: "bg-green-50"
      },
      {
        icon: Package,
        title: "Total Bookings",
        value: totalBookings.toString(),
        description: "Products rented",
        trend: "+3",
        trendType: "up",
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      },
      {
        icon: Clock,
        title: "Avg. Rental Duration",
        value: `${averageDuration.toFixed(1)} days`,
        description: "Average booking period",
        trend: "0.5 days",
        trendType: "neutral",
        color: "text-purple-600",
        bgColor: "bg-purple-50"
      },
      {
        icon: Star,
        title: "Favorite Category",
        value: mostRentedCategory[0],
        description: `${mostRentedCategory[1]} rentals in this category`,
        color: "text-orange-600",
        bgColor: "bg-orange-50"
      },
      {
        icon: TrendingUp,
        title: "Monthly Average",
        value: `₹${Math.round(monthlyAverage).toLocaleString()}`,
        description: "Average monthly spending",
        trend: "+8%",
        trendType: "up",
        color: "text-indigo-600",
        bgColor: "bg-indigo-50"
      },
      {
        icon: Award,
        title: "Member Status",
        value: totalSpent > 50000 ? "Gold" : totalSpent > 25000 ? "Silver" : "Bronze",
        description: "Loyalty tier status",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50"
      }
    ];
  };

  const usageInsights = calculateUsageInsights();

  const handleLogout = () => {
    logout();
  };

  const handleViewProduct = (productId: number) => {
    toast({
      title: "Viewing Product",
      description: "Redirecting to product details..."
    });
    // Navigate to product detail page
    window.location.href = `/products?id=${productId}`;
  };

  const handleRentRecommended = (product: RecommendedProduct) => {
    toast({
      title: "Quick Rent",
      description: `Adding ${product.name} to cart...`,
      duration: 2000
    });
    // Add to cart logic
    setTimeout(() => {
      window.location.href = '/products';
    }, 1000);
  };

  return (
    <Layout onLogout={handleLogout} user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">View your rental history and personalized recommendations</p>
          </div>
          <Button onClick={() => window.location.href = '/settings'}>
            <User className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* User Info Card */}
        <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
                <User className="w-12 h-12 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{user?.name || 'User Name'}</h2>
                <div className="space-y-1 mt-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email || 'user@example.com'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{user?.phone || '+91 98765 43210'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-white text-purple-600 px-4 py-2 text-lg">
                  {usageInsights.find(i => i.title === "Member Status")?.value} Member
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Insights Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Usage Insights</h2>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usageInsights.map((insight, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${insight.bgColor}`}>
                      <insight.icon className={`w-6 h-6 ${insight.color}`} />
                    </div>
                    {insight.trend && (
                      <Badge variant={insight.trendType === 'up' ? 'default' : 'secondary'}>
                        {insight.trend}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">{insight.title}</p>
                    <p className={`text-2xl font-bold mt-1 ${insight.color}`}>{insight.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{insight.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Recommendations Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Smart Recommendations</h2>
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                AI-Powered
              </Badge>
            </div>
            <Button variant="ghost" onClick={() => window.location.href = '/products'}>
              View All Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <p className="text-gray-600 mb-6">
            Based on your rental history and preferences, we think you'll love these:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((product) => (
              <Card key={product.id} className="hover:shadow-xl transition-all group cursor-pointer">
                <CardContent className="p-4">
                  {/* Match Score Badge */}
                  <div className="relative mb-3">
                    <div className="aspect-square rounded-lg bg-gray-100 overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <Badge className="absolute top-2 right-2 bg-green-500">
                      <Target className="w-3 h-3 mr-1" />
                      {product.matchScore}% Match
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                    <h3 className="font-bold text-gray-900 line-clamp-2">{product.name}</h3>
                    
                    {/* AI Reason */}
                    <div className="flex items-start gap-2 bg-purple-50 p-2 rounded-lg">
                      <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-purple-900">{product.reason}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <p className="text-xs text-gray-500">From</p>
                        <p className="text-lg font-bold text-gray-900">₹{product.baseRentalRate}/day</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleRentRecommended(product)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Rent
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Booking History Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" />
                Recent Rental History
              </CardTitle>
              <Button variant="outline" onClick={() => window.location.href = '/bookings'}>
                View All Bookings
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookingHistory.slice(0, 5).map((booking) => (
                <div 
                  key={booking.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-white overflow-hidden">
                      <img 
                        src={booking.productImage} 
                        alt={booking.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{booking.productName}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {booking.category}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(booking.rentalDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {booking.duration} days
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{booking.amount.toLocaleString()}</p>
                    <Badge className="mt-1 bg-green-100 text-green-800">
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              Rental Categories Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const categoryStats: { [key: string]: { count: number; total: number } } = {};
                bookingHistory.forEach(booking => {
                  if (!categoryStats[booking.category]) {
                    categoryStats[booking.category] = { count: 0, total: 0 };
                  }
                  categoryStats[booking.category].count += 1;
                  categoryStats[booking.category].total += booking.amount;
                });

                const totalBookings = bookingHistory.length;

                return Object.entries(categoryStats).map(([category, stats]) => {
                  const percentage = (stats.count / totalBookings) * 100;
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-900">{category}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-gray-900">{stats.count} rentals</span>
                          <span className="text-sm text-gray-500 ml-2">₹{stats.total.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of total rentals</p>
                    </div>
                  );
                });
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
