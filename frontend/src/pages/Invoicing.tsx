import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Mail,
  Clock,
  DollarSign,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Loader2,
  FileText,
  Trash2
} from "lucide-react";
import invoiceService, { Invoice as ApiInvoice, InvoiceStats } from "@/services/invoiceService";

// Mock data for development
const mockInvoices: ApiInvoice[] = [
  {
    id: 1,
    invoiceNumber: "INV-2025-001",
    bookingId: 101,
    customerId: 1,
    customerName: "John Smith",
    customerEmail: "john.smith@email.com",
    billingAddress: {
      id: 1,
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA"
    },
    status: "paid",
    issueDate: "2025-08-10T00:00:00Z",
    dueDate: "2025-08-15T00:00:00Z",
    paymentDate: "2025-08-12T00:00:00Z",
    items: [
      {
        id: 1,
        productId: 1,
        productName: "Professional Camera Kit",
        description: "High-end DSLR camera with lenses",
        quantity: 1,
        unitPrice: 150.00,
        totalAmount: 450.00,
        taxPercentage: 10,
        taxAmount: 45.00,
        netAmount: 495.00
      }
    ],
    subtotal: 450.00,
    taxPercentage: 10,
    taxAmount: 45.00,
    totalAmount: 495.00,
    paidAmount: 495.00,
    balanceAmount: 0.00,
    paymentTerms: "Net 15",
    notes: "Thank you for your business!",
    createdAt: "2025-08-10T09:00:00Z",
    updatedAt: "2025-08-12T14:30:00Z",
    sentAt: "2025-08-10T10:00:00Z"
  },
  {
    id: 2,
    invoiceNumber: "INV-2025-002",
    bookingId: 102,
    customerId: 2,
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@email.com",
    billingAddress: {
      id: 2,
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "USA"
    },
    status: "overdue",
    issueDate: "2025-08-05T00:00:00Z",
    dueDate: "2025-08-12T00:00:00Z",
    items: [
      {
        id: 2,
        productId: 2,
        productName: "Sound System",
        description: "Professional audio equipment",
        quantity: 1,
        unitPrice: 200.00,
        totalAmount: 400.00,
        taxPercentage: 8.5,
        taxAmount: 34.00,
        netAmount: 434.00
      }
    ],
    subtotal: 400.00,
    taxPercentage: 8.5,
    taxAmount: 34.00,
    totalAmount: 434.00,
    paidAmount: 0.00,
    balanceAmount: 434.00,
    paymentTerms: "Net 7",
    createdAt: "2025-08-05T09:00:00Z",
    updatedAt: "2025-08-05T09:00:00Z",
    sentAt: "2025-08-05T10:00:00Z",
    viewedAt: "2025-08-06T14:20:00Z"
  },
  {
    id: 3,
    invoiceNumber: "INV-2025-003",
    bookingId: 103,
    customerId: 3,
    customerName: "Mike Chen",
    customerEmail: "mike.chen@email.com",
    billingAddress: {
      id: 3,
      street: "789 Pine St",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "USA"
    },
    status: "sent",
    issueDate: "2025-08-12T00:00:00Z",
    dueDate: "2025-08-19T00:00:00Z",
    items: [
      {
        id: 3,
        productId: 3,
        productName: "Laptop Computer",
        description: "High-performance business laptop",
        quantity: 2,
        unitPrice: 100.00,
        totalAmount: 600.00,
        taxPercentage: 7,
        taxAmount: 42.00,
        netAmount: 642.00
      }
    ],
    subtotal: 600.00,
    taxPercentage: 7,
    taxAmount: 42.00,
    totalAmount: 642.00,
    paidAmount: 0.00,
    balanceAmount: 642.00,
    paymentTerms: "Net 15",
    createdAt: "2025-08-12T09:00:00Z",
    updatedAt: "2025-08-12T09:00:00Z",
    sentAt: "2025-08-12T10:00:00Z"
  }
];

const Invoicing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [invoices, setInvoices] = useState<ApiInvoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<ApiInvoice | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch invoices and stats on component mount
  useEffect(() => {
    loadInvoices();
    loadStats();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getInvoices({
        page: 1,
        limit: 50,
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter as any : undefined
      });
      setInvoices(response.data.invoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
      // Fallback to mock data if API fails
      setInvoices(mockInvoices);
      toast({
        title: "Using Demo Data",
        description: "Connected to demo data while backend is starting up.",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await invoiceService.getInvoiceStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading invoice stats:', error);
      // Calculate mock stats from invoices
      const mockStats: InvoiceStats = {
        totalInvoices: mockInvoices.length,
        totalAmount: mockInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        paidAmount: mockInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0),
        pendingAmount: mockInvoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.balanceAmount, 0),
        overdueAmount: mockInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.balanceAmount, 0),
        averageAmount: mockInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0) / mockInvoices.length,
        statusBreakdown: {
          draft: mockInvoices.filter(inv => inv.status === 'draft').length,
          sent: mockInvoices.filter(inv => inv.status === 'sent').length,
          viewed: mockInvoices.filter(inv => inv.status === 'viewed').length,
          partially_paid: mockInvoices.filter(inv => inv.status === 'partially_paid').length,
          paid: mockInvoices.filter(inv => inv.status === 'paid').length,
          overdue: mockInvoices.filter(inv => inv.status === 'overdue').length,
          cancelled: mockInvoices.filter(inv => inv.status === 'cancelled').length,
        }
      };
      setStats(mockStats);
    }
  };

  const handleSendInvoice = async (id: number) => {
    try {
      await invoiceService.sendInvoice(id);
      setInvoices(invoices.map(inv => 
        inv.id === id ? { ...inv, status: 'sent', sentAt: new Date().toISOString() } : inv
      ));
      toast({
        title: "Invoice Sent",
        description: "Invoice has been sent to the customer",
      });
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast({
        title: "Error",
        description: "Failed to send invoice",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async (id: number, invoiceNumber: string) => {
    try {
      const blob = await invoiceService.downloadInvoicePDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Error",
        description: "Failed to download invoice PDF",
        variant: "destructive",
      });
    }
  };

  const handleRecordPayment = async (id: number, amount: number) => {
    try {
      await invoiceService.recordPayment(id, amount, new Date().toISOString());
      const updatedInvoice = invoices.find(inv => inv.id === id);
      if (updatedInvoice) {
        const newPaidAmount = (updatedInvoice.paidAmount || 0) + amount;
        const newStatus = newPaidAmount >= updatedInvoice.totalAmount ? 'paid' : 'partially_paid';
        setInvoices(invoices.map(inv => 
          inv.id === id ? { 
            ...inv, 
            status: newStatus,
            paidAmount: newPaidAmount,
            balanceAmount: updatedInvoice.totalAmount - newPaidAmount,
            paymentDate: newStatus === 'paid' ? new Date().toISOString() : inv.paymentDate
          } : inv
        ));
      }
      setIsPaymentDialogOpen(false);
      toast({
        title: "Payment Recorded",
        description: "Payment has been recorded successfully",
      });
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Draft", className: "bg-gray-100 text-gray-800" },
      sent: { label: "Sent", className: "bg-blue-100 text-blue-800" },
      viewed: { label: "Viewed", className: "bg-purple-100 text-purple-800" },
      partially_paid: { label: "Partially Paid", className: "bg-yellow-100 text-yellow-800" },
      paid: { label: "Paid", className: "bg-green-100 text-green-800" },
      overdue: { label: "Overdue", className: "bg-red-100 text-red-800" },
      cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-800" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Edit className="w-4 h-4 text-gray-500" />;
      case "sent":
        return <Mail className="w-4 h-4 text-blue-500" />;
      case "viewed":
        return <Eye className="w-4 h-4 text-purple-500" />;
      case "partially_paid":
        return <CreditCard className="w-4 h-4 text-yellow-500" />;
      case "paid":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "cancelled":
        return <Trash2 className="w-4 h-4 text-gray-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.bookingId.toString().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="flex-1 space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Invoicing</h2>
            <p className="text-muted-foreground">
              Manage invoices and billing
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalInvoices || 0}</div>
              <p className="text-xs text-muted-foreground">All time invoices</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.totalAmount.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground">Total invoice amount</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${stats?.paidAmount.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground">Successfully collected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${stats?.pendingAmount.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
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
                  placeholder="Search invoices by number, customer, or booking ID..."
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No invoices found
                </div>
              ) : (
                filteredInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold">{invoice.invoiceNumber}</span>
                        {getStatusIcon(invoice.status)}
                        {getStatusBadge(invoice.status)}
                        <Badge variant="outline">Booking #{invoice.bookingId}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="flex items-center space-x-2 text-sm">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{invoice.customerName}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {invoice.customerEmail}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Issued: {new Date(invoice.issueDate).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium">
                            Total: ${invoice.totalAmount.toFixed(2)}
                          </div>
                          {invoice.balanceAmount && invoice.balanceAmount > 0 ? (
                            <div className="text-sm text-red-600 mt-1">
                              Balance: ${invoice.balanceAmount.toFixed(2)}
                            </div>
                          ) : (
                            <div className="text-sm text-green-600 mt-1">
                              Paid in full
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {invoice.notes && (
                        <p className="text-sm text-muted-foreground italic">
                          Note: {invoice.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadPDF(invoice.id, invoice.invoiceNumber)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                      
                      {invoice.status === 'draft' && (
                        <Button 
                          size="sm"
                          onClick={() => handleSendInvoice(invoice.id)}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Send
                        </Button>
                      )}
                      
                      {(invoice.status === 'sent' || invoice.status === 'viewed' || invoice.status === 'overdue') && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setIsPaymentDialogOpen(true);
                          }}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Record Payment
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* View Invoice Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription>
                Complete invoice information
              </DialogDescription>
            </DialogHeader>
            
            {selectedInvoice && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Invoice Number</Label>
                    <p>{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedInvoice.status)}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="font-semibold">Customer Information</Label>
                  <div className="space-y-2 mt-2">
                    <p><strong>Name:</strong> {selectedInvoice.customerName}</p>
                    <p><strong>Email:</strong> {selectedInvoice.customerEmail}</p>
                    <p><strong>Booking ID:</strong> #{selectedInvoice.bookingId}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="font-semibold">Dates</Label>
                  <div className="space-y-2 mt-2">
                    <p><strong>Issue Date:</strong> {new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
                    <p><strong>Due Date:</strong> {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                    {selectedInvoice.paymentDate && (
                      <p><strong>Payment Date:</strong> {new Date(selectedInvoice.paymentDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label className="font-semibold">Billing Address</Label>
                  <p className="mt-2">
                    {selectedInvoice.billingAddress.street}<br />
                    {selectedInvoice.billingAddress.city}, {selectedInvoice.billingAddress.state} {selectedInvoice.billingAddress.zipCode}<br />
                    {selectedInvoice.billingAddress.country}
                  </p>
                </div>
                
                <div>
                  <Label className="font-semibold">Items</Label>
                  <div className="space-y-2 mt-2">
                    {selectedInvoice.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted rounded">
                        <div>
                          <span className="font-medium">{item.productName}</span>
                          {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                        </div>
                        <div className="text-right">
                          <p>Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                          <p className="font-medium">${item.netAmount.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2 p-4 bg-muted rounded">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedInvoice.discountAmount && selectedInvoice.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-${selectedInvoice.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${selectedInvoice.taxAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${selectedInvoice.totalAmount.toFixed(2)}</span>
                  </div>
                  {selectedInvoice.paidAmount && selectedInvoice.paidAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Paid:</span>
                      <span>${selectedInvoice.paidAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedInvoice.balanceAmount && selectedInvoice.balanceAmount > 0 && (
                    <div className="flex justify-between text-red-600 font-medium">
                      <span>Balance Due:</span>
                      <span>${selectedInvoice.balanceAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                
                {selectedInvoice.notes && (
                  <div>
                    <Label className="font-semibold">Notes</Label>
                    <p className="mt-2 p-3 bg-muted rounded">{selectedInvoice.notes}</p>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              {selectedInvoice && (
                <Button onClick={() => handleDownloadPDF(selectedInvoice.id, selectedInvoice.invoiceNumber)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Record Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Record a payment for invoice {selectedInvoice?.invoiceNumber}
              </DialogDescription>
            </DialogHeader>
            
            {selectedInvoice && (
              <div className="space-y-4">
                <div>
                  <Label>Invoice Amount</Label>
                  <p className="text-lg font-medium">${selectedInvoice.totalAmount.toFixed(2)}</p>
                </div>
                
                <div>
                  <Label>Outstanding Balance</Label>
                  <p className="text-lg font-medium text-red-600">${selectedInvoice.balanceAmount?.toFixed(2) || selectedInvoice.totalAmount.toFixed(2)}</p>
                </div>
                
                <div>
                  <Label htmlFor="payment-amount">Payment Amount</Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    step="0.01"
                    max={selectedInvoice.balanceAmount || selectedInvoice.totalAmount}
                    placeholder="Enter payment amount"
                  />
                </div>
                
                <div>
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="payment-notes">Notes (Optional)</Label>
                  <Textarea
                    id="payment-notes"
                    placeholder="Payment notes..."
                    rows={3}
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                const amountInput = document.getElementById('payment-amount') as HTMLInputElement;
                const amount = parseFloat(amountInput.value);
                if (selectedInvoice && amount > 0) {
                  handleRecordPayment(selectedInvoice.id, amount);
                }
              }}>
                Record Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Invoicing;
