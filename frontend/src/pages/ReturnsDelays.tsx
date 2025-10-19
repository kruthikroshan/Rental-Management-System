import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  Eye,
  Phone,
  Mail,
  Upload,
  Download,
  BarChart3,
  TrendingUp,
  AlertCircle,
  XCircle,
  Shield,
  Camera,
  Wrench,
  Scale,
  Timer,
  Flag,
  Users,
  Target,
  Zap,
  Activity,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import returnService, { 
  Return, 
  ReturnStats, 
  ReturnFilters, 
  UpdateReturnRequest,
  ReturnActionRequest,
  DamageAssessmentRequest
} from "@/services/returnService";

const ReturnsDelays = () => {
  const { toast } = useToast();
  const [returns, setReturns] = useState<Return[]>([]);
  const [stats, setStats] = useState<ReturnStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [isDamageDialogOpen, setIsDamageDialogOpen] = useState(false);
  const [isTimelineDialogOpen, setIsTimelineDialogOpen] = useState(false);
  const [bulkSelection, setBulkSelection] = useState<number[]>([]);

  // Form states
  const [actionForm, setActionForm] = useState<ReturnActionRequest>({
    action: "",
    notes: "",
  });

  const [damageForm, setDamageForm] = useState<DamageAssessmentRequest>({
    itemId: 0,
    damageDescription: "",
    repairCost: 0,
    severity: "minor",
    isRepairable: true,
  });

  // Filters
  const [filters, setFilters] = useState<ReturnFilters>({
    page: 1,
    limit: 20,
    search: "",
    sortBy: "expectedReturnDate",
    sortOrder: "desc"
  });

  useEffect(() => {
    loadReturns();
    loadStats();
  }, [filters]);

  const loadReturns = async () => {
    try {
      setLoading(true);
      
      // Mock data for development
      const mockReturns: Return[] = [
        {
          id: 1,
          returnId: "RD-2025-001",
          type: "delayed_return",
          bookingId: 89,
          bookingRef: "B-2025-089",
          customerId: 15,
          customerName: "Rajesh Kumar",
          customerContact: "+91-9876543210",
          status: "overdue",
          priority: "high",
          expectedReturnDate: "2025-08-12",
          daysOverdue: 3,
          lastContactDate: "2025-08-14",
          originalRentalAmount: 15000,
          securityDeposit: 3000,
          penaltyAmount: 750,
          damageCharges: 0,
          refundAmount: 0,
          finalAmount: 15750,
          items: [
            {
              id: 1,
              productId: 1,
              productName: "Professional Camera Kit",
              productCategory: "Photography",
              quantity: 1,
              expectedQuantity: 1,
              condition: "good",
              replacementCost: 25000,
              serialNumbers: ["CAM001"]
            }
          ],
          totalItems: 1,
          returnedItems: 0,
          missingItems: 0,
          damagedItems: 0,
          reason: "Customer facing transportation issues",
          escalationLevel: 1,
          communicationHistory: [
            {
              id: 1,
              date: "2025-08-13",
              action: "Called customer",
              notes: "Customer confirmed return by tomorrow",
              createdBy: "John Smith"
            },
            {
              id: 2,
              date: "2025-08-14",
              action: "Sent reminder SMS",
              notes: "No response from customer",
              createdBy: "John Smith"
            }
          ],
          isResolved: false,
          legalActionRequired: false,
          createdAt: "2025-08-12T00:00:00Z",
          updatedAt: "2025-08-14T10:30:00Z",
          createdBy: "system",
          assignedTo: "John Smith"
        },
        {
          id: 2,
          returnId: "RD-2025-002",
          type: "damaged_return",
          bookingId: 90,
          bookingRef: "B-2025-090",
          customerId: 22,
          customerName: "Priya Sharma",
          customerContact: "+91-9876543211",
          status: "processing",
          priority: "medium",
          expectedReturnDate: "2025-08-10",
          actualReturnDate: "2025-08-10",
          daysOverdue: 0,
          lastContactDate: "2025-08-10",
          originalRentalAmount: 8000,
          securityDeposit: 4000,
          penaltyAmount: 0,
          damageCharges: 2500,
          refundAmount: 1500,
          finalAmount: 9000,
          items: [
            {
              id: 2,
              productId: 5,
              productName: "Wedding Decoration Set",
              productCategory: "Decoration",
              quantity: 1,
              expectedQuantity: 1,
              condition: "damaged",
              notes: "3 flower vases broken, 1 backdrop torn",
              replacementCost: 8000,
              damageReport: {
                id: 1,
                itemsAffected: ["Flower vases", "Backdrop"],
                damageDescription: "3 flower vases broken, 1 backdrop torn",
                damagePhotos: ["damage1.jpg", "damage2.jpg"],
                repairCost: 2500,
                isRepairable: true,
                severity: "moderate",
                assessedBy: "Jane Doe",
                assessmentDate: "2025-08-10"
              }
            }
          ],
          totalItems: 1,
          returnedItems: 1,
          missingItems: 0,
          damagedItems: 1,
          reason: "Minor damage to decorative items during event",
          escalationLevel: 0,
          communicationHistory: [
            {
              id: 3,
              date: "2025-08-10",
              action: "Damage assessment",
              notes: "Documented damage with photos",
              createdBy: "Jane Doe"
            },
            {
              id: 4,
              date: "2025-08-11",
              action: "Repair quote sent",
              notes: "Customer agreed to deduction",
              createdBy: "Jane Doe"
            }
          ],
          isResolved: false,
          legalActionRequired: false,
          createdAt: "2025-08-10T00:00:00Z",
          updatedAt: "2025-08-11T14:20:00Z",
          createdBy: "system",
          assignedTo: "Jane Doe"
        },
        {
          id: 3,
          returnId: "RD-2025-003",
          type: "lost_item",
          bookingId: 92,
          bookingRef: "B-2025-092",
          customerId: 18,
          customerName: "Meera Gupta",
          customerContact: "+91-9876543212",
          status: "investigating",
          priority: "critical",
          expectedReturnDate: "2025-08-09",
          daysOverdue: 6,
          lastContactDate: "2025-08-14",
          originalRentalAmount: 5000,
          securityDeposit: 9000,
          penaltyAmount: 8000,
          damageCharges: 0,
          refundAmount: 0,
          finalAmount: 13000,
          items: [
            {
              id: 3,
              productId: 8,
              productName: "Wireless Microphone",
              productCategory: "Audio",
              quantity: 1,
              expectedQuantity: 1,
              condition: "missing",
              notes: "Item not returned with equipment set",
              replacementCost: 8000
            }
          ],
          totalItems: 1,
          returnedItems: 0,
          missingItems: 1,
          damagedItems: 0,
          reason: "Item missing from returned equipment set",
          escalationLevel: 2,
          communicationHistory: [
            {
              id: 5,
              date: "2025-08-10",
              action: "Reported missing",
              notes: "Item not in returned set",
              createdBy: "Mike Johnson"
            },
            {
              id: 6,
              date: "2025-08-12",
              action: "Customer investigation",
              notes: "Checking with event staff",
              createdBy: "Mike Johnson"
            },
            {
              id: 7,
              date: "2025-08-14",
              action: "Police complaint filed",
              notes: "Formal complaint for lost item",
              createdBy: "Security Team"
            }
          ],
          isResolved: false,
          legalActionRequired: true,
          createdAt: "2025-08-09T00:00:00Z",
          updatedAt: "2025-08-14T16:45:00Z",
          createdBy: "system",
          assignedTo: "Mike Johnson"
        },
        {
          id: 4,
          returnId: "RD-2025-004",
          type: "early_return",
          bookingId: 93,
          bookingRef: "B-2025-093",
          customerId: 25,
          customerName: "Vikram Patel",
          customerContact: "+91-9876543213",
          status: "completed",
          priority: "low",
          expectedReturnDate: "2025-08-16",
          actualReturnDate: "2025-08-13",
          finalReturnDate: "2025-08-13",
          daysOverdue: -3,
          lastContactDate: "2025-08-13",
          originalRentalAmount: 7000,
          securityDeposit: 2500,
          penaltyAmount: 0,
          damageCharges: 0,
          refundAmount: 1500,
          finalAmount: 5500,
          items: [
            {
              id: 4,
              productId: 12,
              productName: "Lighting Equipment",
              productCategory: "Lighting",
              quantity: 1,
              expectedQuantity: 1,
              condition: "excellent",
              notes: "Returned in perfect condition",
              replacementCost: 15000
            }
          ],
          totalItems: 1,
          returnedItems: 1,
          missingItems: 0,
          damagedItems: 0,
          reason: "Event cancelled, early return",
          resolutionType: "partial_return",
          escalationLevel: 0,
          communicationHistory: [
            {
              id: 8,
              date: "2025-08-13",
              action: "Early return",
              notes: "Event cancelled, items in good condition",
              createdBy: "Sarah Wilson"
            },
            {
              id: 9,
              date: "2025-08-13",
              action: "Refund processed",
              notes: "Partial refund for unused days",
              createdBy: "Finance Team"
            }
          ],
          isResolved: true,
          legalActionRequired: false,
          createdAt: "2025-08-13T00:00:00Z",
          updatedAt: "2025-08-13T15:30:00Z",
          createdBy: "system",
          assignedTo: "Sarah Wilson",
          resolvedBy: "Sarah Wilson",
          resolvedAt: "2025-08-13T15:30:00Z"
        }
      ];

      // Filter mock data based on current filters
      let filteredData = mockReturns;
      
      if (filters.search) {
        filteredData = filteredData.filter(r => 
          r.returnId.toLowerCase().includes(filters.search!.toLowerCase()) ||
          r.customerName.toLowerCase().includes(filters.search!.toLowerCase()) ||
          r.bookingRef.toLowerCase().includes(filters.search!.toLowerCase()) ||
          r.items.some(item => item.productName.toLowerCase().includes(filters.search!.toLowerCase()))
        );
      }
      
      if (filters.type) {
        filteredData = filteredData.filter(r => r.type === filters.type);
      }
      
      if (filters.status) {
        filteredData = filteredData.filter(r => r.status === filters.status);
      }
      
      if (filters.priority) {
        filteredData = filteredData.filter(r => r.priority === filters.priority);
      }
      
      if (filters.overdueOnly) {
        filteredData = filteredData.filter(r => r.daysOverdue > 0);
      }

      setReturns(filteredData);
    } catch (error) {
      console.error('Error loading returns:', error);
      toast({
        title: "Error",
        description: "Failed to load returns. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Mock stats data
      const mockStats: ReturnStats = {
        totalReturns: 4,
        pendingReturns: 2,
        overdueReturns: 2,
        resolvedReturns: 1,
        disputedReturns: 1,
        totalPenalties: 8750,
        totalDamageCharges: 2500,
        totalRefunds: 3000,
        averageResolutionTime: 2.5,
        returnRate: 75,
        damageRate: 25,
        typeBreakdown: {
          normal_return: 0,
          delayed_return: 1,
          damaged_return: 1,
          lost_item: 1,
          early_return: 1
        },
        statusBreakdown: {
          pending: 0,
          overdue: 1,
          processing: 1,
          investigating: 1,
          resolved: 0,
          completed: 1,
          disputed: 0
        },
        priorityBreakdown: {
          low: 1,
          medium: 1,
          high: 1,
          critical: 1
        }
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleStatusUpdate = async (id: number, status: Return['status'], notes?: string) => {
    try {
      await returnService.updateReturnStatus(id, status, notes);
      toast({
        title: "Success",
        description: `Return status updated to ${status}.`,
      });
      loadReturns();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update return status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddAction = async () => {
    if (!selectedReturn) return;
    
    try {
      await returnService.addReturnAction(selectedReturn.id, actionForm);
      toast({
        title: "Success",
        description: "Action added successfully.",
      });
      setIsActionDialogOpen(false);
      setActionForm({ action: "", notes: "" });
      loadReturns();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add action. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendReminder = async (id: number, type: 'sms' | 'email' | 'call') => {
    try {
      await returnService.sendReminder(id, type);
      toast({
        title: "Success",
        description: `${type.toUpperCase()} reminder sent successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reminder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEscalate = async (id: number, level: Return['escalationLevel']) => {
    try {
      await returnService.escalateReturn(id, level, "Manual escalation from dashboard");
      toast({
        title: "Success",
        description: `Return escalated to level ${level}.`,
      });
      loadReturns();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to escalate return. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    try {
      const blob = await returnService.exportReturns(format, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `returns_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: `Returns exported as ${format.toUpperCase()} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export returns. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue": return "bg-red-100 text-red-800 border-red-200";
      case "processing": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "investigating": return "bg-orange-100 text-orange-800 border-orange-200";
      case "resolved": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "disputed": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "delayed_return": return "bg-red-100 text-red-800 border-red-200";
      case "damaged_return": return "bg-orange-100 text-orange-800 border-orange-200";
      case "lost_item": return "bg-purple-100 text-purple-800 border-purple-200";
      case "early_return": return "bg-green-100 text-green-800 border-green-200";
      case "normal_return": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "delayed_return": return <Clock className="w-4 h-4" />;
      case "damaged_return": return <AlertTriangle className="w-4 h-4" />;
      case "lost_item": return <XCircle className="w-4 h-4" />;
      case "early_return": return <CheckCircle className="w-4 h-4" />;
      case "normal_return": return <Package className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
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

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading returns...</p>
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
            <h2 className="text-3xl font-bold tracking-tight">Returns & Delays</h2>
            <p className="text-muted-foreground">
              Manage equipment returns, delays, and damage assessments
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {bulkSelection.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {bulkSelection.length} selected
                </span>
                <Select onValueChange={(value) => {
                  bulkSelection.forEach(id => handleStatusUpdate(id, value as Return['status']));
                  setBulkSelection([]);
                }}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Bulk Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="processing">Mark Processing</SelectItem>
                    <SelectItem value="resolved">Mark Resolved</SelectItem>
                    <SelectItem value="completed">Mark Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Return
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Return</DialogTitle>
                  <DialogDescription>
                    Register a new return or delay case
                  </DialogDescription>
                </DialogHeader>
                {/* Return creation form would go here */}
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Return creation form will be implemented here</p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button>Create Return</Button>
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
                <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReturns}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingReturns} pending
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.overdueReturns}
                </div>
                <p className="text-xs text-muted-foreground">Need attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Return Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.returnRate}%
                </div>
                <p className="text-xs text-muted-foreground">Items returned</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Penalties</CardTitle>
                <DollarSign className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.totalPenalties)}
                </div>
                <p className="text-xs text-muted-foreground">Total collected</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Damage Charges</CardTitle>
                <Shield className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(stats.totalDamageCharges)}
                </div>
                <p className="text-xs text-muted-foreground">From damages</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
                <Timer className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.averageResolutionTime}d
                </div>
                <p className="text-xs text-muted-foreground">Resolution time</p>
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
                    placeholder="Search returns..."
                    value={filters.search || ""}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                  />
                </div>
                <Select value={filters.type || "all"} onValueChange={(value) => setFilters({ ...filters, type: value === "all" ? undefined : value as any })}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="delayed_return">Delayed Return</SelectItem>
                    <SelectItem value="damaged_return">Damaged Return</SelectItem>
                    <SelectItem value="lost_item">Lost Item</SelectItem>
                    <SelectItem value="early_return">Early Return</SelectItem>
                    <SelectItem value="normal_return">Normal Return</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.status || "all"} onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? undefined : value as any })}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.priority || "all"} onValueChange={(value) => setFilters({ ...filters, priority: value === "all" ? undefined : value as any })}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="overdueOnly"
                    checked={filters.overdueOnly || false}
                    onCheckedChange={(checked) => setFilters({ ...filters, overdueOnly: checked as boolean })}
                  />
                  <Label htmlFor="overdueOnly" className="text-sm">Overdue only</Label>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced
                </Button>
                <Button variant="outline" size="sm" onClick={() => loadReturns()}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Returns Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {returns.map((returnItem) => (
            <Card key={returnItem.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={bulkSelection.includes(returnItem.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setBulkSelection([...bulkSelection, returnItem.id]);
                        } else {
                          setBulkSelection(bulkSelection.filter(id => id !== returnItem.id));
                        }
                      }}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(returnItem.type)}
                        <CardTitle className="text-lg">{returnItem.returnId}</CardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Booking: {returnItem.bookingRef}
                      </p>
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span>{returnItem.customerName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Badge className={getStatusColor(returnItem.status)}>
                      {returnItem.status}
                    </Badge>
                    <Badge className={getTypeColor(returnItem.type)}>
                      {returnItem.type.replace('_', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(returnItem.priority)}>
                      {returnItem.priority}
                    </Badge>
                    {returnItem.escalationLevel > 0 && (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        <Flag className="w-3 h-3 mr-1" />
                        L{returnItem.escalationLevel}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items Summary */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Items</p>
                    <p className="font-bold">
                      {returnItem.returnedItems}/{returnItem.totalItems}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Days Overdue</p>
                    <p className={`font-bold ${returnItem.daysOverdue > 0 ? 'text-red-600' : returnItem.daysOverdue < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                      {returnItem.daysOverdue > 0 ? `+${returnItem.daysOverdue}` : returnItem.daysOverdue}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Penalties</p>
                    <p className="font-bold text-orange-600">
                      {formatCurrency(returnItem.penaltyAmount)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Damages</p>
                    <p className="font-bold text-purple-600">
                      {formatCurrency(returnItem.damageCharges)}
                    </p>
                  </div>
                </div>

                {/* Product Items */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Items:</p>
                  <div className="space-y-1">
                    {returnItem.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="text-xs bg-gray-50 p-2 rounded flex justify-between">
                        <span className="font-medium">{item.productName}</span>
                        <Badge className={`text-xs ${
                          item.condition === 'excellent' ? 'bg-green-100 text-green-800' :
                          item.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                          item.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                          item.condition === 'damaged' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.condition}
                        </Badge>
                      </div>
                    ))}
                    {returnItem.items.length > 2 && (
                      <p className="text-xs text-muted-foreground">
                        +{returnItem.items.length - 2} more items
                      </p>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Expected: {formatDate(returnItem.expectedReturnDate)}
                    </span>
                  </div>
                  {returnItem.actualReturnDate && (
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-muted-foreground">
                        Returned: {formatDate(returnItem.actualReturnDate)}
                      </span>
                    </div>
                  )}
                  {returnItem.lastContactDate && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Last contact: {formatDate(returnItem.lastContactDate)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Reason */}
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium text-muted-foreground mb-1">Reason:</p>
                  <p>{returnItem.reason}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedReturn(returnItem);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedReturn(returnItem);
                        setIsActionDialogOpen(true);
                      }}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSendReminder(returnItem.id, 'sms')}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSendReminder(returnItem.id, 'email')}
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                    {returnItem.escalationLevel < 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEscalate(returnItem.id, (returnItem.escalationLevel + 1) as Return['escalationLevel'])}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Select value={returnItem.status} onValueChange={(value) => handleStatusUpdate(returnItem.id, value as Return['status'])}>
                    <SelectTrigger className="w-28 h-8">
                      <MoreHorizontal className="w-3 h-3" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="disputed">Disputed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View Return Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>{selectedReturn?.returnId}</DialogTitle>
              <DialogDescription>Return details and timeline</DialogDescription>
            </DialogHeader>
            {selectedReturn && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Customer Information</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Name:</span>
                          <span className="text-sm font-medium">{selectedReturn.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Contact:</span>
                          <span className="text-sm font-medium">{selectedReturn.customerContact}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Booking:</span>
                          <span className="text-sm font-medium">{selectedReturn.bookingRef}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Return Details</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Type:</span>
                          <Badge className={getTypeColor(selectedReturn.type)}>
                            {selectedReturn.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Status:</span>
                          <Badge className={getStatusColor(selectedReturn.status)}>
                            {selectedReturn.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Priority:</span>
                          <Badge className={getPriorityColor(selectedReturn.priority)}>
                            {selectedReturn.priority}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Days Overdue:</span>
                          <span className={`text-sm font-medium ${selectedReturn.daysOverdue > 0 ? 'text-red-600' : selectedReturn.daysOverdue < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                            {selectedReturn.daysOverdue > 0 ? `+${selectedReturn.daysOverdue}` : selectedReturn.daysOverdue}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Financial Summary</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Rental Amount:</span>
                          <span className="text-sm font-medium">{formatCurrency(selectedReturn.originalRentalAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Security Deposit:</span>
                          <span className="text-sm font-medium">{formatCurrency(selectedReturn.securityDeposit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Penalties:</span>
                          <span className="text-sm font-medium text-orange-600">{formatCurrency(selectedReturn.penaltyAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Damage Charges:</span>
                          <span className="text-sm font-medium text-purple-600">{formatCurrency(selectedReturn.damageCharges)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Refund:</span>
                          <span className="text-sm font-medium text-green-600">{formatCurrency(selectedReturn.refundAmount)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 font-bold">
                          <span className="text-sm">Final Amount:</span>
                          <span className="text-sm">{formatCurrency(selectedReturn.finalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Items</h4>
                  <div className="space-y-2">
                    {selectedReturn.items.map((item, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">{item.productCategory}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}/{item.expectedQuantity}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={`${
                              item.condition === 'excellent' ? 'bg-green-100 text-green-800' :
                              item.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                              item.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                              item.condition === 'damaged' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.condition}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              Value: {formatCurrency(item.replacementCost)}
                            </p>
                          </div>
                        </div>
                        {item.notes && (
                          <p className="text-sm text-muted-foreground mt-2 bg-gray-50 p-2 rounded">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Communication History */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Communication History</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedReturn.communicationHistory.map((action, index) => (
                      <div key={index} className="border-l-2 border-blue-200 pl-4 pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{action.action}</p>
                            <p className="text-xs text-muted-foreground">{action.notes}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">{formatDate(action.date)}</p>
                            <p className="text-xs text-muted-foreground">{action.createdBy}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                if (selectedReturn) {
                  setIsViewDialogOpen(false);
                  setIsActionDialogOpen(true);
                }
              }}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Add Action
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Action Dialog */}
        <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Action</DialogTitle>
              <DialogDescription>
                Record a new action or communication for this return
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Action Type</Label>
                <Select value={actionForm.action} onValueChange={(value) => setActionForm({ ...actionForm, action: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Called customer">Called customer</SelectItem>
                    <SelectItem value="Sent SMS">Sent SMS</SelectItem>
                    <SelectItem value="Sent email">Sent email</SelectItem>
                    <SelectItem value="Site visit">Site visit</SelectItem>
                    <SelectItem value="Damage assessment">Damage assessment</SelectItem>
                    <SelectItem value="Police complaint">Police complaint</SelectItem>
                    <SelectItem value="Insurance claim">Insurance claim</SelectItem>
                    <SelectItem value="Legal notice">Legal notice</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={actionForm.notes}
                  onChange={(e) => setActionForm({ ...actionForm, notes: e.target.value })}
                  placeholder="Detailed notes about this action..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Next Follow-up Date (Optional)</Label>
                <Input
                  type="date"
                  value={actionForm.nextFollowUp || ""}
                  onChange={(e) => setActionForm({ ...actionForm, nextFollowUp: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAction}>
                Add Action
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ReturnsDelays;
