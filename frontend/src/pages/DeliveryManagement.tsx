import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Truck, 
  Calendar,
  MapPin,
  User,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  Phone,
  Eye,
  Edit,
  Filter,
  ArrowUpDown,
  Navigation,
  Mail,
  Loader2,
  RotateCcw
} from "lucide-react";
import deliveryService, { DeliveryRecord as ApiDeliveryRecord } from "@/services/deliveryService";

// Mock data for development
const mockDeliveries: ApiDeliveryRecord[] = [
  {
    id: 1,
    bookingId: 101,
    customerName: "John Smith",
    customerEmail: "john.smith@email.com",
    deliveryType: "both",
    status: "scheduled",
    scheduledDate: "2025-08-15T10:00:00Z",
    deliveryAddress: {
      id: 1,
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA"
    },
    returnAddress: {
      id: 2,
      street: "456 Oak Ave",
      city: "New York",
      state: "NY",
      zipCode: "10002",
      country: "USA"
    },
    notes: "Handle with care - fragile equipment",
    items: [
      {
        productId: 1,
        productName: "Professional Camera Kit",
        quantity: 1,
        condition: "excellent"
      },
      {
        productId: 2,
        productName: "Tripod Stand",
        quantity: 2,
        condition: "good"
      }
    ],
    deliveryFee: 25.00,
    totalAmount: 850.00,
    createdAt: "2025-08-10T09:00:00Z",
    updatedAt: "2025-08-10T09:00:00Z"
  },
  {
    id: 2,
    bookingId: 102,
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@email.com",
    deliveryType: "delivery",
    status: "in_transit",
    scheduledDate: "2025-08-13T14:00:00Z",
    actualDate: "2025-08-13T14:30:00Z",
    deliveryAddress: {
      id: 3,
      street: "789 Pine St",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "USA"
    },
    items: [
      {
        productId: 3,
        productName: "Sound System",
        quantity: 1,
        condition: "excellent"
      }
    ],
    deliveryFee: 35.00,
    totalAmount: 420.00,
    createdAt: "2025-08-09T11:00:00Z",
    updatedAt: "2025-08-13T14:30:00Z"
  },
  {
    id: 3,
    bookingId: 103,
    customerName: "Mike Chen",
    customerEmail: "mike.chen@email.com",
    deliveryType: "pickup",
    status: "delivered",
    scheduledDate: "2025-08-12T16:00:00Z",
    actualDate: "2025-08-12T15:45:00Z",
    notes: "Customer pickup - ID verified",
    items: [
      {
        productId: 4,
        productName: "Laptop Computer",
        quantity: 3,
        condition: "excellent"
      }
    ],
    deliveryFee: 0.00,
    totalAmount: 1200.00,
    createdAt: "2025-08-08T13:00:00Z",
    updatedAt: "2025-08-12T15:45:00Z"
  }
];

const DeliveryManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [deliveries, setDeliveries] = useState<ApiDeliveryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<ApiDeliveryRecord | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch deliveries on component mount
  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const response = await deliveryService.getDeliveries({
        page: 1,
        limit: 50,
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter as any : undefined,
        deliveryType: typeFilter !== "all" ? typeFilter as any : undefined
      });
      setDeliveries(response.data.deliveries);
    } catch (error) {
      console.error('Error loading deliveries:', error);
      // Fallback to mock data if API fails
      setDeliveries(mockDeliveries);
      toast({
        title: "Using Demo Data",
        description: "Connected to demo data while backend is starting up.",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from deliveries
  const stats = {
    scheduled: deliveries.filter(d => d.status === 'scheduled').length,
    inTransit: deliveries.filter(d => d.status === 'in_transit').length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    pending: deliveries.filter(d => d.status === 'pending').length,
  };

  const handleStatusUpdate = async (id: number, newStatus: ApiDeliveryRecord['status']) => {
    try {
      await deliveryService.updateDeliveryStatus(id, newStatus);
      setDeliveries(deliveries.map(d => 
        d.id === id ? { ...d, status: newStatus, updatedAt: new Date().toISOString() } : d
      ));
      toast({
        title: "Status Updated",
        description: `Delivery status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update delivery status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", className: "bg-gray-100 text-gray-800" },
      scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-800" },
      in_transit: { label: "In Transit", className: "bg-yellow-100 text-yellow-800" },
      delivered: { label: "Delivered", className: "bg-green-100 text-green-800" },
      returned: { label: "Returned", className: "bg-purple-100 text-purple-800" },
      cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-gray-500" />;
      case "scheduled":
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case "in_transit":
        return <Truck className="w-4 h-4 text-yellow-500" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "returned":
        return <RotateCcw className="w-4 h-4 text-purple-500" />;
      case "cancelled":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "pickup":
        return <Package className="w-4 h-4 text-green-600" />;
      case "delivery":
        return <Truck className="w-4 h-4 text-blue-600" />;
      case "both":
        return <MapPin className="w-4 h-4 text-purple-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.bookingId.toString().includes(searchTerm.toLowerCase()) ||
      delivery.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || delivery.status === statusFilter;
    const matchesType = typeFilter === "all" || delivery.deliveryType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <Layout>
      <div className="flex-1 space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Delivery Management</h2>
            <p className="text-muted-foreground">
              Manage pickup and delivery logistics
            </p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Delivery
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scheduled}</div>
              <p className="text-xs text-muted-foreground">Upcoming deliveries</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inTransit}</div>
              <p className="text-xs text-muted-foreground">Currently being delivered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.delivered}</div>
              <p className="text-xs text-muted-foreground">Successfully completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting schedule</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search deliveries by customer, product, or booking ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="pickup">Pickup Only</SelectItem>
                  <SelectItem value="delivery">Delivery Only</SelectItem>
                  <SelectItem value="both">Pickup & Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Deliveries List */}
        <Card>
          <CardHeader>
            <CardTitle>Deliveries ({filteredDeliveries.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : filteredDeliveries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No deliveries found
                </div>
              ) : (
                filteredDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold">#{delivery.id}</span>
                        {getTypeIcon(delivery.deliveryType)}
                        <Badge variant={delivery.deliveryType === "pickup" ? "default" : "secondary"}>
                          {delivery.deliveryType.charAt(0).toUpperCase() + delivery.deliveryType.slice(1)}
                        </Badge>
                        {getStatusIcon(delivery.status)}
                        {getStatusBadge(delivery.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center space-x-2 text-sm">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{delivery.customerName}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                            <Mail className="w-4 h-4" />
                            <span>{delivery.customerEmail}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">
                              {delivery.deliveryAddress?.street}, {delivery.deliveryAddress?.city}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Package className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                              {delivery.items.length} item{delivery.items.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {delivery.scheduledDate ? 
                                new Date(delivery.scheduledDate).toLocaleDateString() : 
                                'Not scheduled'
                              }
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Total: ${delivery.totalAmount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      {delivery.notes && (
                        <p className="text-sm text-muted-foreground italic">
                          Note: {delivery.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Update Status
                      </Button>
                      {delivery.status === "cancelled" && (
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleStatusUpdate(delivery.id, 'scheduled')}
                        >
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* View Delivery Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Delivery Details</DialogTitle>
              <DialogDescription>
                View complete delivery information
              </DialogDescription>
            </DialogHeader>
            
            {selectedDelivery && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Delivery ID</Label>
                    <p>#{selectedDelivery.id}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedDelivery.status)}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="font-semibold">Customer Information</Label>
                  <div className="space-y-2 mt-2">
                    <p><strong>Name:</strong> {selectedDelivery.customerName}</p>
                    <p><strong>Email:</strong> {selectedDelivery.customerEmail}</p>
                    <p><strong>Booking ID:</strong> #{selectedDelivery.bookingId}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="font-semibold">Delivery Information</Label>
                  <div className="space-y-2 mt-2">
                    <p><strong>Type:</strong> {selectedDelivery.deliveryType}</p>
                    <p><strong>Scheduled Date:</strong> {
                      selectedDelivery.scheduledDate ? 
                        new Date(selectedDelivery.scheduledDate).toLocaleString() : 
                        'Not scheduled'
                    }</p>
                    {selectedDelivery.actualDate && (
                      <p><strong>Actual Date:</strong> {new Date(selectedDelivery.actualDate).toLocaleString()}</p>
                    )}
                  </div>
                </div>
                
                {selectedDelivery.deliveryAddress && (
                  <div>
                    <Label className="font-semibold">Delivery Address</Label>
                    <p className="mt-2">
                      {selectedDelivery.deliveryAddress.street}<br />
                      {selectedDelivery.deliveryAddress.city}, {selectedDelivery.deliveryAddress.state} {selectedDelivery.deliveryAddress.zipCode}<br />
                      {selectedDelivery.deliveryAddress.country}
                    </p>
                  </div>
                )}
                
                <div>
                  <Label className="font-semibold">Items</Label>
                  <div className="space-y-2 mt-2">
                    {selectedDelivery.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span>{item.productName}</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Delivery Fee</Label>
                    <p>${selectedDelivery.deliveryFee.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Total Amount</Label>
                    <p className="text-lg font-bold">${selectedDelivery.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
                
                {selectedDelivery.notes && (
                  <div>
                    <Label className="font-semibold">Notes</Label>
                    <p className="mt-2 p-3 bg-muted rounded">{selectedDelivery.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Status Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Delivery Status</DialogTitle>
              <DialogDescription>
                Change the status of delivery #{selectedDelivery?.id}
              </DialogDescription>
            </DialogHeader>
            
            {selectedDelivery && (
              <div className="space-y-4">
                <div>
                  <Label>Current Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedDelivery.status)}
                  </div>
                </div>
                
                <div>
                  <Label>Update Status</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(['pending', 'scheduled', 'in_transit', 'delivered', 'returned', 'cancelled'] as const).map((status) => (
                      <Button
                        key={status}
                        variant={selectedDelivery.status === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          handleStatusUpdate(selectedDelivery.id, status);
                          setIsEditDialogOpen(false);
                        }}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default DeliveryManagement;
