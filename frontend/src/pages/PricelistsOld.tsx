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
  Star
} from "lucide-react";

const Pricelists = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Sample pricelists data
  const pricelists = [
    {
      id: "PL-001",
      name: "Standard Pricing",
      description: "Default pricing for all customers",
      category: "general",
      status: "active",
      validFrom: "2025-01-01",
      validTo: "2025-12-31",
      discountType: "none",
      discountValue: 0,
      applicableCustomers: "all",
      customerCount: 147,
      itemCount: 25,
      lastUpdated: "2025-08-10",
      priority: 1,
      rules: [
        { condition: "quantity >= 1", discount: 0, description: "Standard rate" }
      ]
    },
    {
      id: "PL-002",
      name: "Premium Customer Pricing",
      description: "Special pricing for premium customers",
      category: "customer-tier",
      status: "active",
      validFrom: "2025-01-01",
      validTo: "2025-12-31",
      discountType: "percentage",
      discountValue: 15,
      applicableCustomers: "premium",
      customerCount: 23,
      itemCount: 25,
      lastUpdated: "2025-08-08",
      priority: 2,
      rules: [
        { condition: "customer_tier = premium", discount: 15, description: "15% discount for premium customers" },
        { condition: "quantity >= 5", discount: 20, description: "Additional 5% for bulk orders" }
      ]
    },
    {
      id: "PL-003",
      name: "Wedding Season Special",
      description: "Special pricing for wedding events",
      category: "seasonal",
      status: "active",
      validFrom: "2025-10-01",
      validTo: "2025-03-31",
      discountType: "percentage",
      discountValue: 10,
      applicableCustomers: "all",
      customerCount: 147,
      itemCount: 12,
      lastUpdated: "2025-08-05",
      priority: 3,
      rules: [
        { condition: "event_type = wedding", discount: 10, description: "10% off wedding bookings" },
        { condition: "duration >= 3", discount: 15, description: "Additional 5% for 3+ days" }
      ]
    },
    {
      id: "PL-004",
      name: "Corporate Pricing",
      description: "B2B pricing for corporate clients",
      category: "business",
      status: "active",
      validFrom: "2025-01-01",
      validTo: "2025-12-31",
      discountType: "percentage",
      discountValue: 25,
      applicableCustomers: "corporate",
      customerCount: 18,
      itemCount: 20,
      lastUpdated: "2025-08-03",
      priority: 4,
      rules: [
        { condition: "customer_type = corporate", discount: 25, description: "25% corporate discount" },
        { condition: "order_value >= 50000", discount: 30, description: "Additional 5% for large orders" }
      ]
    },
    {
      id: "PL-005",
      name: "Early Bird Discount",
      description: "Advance booking discounts",
      category: "promotional",
      status: "draft",
      validFrom: "2025-09-01",
      validTo: "2025-12-31",
      discountType: "percentage",
      discountValue: 12,
      applicableCustomers: "all",
      customerCount: 0,
      itemCount: 25,
      lastUpdated: "2025-08-12",
      priority: 5,
      rules: [
        { condition: "advance_booking >= 30", discount: 12, description: "12% off for 30+ days advance booking" },
        { condition: "advance_booking >= 60", discount: 18, description: "Additional 6% for 60+ days advance" }
      ]
    }
  ];

  const filteredPricelists = pricelists.filter(pricelist => {
    const matchesSearch = pricelist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pricelist.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pricelist.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || pricelist.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "draft": return "bg-gray-100 text-gray-800";
      case "expired": return "bg-red-100 text-red-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "general": return "bg-blue-100 text-blue-800";
      case "customer-tier": return "bg-purple-100 text-purple-800";
      case "seasonal": return "bg-orange-100 text-orange-800";
      case "business": return "bg-indigo-100 text-indigo-800";
      case "promotional": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalStats = {
    totalPricelists: pricelists.length,
    activePricelists: pricelists.filter(p => p.status === "active").length,
    totalCustomers: pricelists.reduce((sum, p) => sum + p.customerCount, 0),
    avgDiscount: Math.round(pricelists.filter(p => p.discountValue > 0).reduce((sum, p) => sum + p.discountValue, 0) / pricelists.filter(p => p.discountValue > 0).length)
  };

  const createPricelist = () => {
    console.log("Creating new pricelist");
  };

  const editPricelist = (pricelistId: string) => {
    console.log("Editing pricelist:", pricelistId);
  };

  const duplicatePricelist = (pricelistId: string) => {
    console.log("Duplicating pricelist:", pricelistId);
  };

  const deletePricelist = (pricelistId: string) => {
    console.log("Deleting pricelist:", pricelistId);
  };

  return (
    <Layout>
      <div className="flex-1 space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Pricelists</h2>
            <p className="text-muted-foreground">
              Manage pricing strategies and discounts
            </p>
          </div>
          <Button onClick={createPricelist} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Pricelist
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pricelists</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalPricelists}</div>
              <p className="text-xs text-muted-foreground">
                {totalStats.activePricelists} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Pricelists</CardTitle>
              <Star className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalStats.activePricelists}
              </div>
              <p className="text-xs text-muted-foreground">Currently effective</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Covered Customers</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalStats.totalCustomers}
              </div>
              <p className="text-xs text-muted-foreground">Total coverage</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Discount</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {totalStats.avgDiscount}%
              </div>
              <p className="text-xs text-muted-foreground">Across active lists</p>
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
                    placeholder="Search pricelists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Categories</option>
                  <option value="general">General</option>
                  <option value="customer-tier">Customer Tier</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="business">Business</option>
                  <option value="promotional">Promotional</option>
                </select>
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pricelists Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPricelists.map((pricelist) => (
            <Card key={pricelist.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{pricelist.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{pricelist.description}</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Badge className={getStatusColor(pricelist.status)}>
                      {pricelist.status}
                    </Badge>
                    <Badge className={getCategoryColor(pricelist.category)}>
                      {pricelist.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Discount</p>
                    <p className="font-bold text-green-600">
                      {pricelist.discountValue > 0 ? `${pricelist.discountValue}%` : "No discount"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Priority</p>
                    <p className="font-bold">#{pricelist.priority}</p>
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
                      Valid: {pricelist.validFrom} to {pricelist.validTo}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Updated: {pricelist.lastUpdated}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Pricing Rules:</p>
                  <div className="space-y-1">
                    {pricelist.rules.slice(0, 2).map((rule, index) => (
                      <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                        <span className="font-medium">{rule.condition}:</span> {rule.description}
                      </div>
                    ))}
                    {pricelist.rules.length > 2 && (
                      <p className="text-xs text-muted-foreground">
                        +{pricelist.rules.length - 2} more rules
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editPricelist(pricelist.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => duplicatePricelist(pricelist.id)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePricelist(pricelist.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ID: {pricelist.id}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Pricelists;
