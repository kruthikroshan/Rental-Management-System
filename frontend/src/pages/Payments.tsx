import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  RefreshCw,
  CreditCard,
  Smartphone,
  Building,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Receipt,
  Send,
  RotateCcw,
  Shield,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  AlertTriangle,
  FileText,
  ExternalLink,
  Settings,
  Banknote,
  Wallet,
  Repeat,
  Target,
  Users,
  Globe,
  Lock,
  Smartphone as Phone,
  MoreHorizontal
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import paymentService, { 
  Payment, 
  PaymentStats, 
  PaymentFilters, 
  CreatePaymentRequest,
  RefundPaymentRequest
} from "@/services/paymentService";

const Payments = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [bulkSelection, setBulkSelection] = useState<number[]>([]);

  // Form states
  const [paymentForm, setPaymentForm] = useState<CreatePaymentRequest>({
    customerId: 0,
    amount: 0,
    currency: "USD",
    method: "card",
    description: "",
  });

  const [refundForm, setRefundForm] = useState<RefundPaymentRequest>({
    paymentId: 0,
    reason: "",
  });

  // Filters
  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    limit: 20,
    search: "",
    sortBy: "date",
    sortOrder: "desc"
  });

  useEffect(() => {
    loadPayments();
    loadStats();
  }, [filters]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      
      // Mock data for development
      const mockPayments: Payment[] = [
        {
          id: 1,
          paymentId: "PAY-2025-001",
          transactionId: "TXN_20250815_001",
          invoiceId: 1,
          invoiceRef: "INV-2025-001",
          bookingId: 89,
          bookingRef: "B-2025-089",
          customerId: 15,
          customerName: "Rajesh Kumar",
          customerEmail: "rajesh.kumar@email.com",
          amount: 17700,
          currency: "USD",
          processingFee: 177,
          netAmount: 17523,
          taxAmount: 0,
          discountAmount: 0,
          finalAmount: 17700,
          method: "upi",
          methodDetails: {
            upiId: "rajesh@paytm"
          },
          gateway: "Razorpay",
          gatewayTransactionId: "pay_12345678901",
          status: "completed",
          date: "2025-08-12",
          time: "14:30:25",
          processedAt: "2025-08-12T14:30:25Z",
          settledAt: "2025-08-12T14:35:00Z",
          reference: "12345678901",
          description: "Professional Camera Kit rental payment",
          refunds: [],
          disputes: [],
          riskScore: 85,
          riskFlags: [],
          complianceChecks: {
            aml: true,
            fraud: true,
            sanctions: true
          },
          ipAddress: "192.168.1.100",
          location: {
            country: "India",
            region: "Maharashtra",
            city: "Mumbai"
          },
          createdAt: "2025-08-12T14:30:00Z",
          updatedAt: "2025-08-12T14:35:00Z",
          createdBy: "system",
          processedBy: "gateway",
          isRecurring: false
        },
        {
          id: 2,
          paymentId: "PAY-2025-002",
          transactionId: "TXN_20250814_002",
          invoiceId: 2,
          invoiceRef: "INV-2025-002",
          bookingId: 90,
          bookingRef: "B-2025-090",
          customerId: 22,
          customerName: "Priya Sharma",
          customerEmail: "priya.sharma@email.com",
          amount: 12500,
          currency: "USD",
          processingFee: 250,
          netAmount: 12250,
          taxAmount: 0,
          discountAmount: 500,
          finalAmount: 12500,
          method: "card",
          methodDetails: {
            cardType: "visa",
            cardLast4: "4532"
          },
          gateway: "Stripe",
          gatewayTransactionId: "ch_3L8K9j2eZvKYlo2C1234567",
          status: "completed",
          date: "2025-08-14",
          time: "10:15:30",
          processedAt: "2025-08-14T10:15:30Z",
          settledAt: "2025-08-14T10:20:00Z",
          reference: "23456789012",
          description: "Wedding Decoration Set rental payment",
          refunds: [],
          disputes: [],
          riskScore: 92,
          riskFlags: [],
          complianceChecks: {
            aml: true,
            fraud: true,
            sanctions: true
          },
          ipAddress: "192.168.1.101",
          location: {
            country: "India",
            region: "Delhi",
            city: "New Delhi"
          },
          createdAt: "2025-08-14T10:15:00Z",
          updatedAt: "2025-08-14T10:20:00Z",
          createdBy: "system",
          processedBy: "gateway",
          isRecurring: false
        },
        {
          id: 3,
          paymentId: "PAY-2025-003",
          transactionId: "TXN_20250813_003",
          bookingId: 91,
          bookingRef: "B-2025-091",
          customerId: 18,
          customerName: "Arjun Singh",
          customerEmail: "arjun.singh@email.com",
          amount: 8000,
          currency: "USD",
          processingFee: 0,
          netAmount: 8000,
          taxAmount: 0,
          discountAmount: 0,
          finalAmount: 8000,
          method: "bank_transfer",
          methodDetails: {
            bankName: "State Bank of India",
            accountLast4: "7890"
          },
          gateway: "Bank Transfer",
          status: "processing",
          date: "2025-08-13",
          time: "16:45:00",
          reference: "BT123456789",
          description: "Sound System Pro rental payment",
          refunds: [],
          disputes: [],
          riskScore: 78,
          riskFlags: ["high_amount"],
          complianceChecks: {
            aml: true,
            fraud: true,
            sanctions: true
          },
          ipAddress: "192.168.1.102",
          location: {
            country: "India",
            region: "Punjab",
            city: "Chandigarh"
          },
          createdAt: "2025-08-13T16:45:00Z",
          updatedAt: "2025-08-13T16:45:00Z",
          createdBy: "system",
          isRecurring: false
        },
        {
          id: 4,
          paymentId: "PAY-2025-004",
          transactionId: "TXN_20250815_004",
          invoiceId: 4,
          invoiceRef: "INV-2025-004",
          bookingId: 92,
          bookingRef: "B-2025-092",
          customerId: 25,
          customerName: "Vikram Patel",
          customerEmail: "vikram.patel@email.com",
          amount: 15000,
          currency: "USD",
          processingFee: 300,
          netAmount: 14700,
          taxAmount: 0,
          discountAmount: 1000,
          finalAmount: 15000,
          method: "digital_wallet",
          methodDetails: {
            walletProvider: "PhonePe"
          },
          gateway: "PhonePe",
          gatewayTransactionId: "T2508150001234567",
          status: "failed",
          failureReason: "Insufficient balance in wallet",
          date: "2025-08-15",
          time: "09:20:15",
          reference: "PP987654321",
          description: "Lighting Equipment rental payment",
          refunds: [],
          disputes: [],
          riskScore: 65,
          riskFlags: ["failed_payment", "low_balance"],
          complianceChecks: {
            aml: true,
            fraud: true,
            sanctions: true
          },
          ipAddress: "192.168.1.103",
          location: {
            country: "India",
            region: "Gujarat",
            city: "Ahmedabad"
          },
          createdAt: "2025-08-15T09:20:00Z",
          updatedAt: "2025-08-15T09:20:15Z",
          createdBy: "system",
          isRecurring: false
        },
        {
          id: 5,
          paymentId: "PAY-2025-005",
          transactionId: "TXN_20250814_005",
          invoiceId: 5,
          invoiceRef: "INV-2025-005",
          bookingId: 93,
          bookingRef: "B-2025-093",
          customerId: 30,
          customerName: "Meera Gupta",
          customerEmail: "meera.gupta@email.com",
          amount: 22000,
          currency: "USD",
          processingFee: 0,
          netAmount: 22000,
          taxAmount: 0,
          discountAmount: 0,
          finalAmount: 22000,
          method: "cash",
          methodDetails: {},
          gateway: "Cash Payment",
          status: "completed",
          date: "2025-08-14",
          time: "11:30:00",
          processedAt: "2025-08-14T11:30:00Z",
          reference: "CASH001",
          description: "Corporate Event Package payment",
          refunds: [],
          disputes: [],
          riskScore: 95,
          riskFlags: [],
          complianceChecks: {
            aml: true,
            fraud: true,
            sanctions: true
          },
          createdAt: "2025-08-14T11:30:00Z",
          updatedAt: "2025-08-14T11:30:00Z",
          createdBy: "staff_001",
          processedBy: "staff_001",
          isRecurring: false
        }
      ];

      // Filter mock data based on current filters
      let filteredData = mockPayments;
      
      if (filters.search) {
        filteredData = filteredData.filter(p => 
          p.paymentId.toLowerCase().includes(filters.search!.toLowerCase()) ||
          p.customerName.toLowerCase().includes(filters.search!.toLowerCase()) ||
          p.transactionId.toLowerCase().includes(filters.search!.toLowerCase()) ||
          p.reference.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      
      if (filters.status) {
        filteredData = filteredData.filter(p => p.status === filters.status);
      }
      
      if (filters.method) {
        filteredData = filteredData.filter(p => p.method === filters.method);
      }

      setPayments(filteredData);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast({
        title: "Error",
        description: "Failed to load payments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Mock stats data
      const mockStats: PaymentStats = {
        totalPayments: 5,
        totalAmount: 75200,
        successfulPayments: 3,
        failedPayments: 1,
        pendingPayments: 1,
        disputedPayments: 0,
        refundedAmount: 0,
        processingFees: 727,
        averageTransactionValue: 15040,
        successRate: 60,
        methodBreakdown: {
          card: { count: 1, amount: 12500 },
          bank_transfer: { count: 1, amount: 8000 },
          upi: { count: 1, amount: 17700 },
          digital_wallet: { count: 1, amount: 15000 },
          cash: { count: 1, amount: 22000 },
          check: { count: 0, amount: 0 },
          crypto: { count: 0, amount: 0 }
        },
        statusBreakdown: {
          pending: 0,
          processing: 1,
          completed: 3,
          failed: 1,
          cancelled: 0,
          refunded: 0,
          partially_refunded: 0,
          disputed: 0
        },
        gatewayBreakdown: {
          "Razorpay": { count: 1, amount: 17700, successRate: 100 },
          "Stripe": { count: 1, amount: 12500, successRate: 100 },
          "Bank Transfer": { count: 1, amount: 8000, successRate: 100 },
          "PhonePe": { count: 1, amount: 15000, successRate: 0 },
          "Cash Payment": { count: 1, amount: 22000, successRate: 100 }
        },
        timeSeriesData: [
          { date: "2025-08-12", amount: 17700, count: 1 },
          { date: "2025-08-13", amount: 8000, count: 1 },
          { date: "2025-08-14", amount: 34500, count: 2 },
          { date: "2025-08-15", amount: 15000, count: 1 }
        ]
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreatePayment = async () => {
    try {
      await paymentService.createPayment(paymentForm);
      toast({
        title: "Success",
        description: "Payment created successfully.",
      });
      setIsDialogOpen(false);
      resetPaymentForm();
      loadPayments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefundPayment = async () => {
    try {
      await paymentService.refundPayment(refundForm);
      toast({
        title: "Success",
        description: "Refund processed successfully.",
      });
      setIsRefundDialogOpen(false);
      setRefundForm({ paymentId: 0, reason: "" });
      loadPayments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process refund. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRetryPayment = async (id: number) => {
    try {
      await paymentService.retryPayment(id);
      toast({
        title: "Success",
        description: "Payment retry initiated.",
      });
      loadPayments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to retry payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVerifyPayment = async (id: number) => {
    try {
      const response = await paymentService.verifyPaymentStatus(id);
      toast({
        title: "Payment Status",
        description: `Current status: ${response.data.status}`,
      });
      loadPayments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify payment status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    try {
      const blob = await paymentService.exportPayments(format, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `payments_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: `Payments exported as ${format.toUpperCase()} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export payments. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      customerId: 0,
      amount: 0,
      currency: "USD",
      method: "card",
      description: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "processing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed": return "bg-red-100 text-red-800 border-red-200";
      case "cancelled": return "bg-gray-100 text-gray-800 border-gray-200";
      case "refunded": return "bg-purple-100 text-purple-800 border-purple-200";
      case "disputed": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "card": return <CreditCard className="w-4 h-4" />;
      case "upi": return <Smartphone className="w-4 h-4" />;
      case "bank_transfer": return <Building className="w-4 h-4" />;
      case "digital_wallet": return <Wallet className="w-4 h-4" />;
      case "cash": return <Banknote className="w-4 h-4" />;
      case "check": return <FileText className="w-4 h-4" />;
      case "crypto": return <Globe className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 80) return "text-green-600";
    if (riskScore >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading payments...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
            <p className="text-muted-foreground">
              Manage payment processing, refunds, and transaction monitoring
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {bulkSelection.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {bulkSelection.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Bulk refund logic would go here
                    setBulkSelection([]);
                  }}
                >
                  Bulk Refund
                </Button>
              </div>
            )}
            <Button variant="outline" onClick={() => handleExport('xlsx')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Payment</DialogTitle>
                  <DialogDescription>
                    Process a new payment transaction
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Select value={paymentForm.customerId.toString()} onValueChange={(value) => setPaymentForm({ ...paymentForm, customerId: parseInt(value) })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">Rajesh Kumar</SelectItem>
                        <SelectItem value="22">Priya Sharma</SelectItem>
                        <SelectItem value="18">Arjun Singh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) })}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={paymentForm.currency} onValueChange={(value) => setPaymentForm({ ...paymentForm, currency: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="INR">INR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="method">Payment Method</Label>
                    <Select value={paymentForm.method} onValueChange={(value) => setPaymentForm({ ...paymentForm, method: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={paymentForm.description}
                      onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                      placeholder="Payment description..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePayment}>
                    Create Payment
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPayments}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.successRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.successfulPayments} successful
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
                <X className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.failedPayments}
                </div>
                <p className="text-xs text-muted-foreground">Need attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processing</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.pendingPayments}
                </div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(stats.averageTransactionValue)}
                </div>
                <p className="text-xs text-muted-foreground">Per transaction</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processing Fees</CardTitle>
                <DollarSign className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.processingFees)}
                </div>
                <p className="text-xs text-muted-foreground">Total fees</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search payments..."
                    value={filters.search || ""}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                  />
                </div>
                <Select value={filters.status || "all"} onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? undefined : value as any })}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.method || "all"} onValueChange={(value) => setFilters({ ...filters, method: value === "all" ? undefined : value as any })}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced
                </Button>
                <Button variant="outline" size="sm" onClick={() => loadPayments()}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {payments.map((payment) => (
            <Card key={payment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={bulkSelection.includes(payment.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setBulkSelection([...bulkSelection, payment.id]);
                        } else {
                          setBulkSelection(bulkSelection.filter(id => id !== payment.id));
                        }
                      }}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {getMethodIcon(payment.method)}
                        <CardTitle className="text-lg">{payment.paymentId}</CardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {payment.invoiceRef ? `Invoice: ${payment.invoiceRef}` : `Booking: ${payment.bookingRef}`}
                      </p>
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span>{payment.customerName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                    <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                      {payment.method.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Amount Details */}
                <div className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">{formatCurrency(payment.finalAmount)}</span>
                    <span className="text-sm text-muted-foreground">{payment.currency}</span>
                  </div>
                  {payment.processingFee > 0 && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Processing Fee:</span>
                      <span className="text-orange-600">-{formatCurrency(payment.processingFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Net Amount:</span>
                    <span className="font-medium">{formatCurrency(payment.netAmount)}</span>
                  </div>
                </div>

                {/* Payment Method Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Gateway</p>
                    <p className="font-medium">{payment.gateway}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Risk Score</p>
                    <p className={`font-medium ${getRiskColor(payment.riskScore || 0)}`}>
                      {payment.riskScore || 0}/100
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">{formatDate(payment.date)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Time</p>
                    <p className="font-medium">{formatTime(payment.time)}</p>
                  </div>
                </div>

                {/* Method-specific details */}
                <div className="text-sm">
                  {payment.methodDetails.cardLast4 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Card:</span>
                      <span className="font-medium">****{payment.methodDetails.cardLast4}</span>
                    </div>
                  )}
                  {payment.methodDetails.upiId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">UPI ID:</span>
                      <span className="font-medium">{payment.methodDetails.upiId}</span>
                    </div>
                  )}
                  {payment.methodDetails.bankName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bank:</span>
                      <span className="font-medium">{payment.methodDetails.bankName}</span>
                    </div>
                  )}
                  {payment.methodDetails.walletProvider && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wallet:</span>
                      <span className="font-medium">{payment.methodDetails.walletProvider}</span>
                    </div>
                  )}
                </div>

                {/* Reference and Description */}
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Ref: </span>
                    <span className="font-mono text-xs">{payment.reference}</span>
                  </div>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                    {payment.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {payment.status === "completed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setRefundForm({ paymentId: payment.id, reason: "" });
                          setIsRefundDialogOpen(true);
                        }}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    )}
                    {payment.status === "failed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRetryPayment(payment.id)}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVerifyPayment(payment.id)}
                    >
                      <Shield className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {/* Generate receipt */}}
                    >
                      <Receipt className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {payment.gatewayTransactionId && (
                      <span className="font-mono">{payment.gatewayTransactionId.slice(-8)}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View Payment Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>{selectedPayment?.paymentId}</DialogTitle>
              <DialogDescription>Payment transaction details</DialogDescription>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Customer Information</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Name:</span>
                          <span className="text-sm font-medium">{selectedPayment.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Email:</span>
                          <span className="text-sm font-medium">{selectedPayment.customerEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Customer ID:</span>
                          <span className="text-sm font-medium">{selectedPayment.customerId}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Payment Details</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Method:</span>
                          <div className="flex items-center space-x-1">
                            {getMethodIcon(selectedPayment.method)}
                            <span className="text-sm font-medium">{selectedPayment.method.replace('_', ' ')}</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Gateway:</span>
                          <span className="text-sm font-medium">{selectedPayment.gateway}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Status:</span>
                          <Badge className={getStatusColor(selectedPayment.status)}>
                            {selectedPayment.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Risk Score:</span>
                          <span className={`text-sm font-medium ${getRiskColor(selectedPayment.riskScore || 0)}`}>
                            {selectedPayment.riskScore || 0}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Financial Breakdown</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Amount:</span>
                          <span className="text-sm font-medium">{formatCurrency(selectedPayment.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Processing Fee:</span>
                          <span className="text-sm font-medium text-orange-600">{formatCurrency(selectedPayment.processingFee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Net Amount:</span>
                          <span className="text-sm font-medium">{formatCurrency(selectedPayment.netAmount)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 font-bold">
                          <span className="text-sm">Final Amount:</span>
                          <span className="text-sm">{formatCurrency(selectedPayment.finalAmount)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Transaction Info</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Transaction ID:</span>
                          <span className="text-sm font-mono">{selectedPayment.transactionId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Reference:</span>
                          <span className="text-sm font-mono">{selectedPayment.reference}</span>
                        </div>
                        {selectedPayment.gatewayTransactionId && (
                          <div className="flex justify-between">
                            <span className="text-sm">Gateway ID:</span>
                            <span className="text-sm font-mono">{selectedPayment.gatewayTransactionId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Timestamps</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date(selectedPayment.createdAt).toLocaleString()}</span>
                      </div>
                      {selectedPayment.processedAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Processed:</span>
                          <span>{new Date(selectedPayment.processedAt).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedPayment.settledAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Settled:</span>
                          <span>{new Date(selectedPayment.settledAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Compliance</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">AML Check:</span>
                        <CheckCircle className={`w-4 h-4 ${selectedPayment.complianceChecks.aml ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fraud Check:</span>
                        <CheckCircle className={`w-4 h-4 ${selectedPayment.complianceChecks.fraud ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sanctions:</span>
                        <CheckCircle className={`w-4 h-4 ${selectedPayment.complianceChecks.sanctions ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Description</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedPayment.description}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              {selectedPayment?.status === "completed" && (
                <Button onClick={() => {
                  setIsViewDialogOpen(false);
                  setRefundForm({ paymentId: selectedPayment.id, reason: "" });
                  setIsRefundDialogOpen(true);
                }}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Refund
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Refund Dialog */}
        <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Process Refund</DialogTitle>
              <DialogDescription>
                Process a refund for this payment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Refund Amount</Label>
                <Input
                  type="number"
                  value={refundForm.amount || selectedPayment?.finalAmount || 0}
                  onChange={(e) => setRefundForm({ ...refundForm, amount: parseFloat(e.target.value) })}
                  placeholder="Refund amount"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum refundable: {selectedPayment ? formatCurrency(selectedPayment.finalAmount) : '$0.00'}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                  placeholder="Reason for refund..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRefundPayment}>
                Process Refund
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Payments;
