import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  Package,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  RotateCcw,
  FileText,
  Edit,
  MessageSquare,
  Eye
} from "lucide-react";

const ReturnsDelays = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Sample returns and delays data
  const returnsDelays = [
    {
      id: "RD-2025-001",
      type: "delayed_return",
      bookingId: "B-2025-089",
      customer: "Rajesh Kumar",
      product: "Professional Camera Kit",
      expectedReturnDate: "2025-08-12",
      actualReturnDate: null,
      daysOverdue: 3,
      status: "overdue",
      penaltyAmount: 750,
      securityDeposit: 3000,
      reason: "Customer facing transportation issues",
      lastContact: "2025-08-14",
      actions: [
        { date: "2025-08-13", action: "Called customer", notes: "Customer confirmed return by tomorrow" },
        { date: "2025-08-14", action: "Sent reminder SMS", notes: "No response from customer" }
      ]
    },
    {
      id: "RD-2025-002",
      type: "damaged_return",
      bookingId: "B-2025-090",
      customer: "Priya Sharma",
      product: "Wedding Decoration Set",
      expectedReturnDate: "2025-08-10",
      actualReturnDate: "2025-08-10",
      daysOverdue: 0,
      status: "processing",
      penaltyAmount: 2500,
      securityDeposit: 4000,
      reason: "Minor damage to decorative items during event",
      lastContact: "2025-08-10",
      damageReport: "3 flower vases broken, 1 backdrop torn",
      repairCost: 2500,
      actions: [
        { date: "2025-08-10", action: "Damage assessment", notes: "Documented damage with photos" },
        { date: "2025-08-11", action: "Repair quote sent", notes: "Customer agreed to deduction" }
      ]
    },
    {
      id: "RD-2025-003",
      type: "delayed_return",
      bookingId: "B-2025-091",
      customer: "Arjun Singh",
      product: "Sound System Pro",
      expectedReturnDate: "2025-08-11",
      actualReturnDate: null,
      daysOverdue: 4,
      status: "resolved",
      penaltyAmount: 1200,
      securityDeposit: 6000,
      reason: "Event extended due to weather conditions",
      lastContact: "2025-08-15",
      finalReturnDate: "2025-08-15",
      actions: [
        { date: "2025-08-12", action: "Customer notified delay", notes: "Requested 3-day extension" },
        { date: "2025-08-15", action: "Item returned", notes: "Good condition, penalty applied" }
      ]
    },
    {
      id: "RD-2025-004",
      type: "lost_item",
      bookingId: "B-2025-092",
      customer: "Meera Gupta",
      product: "Wireless Microphone",
      expectedReturnDate: "2025-08-09",
      actualReturnDate: null,
      daysOverdue: 6,
      status: "investigating",
      penaltyAmount: 8000,
      securityDeposit: 9000,
      reason: "Item missing from returned equipment set",
      lastContact: "2025-08-14",
      actions: [
        { date: "2025-08-10", action: "Reported missing", notes: "Item not in returned set" },
        { date: "2025-08-12", action: "Customer investigation", notes: "Checking with event staff" },
        { date: "2025-08-14", action: "Police complaint filed", notes: "Formal complaint for lost item" }
      ]
    },
    {
      id: "RD-2025-005",
      type: "early_return",
      bookingId: "B-2025-093",
      customer: "Vikram Patel",
      product: "Lighting Equipment",
      expectedReturnDate: "2025-08-16",
      actualReturnDate: "2025-08-13",
      daysOverdue: -3,
      status: "completed",
      penaltyAmount: 0,
      securityDeposit: 2500,
      reason: "Event cancelled, early return",
      lastContact: "2025-08-13",
      refundAmount: 1500,
      actions: [
        { date: "2025-08-13", action: "Early return", notes: "Event cancelled, items in good condition" },
        { date: "2025-08-13", action: "Refund processed", notes: "Partial refund for unused days" }
      ]
    }
  ];

  const filteredReturnsDelays = returnsDelays.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.bookingId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue": return "bg-red-100 text-red-800";
      case "processing": return "bg-yellow-100 text-yellow-800";
      case "investigating": return "bg-orange-100 text-orange-800";
      case "resolved": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "delayed_return": return "bg-red-100 text-red-800";
      case "damaged_return": return "bg-orange-100 text-orange-800";
      case "lost_item": return "bg-purple-100 text-purple-800";
      case "early_return": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "delayed_return": return Clock;
      case "damaged_return": return AlertTriangle;
      case "lost_item": return Package;
      case "early_return": return CheckCircle;
      default: return FileText;
    }
  };

  const stats = {
    totalCases: returnsDelays.length,
    overdueCases: returnsDelays.filter(item => item.status === "overdue").length,
    totalPenalties: returnsDelays.reduce((sum, item) => sum + item.penaltyAmount, 0),
    avgDelayDays: Math.round(returnsDelays.filter(item => item.daysOverdue > 0).reduce((sum, item) => sum + item.daysOverdue, 0) / returnsDelays.filter(item => item.daysOverdue > 0).length) || 0
  };

  const createCase = () => {
    console.log("Creating new return/delay case");
  };

  const viewCase = (caseId: string) => {
    console.log("Viewing case:", caseId);
  };

  const editCase = (caseId: string) => {
    console.log("Editing case:", caseId);
  };

  const addAction = (caseId: string) => {
    console.log("Adding action to case:", caseId);
  };

  return (
    <Layout>
      <div className="flex-1 space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Returns & Delays</h2>
            <p className="text-muted-foreground">
              Manage returns, delays, and equipment issues
            </p>
          </div>
          <Button onClick={createCase} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Case
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCases}</div>
              <p className="text-xs text-muted-foreground">All cases</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Cases</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdueCases}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Penalties</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ₹{stats.totalPenalties.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">In penalties</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Delay</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.avgDelayDays}</div>
              <p className="text-xs text-muted-foreground">Days average</p>
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
                    placeholder="Search cases..."
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
                  <option value="overdue">Overdue</option>
                  <option value="processing">Processing</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Types</option>
                  <option value="delayed_return">Delayed Return</option>
                  <option value="damaged_return">Damaged Return</option>
                  <option value="lost_item">Lost Item</option>
                  <option value="early_return">Early Return</option>
                </select>
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cases List */}
        <div className="space-y-4">
          {filteredReturnsDelays.map((item) => {
            const TypeIcon = getTypeIcon(item.type);
            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-2 rounded-full ${
                        item.type === 'delayed_return' ? 'bg-red-100' :
                        item.type === 'damaged_return' ? 'bg-orange-100' :
                        item.type === 'lost_item' ? 'bg-purple-100' :
                        'bg-green-100'
                      }`}>
                        <TypeIcon className={`w-4 h-4 ${
                          item.type === 'delayed_return' ? 'text-red-600' :
                          item.type === 'damaged_return' ? 'text-orange-600' :
                          item.type === 'lost_item' ? 'text-purple-600' :
                          'text-green-600'
                        }`} />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-bold text-lg">{item.id}</h3>
                          <Badge className={getTypeColor(item.type)}>
                            {item.type.replace('_', ' ')}
                          </Badge>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          {item.daysOverdue > 0 && (
                            <Badge className="bg-red-100 text-red-800">
                              {item.daysOverdue} days overdue
                            </Badge>
                          )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Customer</p>
                            <p className="font-medium flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {item.customer}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Product</p>
                            <p className="font-medium flex items-center">
                              <Package className="w-3 h-3 mr-1" />
                              {item.product}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Expected Return</p>
                            <p className="font-medium flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {item.expectedReturnDate}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Penalty Amount</p>
                            <p className="font-bold text-red-600 flex items-center">
                              <DollarSign className="w-3 h-3 mr-1" />
                              ₹{item.penaltyAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Reason:</p>
                          <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                            {item.reason}
                          </p>
                        </div>

                        {item.damageReport && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Damage Report:</p>
                            <p className="text-sm text-muted-foreground bg-orange-50 p-2 rounded">
                              {item.damageReport}
                              {item.repairCost && (
                                <span className="ml-2 font-bold text-orange-600">
                                  Repair Cost: ₹{item.repairCost.toLocaleString()}
                                </span>
                              )}
                            </p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Recent Actions:</p>
                          <div className="space-y-1">
                            {item.actions.slice(0, 2).map((action, index) => (
                              <div key={index} className="text-xs bg-blue-50 p-2 rounded flex items-start space-x-2">
                                <span className="font-bold">{action.date}:</span>
                                <div>
                                  <span className="font-medium">{action.action}</span>
                                  <span className="text-muted-foreground"> - {action.notes}</span>
                                </div>
                              </div>
                            ))}
                            {item.actions.length > 2 && (
                              <p className="text-xs text-muted-foreground">
                                +{item.actions.length - 2} more actions
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewCase(item.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editCase(item.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addAction(item.id)}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>Last Contact: {item.lastContact}</p>
                        <p>Security Deposit: ₹{item.securityDeposit.toLocaleString()}</p>
                      </div>
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

export default ReturnsDelays;
