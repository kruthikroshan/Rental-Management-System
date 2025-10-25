import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import {
  Package,
  Calendar,
  FileText,
  CreditCard,
  Bell,
  Clock,
  MapPin,
  Download,
  Eye,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle,
  Truck,
  Receipt,
  DollarSign,
  Star,
  BarChart3,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

interface RentalHistory {
  id: number;
  orderNumber: string;
  products: { name: string; quantity: number }[];
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'overdue' | 'cancelled';
  totalAmount: number;
  paidAmount: number;
  pickupLocation: string;
  returnLocation: string;
  daysRemaining?: number;
}

interface Quotation {
  id: number;
  quotationNumber: string;
  date: string;
  validUntil: string;
  items: { name: string; quantity: number; rate: number }[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'partially_paid';
  bookingRef: string;
}

interface Payment {
  id: number;
  transactionId: string;
  date: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  invoiceRef: string;
}

interface Notification {
  id: number;
  type: 'reminder' | 'alert' | 'info';
  title: string;
  message: string;
  date: string;
  read: boolean;
  action?: { label: string; link: string };
}

interface UpcomingEvent {
  id: number;
  type: 'pickup' | 'return';
  orderNumber: string;
  date: string;
  time: string;
  location: string;
  products: string[];
  status: 'scheduled' | 'confirmed' | 'completed';
}

const CustomerPortal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [rentalHistory, setRentalHistory] = useState<RentalHistory[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortalData();
  }, []);

  const loadPortalData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      setRentalHistory([
        {
          id: 1,
          orderNumber: 'B-2025-089',
          products: [{ name: 'Professional Camera Kit', quantity: 1 }, { name: 'Lighting Equipment', quantity: 2 }],
          startDate: '2025-08-20',
          endDate: '2025-08-25',
          status: 'active',
          totalAmount: 17700,
          paidAmount: 17700,
          pickupLocation: 'Main Store, Downtown',
          returnLocation: 'Main Store, Downtown',
          daysRemaining: 3
        },
        {
          id: 2,
          orderNumber: 'B-2025-075',
          products: [{ name: 'Wedding Decoration Set', quantity: 1 }],
          startDate: '2025-07-15',
          endDate: '2025-07-18',
          status: 'completed',
          totalAmount: 9440,
          paidAmount: 9440,
          pickupLocation: 'Main Store, Downtown',
          returnLocation: 'Main Store, Downtown'
        },
        {
          id: 3,
          orderNumber: 'B-2025-060',
          products: [{ name: 'DJ Equipment Set', quantity: 1 }],
          startDate: '2025-06-10',
          endDate: '2025-06-12',
          status: 'completed',
          totalAmount: 8000,
          paidAmount: 8000,
          pickupLocation: 'Branch Office, Uptown',
          returnLocation: 'Branch Office, Uptown'
        }
      ]);

      setQuotations([
        {
          id: 1,
          quotationNumber: 'QT-2025-045',
          date: '2025-08-18',
          validUntil: '2025-08-28',
          items: [
            { name: 'Sound System Pro', quantity: 1, rate: 4500 },
            { name: 'Microphone Set', quantity: 2, rate: 800 }
          ],
          totalAmount: 6100,
          status: 'sent'
        },
        {
          id: 2,
          quotationNumber: 'QT-2025-032',
          date: '2025-08-10',
          validUntil: '2025-08-20',
          items: [{ name: 'Party Tent 20x20', quantity: 1, rate: 12000 }],
          totalAmount: 12000,
          status: 'accepted'
        }
      ]);

      setInvoices([
        {
          id: 1,
          invoiceNumber: 'INV-2025-089',
          date: '2025-08-19',
          dueDate: '2025-08-26',
          amount: 17700,
          paidAmount: 17700,
          status: 'paid',
          bookingRef: 'B-2025-089'
        },
        {
          id: 2,
          invoiceNumber: 'INV-2025-075',
          date: '2025-07-14',
          dueDate: '2025-07-21',
          amount: 9440,
          paidAmount: 9440,
          status: 'paid',
          bookingRef: 'B-2025-075'
        }
      ]);

      setPayments([
        {
          id: 1,
          transactionId: 'TXN_20250819_001',
          date: '2025-08-19',
          amount: 17700,
          method: 'UPI',
          status: 'completed',
          invoiceRef: 'INV-2025-089'
        },
        {
          id: 2,
          transactionId: 'TXN_20250714_002',
          date: '2025-07-14',
          amount: 9440,
          method: 'Card',
          status: 'completed',
          invoiceRef: 'INV-2025-075'
        }
      ]);

      setNotifications([
        {
          id: 1,
          type: 'reminder',
          title: 'Return Reminder',
          message: 'Your rental B-2025-089 is due for return in 3 days (Aug 25, 2025)',
          date: '2025-08-22',
          read: false,
          action: { label: 'View Booking', link: '/portal#rentals' }
        },
        {
          id: 2,
          type: 'info',
          title: 'New Quotation Available',
          message: 'Quotation QT-2025-045 has been sent to you. Valid until Aug 28, 2025',
          date: '2025-08-18',
          read: false,
          action: { label: 'View Quotation', link: '/portal#quotations' }
        },
        {
          id: 3,
          type: 'alert',
          title: 'Payment Confirmation',
          message: 'Payment of ₹17,700 received successfully for INV-2025-089',
          date: '2025-08-19',
          read: true
        }
      ]);

      setUpcomingEvents([
        {
          id: 1,
          type: 'return',
          orderNumber: 'B-2025-089',
          date: '2025-08-25',
          time: '4:00 PM',
          location: 'Main Store, Downtown',
          products: ['Professional Camera Kit', 'Lighting Equipment (x2)'],
          status: 'scheduled'
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error loading portal data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load portal data',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: any }> = {
      active: { label: 'Active', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      completed: { label: 'Completed', className: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      overdue: { label: 'Overdue', className: 'bg-red-100 text-red-800', icon: AlertCircle },
      cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800', icon: XCircle },
      paid: { label: 'Paid', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      sent: { label: 'Sent', className: 'bg-blue-100 text-blue-800', icon: FileText },
      accepted: { label: 'Accepted', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      partially_paid: { label: 'Partially Paid', className: 'bg-orange-100 text-orange-800', icon: AlertCircle },
    };

    const statusConfig = config[status] || { label: status, className: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    const Icon = statusConfig.icon;

    return (
      <Badge className={statusConfig.className}>
        <Icon className="w-3 h-3 mr-1" />
        {statusConfig.label}
      </Badge>
    );
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const downloadInvoice = (invoiceNumber: string) => {
    toast({
      title: 'Downloading',
      description: `Invoice ${invoiceNumber} is being downloaded...`
    });
  };

  const downloadReceipt = (transactionId: string) => {
    toast({
      title: 'Downloading',
      description: `Receipt for ${transactionId} is being downloaded...`
    });
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Portal</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.name}!</p>
          </div>
          <Button onClick={() => navigate('/products')}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Browse Products
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Rentals</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {rentalHistory.filter(r => r.status === 'active').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {invoices.filter(i => i.status !== 'paid').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unread Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {notifications.filter(n => !n.read).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <Card className="border-l-4 border-l-blue-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Pickups & Returns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      event.type === 'pickup' ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      <Truck className={`w-6 h-6 ${
                        event.type === 'pickup' ? 'text-green-600' : 'text-orange-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {event.type === 'pickup' ? 'Pickup' : 'Return'} - {event.orderNumber}
                        </h4>
                        {getStatusBadge(event.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          Products: {event.products.join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rentals">
              Rental History
              {rentalHistory.filter(r => r.status === 'active').length > 0 && (
                <Badge className="ml-2 bg-green-600">{rentalHistory.filter(r => r.status === 'active').length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="quotations">Quotations</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rentalHistory.slice(0, 3).map(rental => (
                      <div key={rental.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900 truncate">{rental.orderNumber}</h4>
                            {getStatusBadge(rental.status)}
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {rental.products.map(p => p.name).join(', ')}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Notifications</span>
                    <Badge variant="secondary">{notifications.filter(n => !n.read).length} New</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.slice(0, 4).map(notification => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border ${
                          notification.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                        }`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-2">
                          <Bell className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            notification.type === 'reminder' ? 'text-orange-600' :
                            notification.type === 'alert' ? 'text-red-600' : 'text-blue-600'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-sm text-gray-900">{notification.title}</h5>
                            <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.date).toLocaleDateString()}
                            </p>
                            {notification.action && (
                              <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                                {notification.action.label}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Rental History Tab */}
          <TabsContent value="rentals">
            <div className="space-y-4">
              {rentalHistory.map(rental => (
                <Card key={rental.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{rental.orderNumber}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {rental.products.map(p => `${p.name} (x${p.quantity})`).join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(rental.status)}
                        {rental.daysRemaining && rental.status === 'active' && (
                          <p className="text-sm text-orange-600 mt-2">
                            {rental.daysRemaining} days remaining
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Pickup Date</p>
                        <p className="font-medium">{new Date(rental.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Return Date</p>
                        <p className="font-medium">{new Date(rental.endDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="font-medium text-green-600">₹{rental.totalAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Payment Status</p>
                        <p className="font-medium">
                          {rental.paidAmount >= rental.totalAmount ? (
                            <span className="text-green-600">Paid</span>
                          ) : rental.paidAmount > 0 ? (
                            <span className="text-orange-600">Partial</span>
                          ) : (
                            <span className="text-red-600">Pending</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {rental.paidAmount < rental.totalAmount && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Payment Progress</span>
                          <span className="font-medium">
                            ₹{rental.paidAmount.toLocaleString()} / ₹{rental.totalAmount.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={(rental.paidAmount / rental.totalAmount) * 100} className="h-2" />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      {rental.status === 'active' && (
                        <Button variant="outline" size="sm">
                          <MapPin className="w-4 h-4 mr-2" />
                          Track Order
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => downloadInvoice(rental.orderNumber)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download Contract
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Quotations Tab */}
          <TabsContent value="quotations">
            <div className="space-y-4">
              {quotations.map(quotation => (
                <Card key={quotation.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{quotation.quotationNumber}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {quotation.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                        </p>
                      </div>
                      {getStatusBadge(quotation.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-medium">{new Date(quotation.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Valid Until</p>
                        <p className="font-medium">{new Date(quotation.validUntil).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="font-medium text-green-600">₹{quotation.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      {quotation.status === 'sent' && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button variant="outline" size="sm">
                            Reject
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm" onClick={() => downloadInvoice(quotation.quotationNumber)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <div className="space-y-4">
              {invoices.map(invoice => (
                <Card key={invoice.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{invoice.invoiceNumber}</h3>
                        <p className="text-sm text-gray-600 mt-1">Booking: {invoice.bookingRef}</p>
                      </div>
                      {getStatusBadge(invoice.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Invoice Date</p>
                        <p className="font-medium">{new Date(invoice.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Due Date</p>
                        <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="font-medium text-gray-900">₹{invoice.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Paid Amount</p>
                        <p className="font-medium text-green-600">₹{invoice.paidAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    {invoice.paidAmount < invoice.amount && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Payment Progress</span>
                          <span className="font-medium">
                            Balance: ₹{(invoice.amount - invoice.paidAmount).toLocaleString()}
                          </span>
                        </div>
                        <Progress value={(invoice.paidAmount / invoice.amount) * 100} className="h-2" />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      {invoice.status !== 'paid' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay Now
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => downloadInvoice(invoice.invoiceNumber)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <div className="space-y-4">
              {payments.map(payment => (
                <Card key={payment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{payment.transactionId}</h3>
                        <p className="text-sm text-gray-600 mt-1">Invoice: {payment.invoiceRef}</p>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Payment Date</p>
                        <p className="font-medium">{new Date(payment.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Method</p>
                        <p className="font-medium">{payment.method}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="font-medium text-green-600">₹{payment.amount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      {payment.status === 'completed' && (
                        <Button variant="outline" size="sm" onClick={() => downloadReceipt(payment.transactionId)}>
                          <Receipt className="w-4 h-4 mr-2" />
                          Download Receipt
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CustomerPortal;
