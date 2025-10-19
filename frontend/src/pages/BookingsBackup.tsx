import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Calendar,
  User,
  Package,
  DollarSign,
  Eye,
  Edit,
  Truck,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2
} from "lucide-react";
import bookingsService, { Booking as ApiBooking } from "@/services/bookingsService";

export default function Bookings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch bookings on component mount
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsService.getBookings({
        page: 1,
        limit: 50,
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter as any : undefined
      });
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      // Fallback to mock data if API fails
      setBookings(mockBookings);
      toast({
        title: "Using Demo Data",
        description: "Connected to demo data while backend is starting up.",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock data as fallback
  const mockBookings: ApiBooking[] = [
    {
      id: 1,
      orderNumber: "BKG-001",
      customerId: 1,
      customer: {
        id: 1,
        name: "Rajesh Kumar",
        email: "rajesh@email.com",
        phone: "+91 9876543210"
      },
      pickupDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      returnDate: new Date(Date.now() + 3 * 86400000).toISOString(), // 3 days from now
      pickupLocation: { address: "Customer Address" },
      returnLocation: { address: "Customer Address" },
      deliveryRequired: false,
      pickupRequired: true,
      subtotal: 6000,
      discountAmount: 0,
      taxAmount: 0,
      deliveryCharges: 0,
      totalAmount: 6000,
      securityDeposit: 2000,
      lateFees: 0,
      damageCharges: 0,
      paymentStatus: "partial",
      advancePaid: 2000,
      balanceAmount: 4000,
      status: "confirmed",
      items: [],
      customerNotes: "Professional photography event",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      orderNumber: "BKG-002",
      customerId: 2,
      customer: {
        id: 2,
        name: "Priya Sharma",
        email: "priya@email.com",
        phone: "+91 9876543211"
      },
      pickupDate: new Date(Date.now() + 7 * 86400000).toISOString(), // 1 week from now
      returnDate: new Date(Date.now() + 8 * 86400000).toISOString(), // 8 days from now
      pickupLocation: { address: "Wedding Venue" },
      returnLocation: { address: "Wedding Venue" },
      deliveryRequired: true,
      pickupRequired: true,
      subtotal: 15000,
      discountAmount: 0,
      taxAmount: 0,
      deliveryCharges: 500,
      totalAmount: 15500,
      securityDeposit: 5000,
      lateFees: 0,
      damageCharges: 0,
      paymentStatus: "pending",
      advancePaid: 0,
      balanceAmount: 15500,
      status: "draft",
      items: [],
      customerNotes: "Wedding decoration package",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const handleSearch = async () => {
    await loadBookings();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-red-100 text-red-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "active":
        return <Package className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "overdue":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer?.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading bookings...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground">Manage rental bookings and orders</p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover">
          <Plus className="w-4 h-4 mr-2" />
          New Booking
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Booking Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {bookings.filter(b => b.status === "draft").length}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {bookings.filter(b => b.status === "confirmed").length}
                </p>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {bookings.filter(b => b.status === "active").length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {bookings.filter(b => b.status === "overdue").length}
                </p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-2xl font-bold text-gray-600">
                  {bookings.filter(b => b.status === "completed").length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="border border-border rounded-lg p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(booking.status)}
                      <div>
                        <h3 className="font-semibold">{booking.orderNumber}</h3>
                        <p className="text-sm text-muted-foreground">{booking.customer?.name}</p>
                      </div>
                    </div>
                    
                    <div className="hidden md:block">
                      <p className="font-medium">Items: {booking.items.length} products</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.pickupDate).toLocaleDateString()} to {new Date(booking.returnDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold">₹{booking.totalAmount.toLocaleString()}</p>
                      <div className="flex space-x-2">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                        <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                          {booking.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      {booking.status === "confirmed" && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Truck className="w-4 h-4 mr-1" />
                          Schedule Pickup
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Mobile view additional info */}
                <div className="md:hidden mt-3 pt-3 border-t border-border">
                  <p className="font-medium">Items: {booking.items.length} products</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(booking.pickupDate).toLocaleDateString()} to {new Date(booking.returnDate).toLocaleDateString()}
                  </p>
                  {booking.actualPickupDate && (
                    <p className="text-sm text-muted-foreground">
                      Pickup: {new Date(booking.actualPickupDate).toLocaleDateString()}
                    </p>
                  )}
                  {booking.actualReturnDate && (
                    <p className="text-sm text-muted-foreground">
                      Return: {new Date(booking.actualReturnDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
}
