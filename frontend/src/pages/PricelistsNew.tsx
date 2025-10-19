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
  Edit,
  Copy,
  Trash2,
  Calendar,
  Users,
  DollarSign,
  Package,
  Tag,
  TrendingUp,
  Clock,
  Star,
  Eye,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Settings,
  Target,
  Zap,
  Shield,
  Activity,
  BarChart3,
  Percent,
  Layers,
  ArrowUpDown,
  MoreHorizontal,
  FileText,
  Calculator
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import pricelistService, { 
  Pricelist, 
  PricelistStats, 
  PricelistFilters,
  CreatePricelistRequest,
  UpdatePricelistRequest,
  PricelistItem,
  PricelistRule
} from "@/services/pricelistService";

const Pricelists = () => {
  const { toast } = useToast();
  const [pricelists, setPricelists] = useState<Pricelist[]>([]);
  const [stats, setStats] = useState<PricelistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPricelist, setSelectedPricelist] = useState<Pricelist | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRulesDialogOpen, setIsRulesDialogOpen] = useState(false);
  const [isCalculatorDialogOpen, setIsCalculatorDialogOpen] = useState(false);
  const [bulkSelection, setBulkSelection] = useState<number[]>([]);
  const [formData, setFormData] = useState<CreatePricelistRequest>({
    name: "",
    description: "",
    code: "",
    category: "general",
    validFrom: new Date().toISOString().split('T')[0],
    discountType: "none",
    discountValue: 0,
    applicableCustomers: "all",
    priority: 1,
    currency: "USD",
    isDefault: false,
    autoApply: false,
    stackable: false
  });

  // Filters
  const [filters, setFilters] = useState<PricelistFilters>({
    page: 1,
    limit: 20,
    search: "",
    sortBy: "priority",
    sortOrder: "asc"
  });

  useEffect(() => {
    loadPricelists();
    loadStats();
  }, [filters]);

  const loadPricelists = async () => {
    try {
      setLoading(true);
      
      // Mock data for development
      const mockPricelists: Pricelist[] = [
        {
          id: 1,
          name: "Standard Pricing",
          description: "Default pricing for all customers",
          code: "STD-001",
          category: "general",
          status: "active",
          validFrom: "2025-01-01",
          validTo: "2025-12-31",
          discountType: "none",
          discountValue: 0,
          applicableCustomers: "all",
          customerCount: 147,
          itemCount: 25,
          priority: 1,
          currency: "USD",
          isDefault: true,
          autoApply: true,
          stackable: false,
          items: [],
          rules: [],
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-08-10T00:00:00Z",
          createdBy: "admin",
          lastUsed: "2025-08-12T10:30:00Z",
          usageCount: 342,
          totalSavings: 0
        },
        {
          id: 2,
          name: "Premium Customer Pricing",
          description: "Special pricing for premium customers",
          code: "PREM-001",
          category: "vip",
          status: "active",
          validFrom: "2025-01-01",
          validTo: "2025-12-31",
          discountType: "percentage",
          discountValue: 15,
          applicableCustomers: "specific",
          customerIds: [1, 2, 3, 4, 5],
          customerCount: 23,
          itemCount: 25,
          priority: 2,
          currency: "USD",
          isDefault: false,
          autoApply: true,
          stackable: true,
          items: [],
          rules: [],
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-08-08T00:00:00Z",
          createdBy: "admin",
          lastUsed: "2025-08-11T14:20:00Z",
          usageCount: 89,
          totalSavings: 12450
        },
        {
          id: 3,
          name: "Wedding Season Special",
          description: "Special pricing for wedding events",
          code: "SEAS-001",
          category: "seasonal",
          status: "active",
          validFrom: "2025-10-01",
          validTo: "2026-03-31",
          discountType: "percentage",
          discountValue: 10,
          applicableCustomers: "all",
          customerCount: 147,
          itemCount: 12,
          priority: 3,
          currency: "USD",
          isDefault: false,
          autoApply: false,
          stackable: true,
          minOrderAmount: 1000,
          items: [],
          rules: [],
          createdAt: "2025-08-01T00:00:00Z",
          updatedAt: "2025-08-05T00:00:00Z",
          createdBy: "manager",
          lastUsed: "2025-08-10T16:45:00Z",
          usageCount: 156,
          totalSavings: 8920
        },
        {
          id: 4,
          name: "Corporate Pricing",
          description: "B2B pricing for corporate clients",
          code: "CORP-001",
          category: "wholesale",
          status: "active",
          validFrom: "2025-01-01",
          validTo: "2025-12-31",
          discountType: "percentage",
          discountValue: 25,
          applicableCustomers: "segments",
          customerCount: 18,
          itemCount: 20,
          priority: 4,
          currency: "USD",
          isDefault: false,
          autoApply: true,
          stackable: false,
          minOrderAmount: 5000,
          items: [],
          rules: [],
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-08-03T00:00:00Z",
          createdBy: "admin",
          lastUsed: "2025-08-09T11:15:00Z",
          usageCount: 67,
          totalSavings: 34200
        },
        {
          id: 5,
          name: "Early Bird Discount",
          description: "Advance booking discounts",
          code: "EARLY-001",
          category: "promotional",
          status: "draft",
          validFrom: "2025-09-01",
          validTo: "2025-12-31",
          discountType: "percentage",
          discountValue: 12,
          applicableCustomers: "all",
          customerCount: 0,
          itemCount: 25,
          priority: 5,
          currency: "USD",
          isDefault: false,
          autoApply: false,
          stackable: true,
          items: [],
          rules: [],
          createdAt: "2025-08-12T00:00:00Z",
          updatedAt: "2025-08-12T00:00:00Z",
          createdBy: "manager",
          usageCount: 0,
          totalSavings: 0
        }
      ];

      // Filter mock data based on current filters
      let filteredData = mockPricelists;
      
      if (filters.search) {
        filteredData = filteredData.filter(p => 
          p.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          p.description?.toLowerCase().includes(filters.search!.toLowerCase()) ||
          p.code.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      
      if (filters.category) {
        filteredData = filteredData.filter(p => p.category === filters.category);
      }
      
      if (filters.status) {
        filteredData = filteredData.filter(p => p.status === filters.status);
      }

      setPricelists(filteredData);
    } catch (error) {
      console.error('Error loading pricelists:', error);
      toast({
        title: "Error",
        description: "Failed to load pricelists. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Mock stats data
      const mockStats: PricelistStats = {
        totalPricelists: 5,
        activePricelists: 4,
        totalCustomers: 147,
        totalProducts: 25,
        averageDiscount: 13,
        totalSavings: 55570,
        mostUsedPricelist: "Standard Pricing",
        categoryBreakdown: {
          general: 1,
          wholesale: 1,
          retail: 0,
          vip: 1,
          promotional: 1,
          seasonal: 1
        },
        statusBreakdown: {
          active: 4,
          inactive: 0,
          draft: 1,
          expired: 0
        }
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreatePricelist = async () => {
    try {
      await pricelistService.createPricelist(formData);
      toast({
        title: "Success",
        description: "Pricelist created successfully.",
      });
      setIsDialogOpen(false);
      resetForm();
      loadPricelists();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create pricelist. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePricelist = async (id: number, updateData: UpdatePricelistRequest) => {
    try {
      await pricelistService.updatePricelist(id, updateData);
      toast({
        title: "Success",
        description: "Pricelist updated successfully.",
      });
      loadPricelists();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update pricelist. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePricelist = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this pricelist?")) return;
    
    try {
      await pricelistService.deletePricelist(id);
      toast({
        title: "Success",
        description: "Pricelist deleted successfully.",
      });
      loadPricelists();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete pricelist. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicatePricelist = async (id: number) => {
    const originalPricelist = pricelists.find(p => p.id === id);
    if (!originalPricelist) return;

    const newName = `${originalPricelist.name} (Copy)`;
    try {
      await pricelistService.duplicatePricelist(id, newName);
      toast({
        title: "Success",
        description: "Pricelist duplicated successfully.",
      });
      loadPricelists();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate pricelist. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: number, status: Pricelist['status']) => {
    try {
      await pricelistService.updatePricelistStatus(id, status);
      toast({
        title: "Success",
        description: `Pricelist ${status} successfully.`,
      });
      loadPricelists();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update pricelist status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportPricelist = async (id: number, format: 'csv' | 'xlsx' | 'pdf') => {
    try {
      const blob = await pricelistService.exportPricelist(id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `pricelist_${id}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: `Pricelist exported as ${format.toUpperCase()} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export pricelist. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkStatusUpdate = async (status: Pricelist['status']) => {
    if (bulkSelection.length === 0) return;
    
    try {
      await pricelistService.bulkUpdateStatus(bulkSelection, status);
      toast({
        title: "Success",
        description: `${bulkSelection.length} pricelists updated successfully.`,
      });
      setBulkSelection([]);
      loadPricelists();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update pricelists. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      code: "",
      category: "general",
      validFrom: new Date().toISOString().split('T')[0],
      discountType: "none",
      discountValue: 0,
      applicableCustomers: "all",
      priority: 1,
      currency: "USD",
      isDefault: false,
      autoApply: false,
      stackable: false
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "draft": return "bg-gray-100 text-gray-800 border-gray-200";
      case "expired": return "bg-red-100 text-red-800 border-red-200";
      case "inactive": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "general": return "bg-blue-100 text-blue-800 border-blue-200";
      case "wholesale": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "retail": return "bg-green-100 text-green-800 border-green-200";
      case "vip": return "bg-purple-100 text-purple-800 border-purple-200";
      case "promotional": return "bg-pink-100 text-pink-800 border-pink-200";
      case "seasonal": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
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
            <p className="mt-4 text-muted-foreground">Loading pricelists...</p>
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
            <h2 className="text-3xl font-bold tracking-tight">Pricelists</h2>
            <p className="text-muted-foreground">
              Manage pricing strategies, discounts, and promotional offers
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {bulkSelection.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {bulkSelection.length} selected
                </span>
                <Select onValueChange={(value) => handleBulkStatusUpdate(value as Pricelist['status'])}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Bulk Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activate</SelectItem>
                    <SelectItem value="inactive">Deactivate</SelectItem>
                    <SelectItem value="draft">Set to Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button variant="outline" onClick={() => setIsCalculatorDialogOpen(true)}>
              <Calculator className="w-4 h-4 mr-2" />
              Price Calculator
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Pricelist
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Pricelist</DialogTitle>
                  <DialogDescription>
                    Create a new pricing strategy for your customers
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter pricelist name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">Code</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="Enter pricelist code"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter pricelist description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="wholesale">Wholesale</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="vip">VIP</SelectItem>
                          <SelectItem value="promotional">Promotional</SelectItem>
                          <SelectItem value="seasonal">Seasonal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Input
                        id="priority"
                        type="number"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discountType">Discount Type</Label>
                      <Select value={formData.discountType} onValueChange={(value) => setFormData({ ...formData, discountType: value as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Discount</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discountValue">Discount Value</Label>
                      <Input
                        id="discountValue"
                        type="number"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="validFrom">Valid From</Label>
                      <Input
                        id="validFrom"
                        type="date"
                        value={formData.validFrom}
                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="validTo">Valid To</Label>
                      <Input
                        id="validTo"
                        type="date"
                        value={formData.validTo || ""}
                        onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="autoApply"
                        checked={formData.autoApply}
                        onCheckedChange={(checked) => setFormData({ ...formData, autoApply: checked as boolean })}
                      />
                      <Label htmlFor="autoApply">Auto-apply to applicable customers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="stackable"
                        checked={formData.stackable}
                        onCheckedChange={(checked) => setFormData({ ...formData, stackable: checked as boolean })}
                      />
                      <Label htmlFor="stackable">Allow stacking with other pricelists</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isDefault"
                        checked={formData.isDefault}
                        onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked as boolean })}
                      />
                      <Label htmlFor="isDefault">Set as default pricelist</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePricelist}>
                    Create Pricelist
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
                <CardTitle className="text-sm font-medium">Total Pricelists</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPricelists}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activePricelists} active
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Lists</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.activePricelists}
                </div>
                <p className="text-xs text-muted-foreground">Currently effective</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customers</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalCustomers}
                </div>
                <p className="text-xs text-muted-foreground">Total coverage</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <Package className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.totalProducts}
                </div>
                <p className="text-xs text-muted-foreground">In pricelists</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Discount</CardTitle>
                <Percent className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.averageDiscount}%
                </div>
                <p className="text-xs text-muted-foreground">Across active lists</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalSavings)}
                </div>
                <p className="text-xs text-muted-foreground">Customer savings</p>
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
                    placeholder="Search pricelists..."
                    value={filters.search || ""}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                  />
                </div>
                <Select value={filters.category || "all"} onValueChange={(value) => setFilters({ ...filters, category: value === "all" ? undefined : value as any })}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="wholesale">Wholesale</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.status || "all"} onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? undefined : value as any })}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricelists Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pricelists.map((pricelist) => (
            <Card key={pricelist.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={bulkSelection.includes(pricelist.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setBulkSelection([...bulkSelection, pricelist.id]);
                        } else {
                          setBulkSelection(bulkSelection.filter(id => id !== pricelist.id));
                        }
                      }}
                    />
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{pricelist.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{pricelist.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>Code: {pricelist.code}</span>
                        <span>•</span>
                        <span>Priority: #{pricelist.priority}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Badge className={getStatusColor(pricelist.status)}>
                      {pricelist.status}
                    </Badge>
                    <Badge className={getCategoryColor(pricelist.category)}>
                      {pricelist.category}
                    </Badge>
                    {pricelist.isDefault && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <Star className="w-3 h-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Discount</p>
                    <p className="font-bold text-green-600">
                      {pricelist.discountValue > 0 ? (
                        pricelist.discountType === 'percentage' ? 
                          `${pricelist.discountValue}%` : 
                          formatCurrency(pricelist.discountValue)
                      ) : "No discount"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Savings</p>
                    <p className="font-bold text-blue-600">
                      {formatCurrency(pricelist.totalSavings)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Customers</p>
                    <p className="font-bold">{pricelist.customerCount}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Items</p>
                    <p className="font-bold">{pricelist.itemCount}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {formatDate(pricelist.validFrom)} - {pricelist.validTo ? formatDate(pricelist.validTo) : 'No end date'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Activity className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Used {pricelist.usageCount} times
                    </span>
                  </div>
                  {pricelist.lastUsed && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Last used: {formatDate(pricelist.lastUsed)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPricelist(pricelist);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPricelist(pricelist);
                        setFormData({
                          name: pricelist.name,
                          description: pricelist.description || "",
                          code: pricelist.code,
                          category: pricelist.category,
                          validFrom: pricelist.validFrom,
                          validTo: pricelist.validTo,
                          discountType: pricelist.discountType,
                          discountValue: pricelist.discountValue,
                          applicableCustomers: pricelist.applicableCustomers,
                          priority: pricelist.priority,
                          currency: pricelist.currency,
                          isDefault: pricelist.isDefault,
                          autoApply: pricelist.autoApply,
                          stackable: pricelist.stackable,
                          minOrderAmount: pricelist.minOrderAmount,
                          maxOrderAmount: pricelist.maxOrderAmount
                        });
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicatePricelist(pricelist.id)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Select onValueChange={(value) => handleExportPricelist(pricelist.id, value as any)}>
                      <SelectTrigger className="w-8 h-8">
                        <Download className="w-4 h-4" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">Export CSV</SelectItem>
                        <SelectItem value="xlsx">Export Excel</SelectItem>
                        <SelectItem value="pdf">Export PDF</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePricelist(pricelist.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Select value={pricelist.status} onValueChange={(value) => handleStatusChange(pricelist.id, value as any)}>
                    <SelectTrigger className="w-24 h-8">
                      <ArrowUpDown className="w-3 h-3" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View Pricelist Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>{selectedPricelist?.name}</DialogTitle>
              <DialogDescription>{selectedPricelist?.description}</DialogDescription>
            </DialogHeader>
            {selectedPricelist && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Basic Information</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Code:</span>
                          <span className="text-sm font-medium">{selectedPricelist.code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Category:</span>
                          <Badge className={getCategoryColor(selectedPricelist.category)}>
                            {selectedPricelist.category}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Status:</span>
                          <Badge className={getStatusColor(selectedPricelist.status)}>
                            {selectedPricelist.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Priority:</span>
                          <span className="text-sm font-medium">#{selectedPricelist.priority}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Discount Details</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Type:</span>
                          <span className="text-sm font-medium">{selectedPricelist.discountType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Value:</span>
                          <span className="text-sm font-medium text-green-600">
                            {selectedPricelist.discountValue > 0 ? (
                              selectedPricelist.discountType === 'percentage' ? 
                                `${selectedPricelist.discountValue}%` : 
                                formatCurrency(selectedPricelist.discountValue)
                            ) : "No discount"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Total Savings:</span>
                          <span className="text-sm font-medium text-blue-600">
                            {formatCurrency(selectedPricelist.totalSavings)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Validity Period</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Valid From:</span>
                          <span className="text-sm font-medium">{formatDate(selectedPricelist.validFrom)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Valid To:</span>
                          <span className="text-sm font-medium">
                            {selectedPricelist.validTo ? formatDate(selectedPricelist.validTo) : 'No end date'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Usage Statistics</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Customers:</span>
                          <span className="text-sm font-medium">{selectedPricelist.customerCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Items:</span>
                          <span className="text-sm font-medium">{selectedPricelist.itemCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Usage Count:</span>
                          <span className="text-sm font-medium">{selectedPricelist.usageCount}</span>
                        </div>
                        {selectedPricelist.lastUsed && (
                          <div className="flex justify-between">
                            <span className="text-sm">Last Used:</span>
                            <span className="text-sm font-medium">{formatDate(selectedPricelist.lastUsed)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Settings</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPricelist.isDefault && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <Star className="w-3 h-3 mr-1" />
                        Default
                      </Badge>
                    )}
                    {selectedPricelist.autoApply && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <Zap className="w-3 h-3 mr-1" />
                        Auto-apply
                      </Badge>
                    )}
                    {selectedPricelist.stackable && (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                        <Layers className="w-3 h-3 mr-1" />
                        Stackable
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                if (selectedPricelist) {
                  setFormData({
                    name: selectedPricelist.name,
                    description: selectedPricelist.description || "",
                    code: selectedPricelist.code,
                    category: selectedPricelist.category,
                    validFrom: selectedPricelist.validFrom,
                    validTo: selectedPricelist.validTo,
                    discountType: selectedPricelist.discountType,
                    discountValue: selectedPricelist.discountValue,
                    applicableCustomers: selectedPricelist.applicableCustomers,
                    priority: selectedPricelist.priority,
                    currency: selectedPricelist.currency,
                    isDefault: selectedPricelist.isDefault,
                    autoApply: selectedPricelist.autoApply,
                    stackable: selectedPricelist.stackable,
                    minOrderAmount: selectedPricelist.minOrderAmount,
                    maxOrderAmount: selectedPricelist.maxOrderAmount
                  });
                  setIsViewDialogOpen(false);
                  setIsDialogOpen(true);
                }
              }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Price Calculator Dialog */}
        <Dialog open={isCalculatorDialogOpen} onOpenChange={setIsCalculatorDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Price Calculator</DialogTitle>
              <DialogDescription>
                Calculate pricing for products with applicable pricelists
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Product</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Premium Sound System</SelectItem>
                    <SelectItem value="2">LED Stage Lighting</SelectItem>
                    <SelectItem value="3">Wedding Decoration Set</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" placeholder="Enter quantity" min="1" />
              </div>
              <div className="space-y-2">
                <Label>Customer (Optional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">John Smith</SelectItem>
                    <SelectItem value="2">Sarah Johnson</SelectItem>
                    <SelectItem value="3">Corporate Events Inc.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium">Price Calculation</h4>
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span className="font-medium">$500.00</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount (Premium 15%):</span>
                  <span className="font-medium">-$75.00</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold">
                  <span>Final Price:</span>
                  <span>$425.00</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCalculatorDialogOpen(false)}>
                Close
              </Button>
              <Button>Calculate Price</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Pricelists;
