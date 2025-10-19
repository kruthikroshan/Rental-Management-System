import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { 
  Package, 
  Search, 
  Calendar, 
  MapPin, 
  Filter, 
  Eye, 
  Plus, 
  Clock, 
  User, 
  DollarSign, 
  Truck, 
  CheckCircle, 
  AlertCircle, 
  X,
  Edit,
  Phone,
  Mail,
  FileText,
  Download,
  ArrowRight
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import bookingService, { Booking, BookingFilters } from '../services/enhancedBookingService';
import { useToast } from '../hooks/use-toast';

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    overdue: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, paymentStatusFilter, dateRange]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBookings({
        page: 1,
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (response.success) {
        setBookings(response.data.bookings);
        setBookingStats({
          total: response.data.stats.totalBookings,
          active: response.data.stats.activeBookings,
          completed: response.data.stats.completedBookings,
          cancelled: response.data.stats.cancelledBookings,
          overdue: response.data.stats.overdueBookings
        });
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Payment status filter
    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.paymentStatus === paymentStatusFilter);
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.startDate);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return bookingDate >= startDate && bookingDate <= endDate;
      });
    }

    setFilteredBookings(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'overdue': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-orange-100 text-orange-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
    try {
      await bookingService.updateBookingStatus(bookingId, newStatus);
      toast({
        title: "Status Updated",
        description: `Booking status updated to ${newStatus}`,
      });
      loadBookings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive"
      });
    }
  };

  const handleCancelBooking = async (bookingId: number, reason: string) => {
    try {
      await bookingService.cancelBooking(bookingId, reason);
      toast({
        title: "Booking Cancelled",
        description: "Booking has been cancelled successfully",
      });
      loadBookings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bookings Management</h1>
          <p className="text-gray-600 mt-1">Manage all rental bookings and orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => window.location.href = '/products'}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Booking
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookingStats.total}</p>
                <p className="text-sm text-gray-600">Total Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookingStats.active}</p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookingStats.completed}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookingStats.cancelled}</p>
                <p className="text-sm text-gray-600">Cancelled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookingStats.overdue}</p>
                <p className="text-sm text-gray-600">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Status Filter */}
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range Filters */}
            <Input
              type="date"
              placeholder="Start Date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />

            <Input
              type="date"
              placeholder="End Date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Booking Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{booking.bookingRef}</h3>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                    <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                      {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {/* Customer Info */}
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{booking.customerName}</p>
                        <p className="text-gray-600">{booking.customerPhone}</p>
                      </div>
                    </div>

                    {/* Rental Period */}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">
                          {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                        </p>
                        <p className="text-gray-600">{booking.duration} {booking.durationType}(s)</p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{formatCurrency(booking.finalAmount)}</p>
                        <p className="text-gray-600">
                          {booking.payment.paidAmount > 0 && 
                            `Paid: ${formatCurrency(booking.payment.paidAmount)}`
                          }
                          {booking.payment.pendingAmount > 0 && 
                            ` | Pending: ${formatCurrency(booking.payment.pendingAmount)}`
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items Summary */}
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">Items ({booking.items.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {booking.items.slice(0, 3).map((item, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {item.productName} × {item.quantity}
                        </Badge>
                      ))}
                      {booking.items.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{booking.items.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 min-w-[120px]">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowBookingDetails(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  
                  {booking.status === 'confirmed' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(booking.id, 'in_progress')}
                    >
                      <Truck className="h-4 w-4 mr-1" />
                      Start Delivery
                    </Button>
                  )}

                  {booking.status === 'in_progress' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(booking.id, 'completed')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  )}

                  {['draft', 'confirmed'].includes(booking.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleCancelBooking(booking.id, 'Customer request')}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredBookings.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || paymentStatusFilter !== 'all' || dateRange.start || dateRange.end
                ? "Try adjusting your filters to see more results."
                : "Create your first booking to get started."
              }
            </p>
            <Button onClick={() => window.location.href = '/products'}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Booking
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Booking Details Dialog */}
      <Dialog open={showBookingDetails} onOpenChange={setShowBookingDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Booking Details - {selectedBooking.bookingRef}
                </DialogTitle>
                <DialogDescription>
                  Complete information about this booking
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status and Actions */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(selectedBooking.status)}>
                      {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                    </Badge>
                    <Badge className={getPaymentStatusColor(selectedBooking.paymentStatus)}>
                      {selectedBooking.paymentStatus.charAt(0).toUpperCase() + selectedBooking.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>

                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p className="text-sm">{selectedBooking.customerName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm">{selectedBooking.customerEmail}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p className="text-sm">{selectedBooking.customerPhone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Customer ID</Label>
                      <p className="text-sm">#{selectedBooking.customerId}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Rental Period */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Rental Period
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Start Date</Label>
                      <p className="text-sm">{formatDate(selectedBooking.startDate)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">End Date</Label>
                      <p className="text-sm">{formatDate(selectedBooking.endDate)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Duration</Label>
                      <p className="text-sm">{selectedBooking.duration} {selectedBooking.durationType}(s)</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Rental Items ({selectedBooking.items.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedBooking.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              {item.productImage ? (
                                <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                <Package className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium">{item.productName}</h4>
                              <p className="text-sm text-gray-600">{item.category}</p>
                              <p className="text-sm text-gray-600">SKU: {item.productSku}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">Qty: {item.quantity}</p>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(item.unitRate)}/{item.durationType}
                            </p>
                            <p className="text-sm font-medium">
                              Total: {formatCurrency(item.lineTotal)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Addresses */}
                {(selectedBooking.deliveryAddress || selectedBooking.pickupAddress) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Addresses
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedBooking.deliveryAddress && (
                        <div>
                          <Label className="text-sm font-medium">Delivery Address</Label>
                          <div className="text-sm space-y-1 mt-1">
                            <p>{selectedBooking.deliveryAddress.contactName}</p>
                            <p>{selectedBooking.deliveryAddress.street}</p>
                            <p>{selectedBooking.deliveryAddress.city}, {selectedBooking.deliveryAddress.state} {selectedBooking.deliveryAddress.zipCode}</p>
                            <p>{selectedBooking.deliveryAddress.contactPhone}</p>
                          </div>
                        </div>
                      )}
                      {selectedBooking.pickupAddress && (
                        <div>
                          <Label className="text-sm font-medium">Pickup Address</Label>
                          <div className="text-sm space-y-1 mt-1">
                            <p>{selectedBooking.pickupAddress.contactName}</p>
                            <p>{selectedBooking.pickupAddress.street}</p>
                            <p>{selectedBooking.pickupAddress.city}, {selectedBooking.pickupAddress.state} {selectedBooking.pickupAddress.zipCode}</p>
                            <p>{selectedBooking.pickupAddress.contactPhone}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Payment Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label className="text-sm font-medium">Subtotal</Label>
                        <p className="text-sm">{formatCurrency(selectedBooking.subtotal)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Tax</Label>
                        <p className="text-sm">{formatCurrency(selectedBooking.taxAmount)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Security Deposit</Label>
                        <p className="text-sm">{formatCurrency(selectedBooking.totalSecurityDeposit)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Final Amount</Label>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(selectedBooking.finalAmount)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Payment Method</Label>
                        <p className="text-sm">{selectedBooking.payment.method}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Paid Amount</Label>
                        <p className="text-sm font-medium text-green-600">{formatCurrency(selectedBooking.payment.paidAmount)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Pending Amount</Label>
                        <p className="text-sm font-medium text-orange-600">{formatCurrency(selectedBooking.payment.pendingAmount)}</p>
                      </div>
                    </div>

                    {selectedBooking.payment.installments && selectedBooking.payment.installments.length > 0 && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium mb-2 block">Payment Schedule</Label>
                        <div className="space-y-2">
                          {selectedBooking.payment.installments.map((installment) => (
                            <div key={installment.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <p className="text-sm font-medium">{installment.description}</p>
                                <p className="text-xs text-gray-600">Due: {formatDate(installment.dueDate)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">{formatCurrency(installment.amount)}</p>
                                <Badge className={installment.status === 'paid' ? 'bg-green-100 text-green-800' : 
                                                installment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'}>
                                  {installment.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Timeline */}
                {selectedBooking.timeline && selectedBooking.timeline.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Booking Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedBooking.timeline.map((event) => (
                          <div key={event.id} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{event.title}</h4>
                                <span className="text-xs text-gray-500">{formatDate(event.timestamp)}</span>
                              </div>
                              <p className="text-sm text-gray-600">{event.description}</p>
                              <p className="text-xs text-gray-500">by {event.performedBy}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notes */}
                {(selectedBooking.notes || selectedBooking.specialInstructions || selectedBooking.internalNotes) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Notes & Instructions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedBooking.notes && (
                        <div>
                          <Label className="text-sm font-medium">Customer Notes</Label>
                          <p className="text-sm text-gray-600">{selectedBooking.notes}</p>
                        </div>
                      )}
                      {selectedBooking.specialInstructions && (
                        <div>
                          <Label className="text-sm font-medium">Special Instructions</Label>
                          <p className="text-sm text-gray-600">{selectedBooking.specialInstructions}</p>
                        </div>
                      )}
                      {selectedBooking.internalNotes && (
                        <div>
                          <Label className="text-sm font-medium">Internal Notes</Label>
                          <p className="text-sm text-gray-600">{selectedBooking.internalNotes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBookingDetails(false)}>
                  Close
                </Button>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Booking
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Bookings;
