import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Send
} from "lucide-react";

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  // Sample payments data
  const payments = [
    {
      id: "PAY-2025-001",
      transactionId: "TXN_20250815_001",
      invoiceId: "INV-2025-001",
      bookingId: "B-2025-089",
      customer: "Rajesh Kumar",
      amount: 17700,
      method: "upi",
      status: "completed",
      date: "2025-08-12",
      time: "14:30:25",
      reference: "12345678901",
      description: "Professional Camera Kit rental payment",
      fee: 0,
      netAmount: 17700,
      gatewayResponse: "SUCCESS",
      refundableAmount: 17700
    },
    {
      id: "PAY-2025-002",
      transactionId: "TXN_20250810_002", 
      invoiceId: "INV-2025-002",
      bookingId: "B-2025-090",
      customer: "Priya Sharma",
      amount: 9440,
      method: "card",
      status: "failed",
      date: "2025-08-10",
      time: "16:45:12",
      reference: "98765432109",
      description: "Wedding Decoration Set rental payment",
      fee: 188,
      netAmount: 9252,
      gatewayResponse: "INSUFFICIENT_FUNDS",
      refundableAmount: 0,
      failureReason: "Card declined due to insufficient funds"
    },
    {
      id: "PAY-2025-003",
      transactionId: "TXN_20250813_003",
      invoiceId: "INV-2025-003",
      bookingId: "B-2025-091",
      customer: "Arjun Singh",
      amount: 14160,
      method: "netbanking",
      status: "pending",
      date: "2025-08-13",
      time: "10:15:30",
      reference: "56789012345",
      description: "Sound System Pro rental payment",
      fee: 141,
      netAmount: 14019,
      gatewayResponse: "PENDING",
      refundableAmount: 0
    },
    {
      id: "PAY-2025-004",
      transactionId: "TXN_20250811_004",
      invoiceId: "INV-2025-004",
      bookingId: "B-2025-092",
      customer: "Meera Gupta",
      amount: 21240,
      method: "cash",
      status: "completed",
      date: "2025-08-11",
      time: "12:00:00",
      reference: "CASH_001",
      description: "Furniture Set Deluxe rental payment",
      fee: 0,
      netAmount: 21240,
      gatewayResponse: "CASH_RECEIVED",
      refundableAmount: 21240,
      receivedBy: "John Smith (Store Manager)"
    },
    {
      id: "PAY-2025-005",
      transactionId: "TXN_20250814_005",
      invoiceId: "INV-2025-005",
      bookingId: "B-2025-093",
      customer: "Vikram Patel",
      amount: 11800,
      method: "upi",
      status: "refunded",
      date: "2025-08-14",
      time: "09:20:45",
      reference: "67890123456",
      description: "Lighting Equipment rental payment",
      fee: 0,
      netAmount: 11800,
      gatewayResponse: "SUCCESS",
      refundableAmount: 0,
      refundAmount: 1500,
      refundDate: "2025-08-15",
      refundReason: "Early return - partial refund"
    },
    {
      id: "PAY-2025-006",
      transactionId: null,
      invoiceId: "INV-2025-006",
      bookingId: "B-2025-094",
      customer: "Anita Desai",
      amount: 8500,
      method: null,
      status: "pending_payment",
      date: null,
      time: null,
      reference: null,
      description: "DJ Equipment rental payment",
      fee: 0,
      netAmount: 8500,
      gatewayResponse: null,
      refundableAmount: 0,
      dueDate: "2025-08-18"
    }
  ];

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (payment.transactionId && payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesMethod = methodFilter === "all" || payment.method === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      case "refunded": return "bg-blue-100 text-blue-800";
      case "pending_payment": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return CheckCircle;
      case "pending": return Clock;
      case "failed": return X;
      case "refunded": return RefreshCw;
      case "pending_payment": return AlertCircle;
      default: return Clock;
    }
  };

  const getMethodIcon = (method: string | null) => {
    switch (method) {
      case "card": return CreditCard;
      case "upi": return Smartphone;
      case "netbanking": return Building;
      case "cash": return DollarSign;
      default: return DollarSign;
    }
  };

  const stats = {
    totalPayments: payments.length,
    totalAmount: payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments.filter(p => p.status === "pending" || p.status === "pending_payment").reduce((sum, p) => sum + p.amount, 0),
    failedAmount: payments.filter(p => p.status === "failed").reduce((sum, p) => sum + p.amount, 0),
    refundedAmount: payments.filter(p => p.status === "refunded").reduce((sum, p) => sum + (p.refundAmount || 0), 0)
  };

  const recordPayment = () => {
    console.log("Recording new payment");
  };

  const viewPayment = (paymentId: string) => {
    console.log("Viewing payment:", paymentId);
  };

  const processRefund = (paymentId: string) => {
    console.log("Processing refund for payment:", paymentId);
  };

  const sendReceipt = (paymentId: string) => {
    console.log("Sending receipt for payment:", paymentId);
  };

  const retryPayment = (paymentId: string) => {
    console.log("Retrying failed payment:", paymentId);
  };

  return (
    <Layout>
      <div className="flex-1 space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
            <p className="text-muted-foreground">
              Manage payments, refunds, and transactions
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={recordPayment} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Received</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{stats.totalAmount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                From {payments.filter(p => p.status === "completed").length} completed payments
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                ₹{stats.pendingAmount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {payments.filter(p => p.status === "pending" || p.status === "pending_payment").length} pending payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Amount</CardTitle>
              <X className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ₹{stats.failedAmount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {payments.filter(p => p.status === "failed").length} failed transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Refunded</CardTitle>
              <RefreshCw className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ₹{stats.refundedAmount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {payments.filter(p => p.status === "refunded").length} refunds processed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                  <option value="pending_payment">Awaiting Payment</option>
                </select>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Methods</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="netbanking">Net Banking</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        <div className="space-y-4">
          {filteredPayments.map((payment) => {
            const StatusIcon = getStatusIcon(payment.status);
            const MethodIcon = getMethodIcon(payment.method);
            return (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-2 rounded-full ${
                        payment.status === 'completed' ? 'bg-green-100' :
                        payment.status === 'pending' ? 'bg-yellow-100' :
                        payment.status === 'failed' ? 'bg-red-100' :
                        payment.status === 'refunded' ? 'bg-blue-100' :
                        'bg-orange-100'
                      }`}>
                        <StatusIcon className={`w-4 h-4 ${
                          payment.status === 'completed' ? 'text-green-600' :
                          payment.status === 'pending' ? 'text-yellow-600' :
                          payment.status === 'failed' ? 'text-red-600' :
                          payment.status === 'refunded' ? 'text-blue-600' :
                          'text-orange-600'
                        }`} />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-bold text-lg">{payment.id}</h3>
                          <Badge className={getStatusColor(payment.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {payment.status.replace('_', ' ')}
                          </Badge>
                          {payment.method && (
                            <Badge className="bg-gray-100 text-gray-800">
                              <MethodIcon className="w-3 h-3 mr-1" />
                              {payment.method.toUpperCase()}
                            </Badge>
                          )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Customer</p>
                            <p className="font-medium flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {payment.customer}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Amount</p>
                            <p className="font-bold text-lg text-green-600">
                              ₹{payment.amount.toLocaleString()}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Date & Time</p>
                            <p className="font-medium flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {payment.date ? `${payment.date} ${payment.time}` : 'Not paid'}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Reference</p>
                            <p className="font-medium text-sm">
                              {payment.reference || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Invoice ID</p>
                            <p className="font-medium">{payment.invoiceId}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Booking ID</p>
                            <p className="font-medium">{payment.bookingId}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Transaction ID</p>
                            <p className="font-medium text-sm">{payment.transactionId || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Description:</p>
                          <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                            {payment.description}
                          </p>
                        </div>

                        {payment.failureReason && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-red-600">Failure Reason:</p>
                            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                              {payment.failureReason}
                            </p>
                          </div>
                        )}

                        {payment.refundAmount && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-blue-600">Refund Details:</p>
                            <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                              ₹{payment.refundAmount.toLocaleString()} refunded on {payment.refundDate}
                              <br />Reason: {payment.refundReason}
                            </p>
                          </div>
                        )}

                        {payment.receivedBy && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Received By:</p>
                            <p className="text-sm text-muted-foreground bg-green-50 p-2 rounded">
                              {payment.receivedBy}
                            </p>
                          </div>
                        )}

                        {payment.dueDate && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-orange-600">Due Date:</p>
                            <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                              Payment due by {payment.dueDate}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                          <span>Fee: ₹{payment.fee} | Net: ₹{payment.netAmount.toLocaleString()}</span>
                          <span>Gateway: {payment.gatewayResponse || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewPayment(payment.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {payment.status === "completed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => sendReceipt(payment.id)}
                          >
                            <Receipt className="w-4 h-4" />
                          </Button>
                        )}
                        {payment.status === "failed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => retryPayment(payment.id)}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                        {payment.status === "completed" && payment.refundableAmount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => processRefund(payment.id)}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      {payment.refundableAmount > 0 && (
                        <div className="text-right text-xs text-muted-foreground">
                          <p>Refundable: ₹{payment.refundableAmount.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Payments;
