import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  ClipboardList, 
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Send,
  X,
  Loader2
} from "lucide-react";
import quotationsService, { Quotation as ApiQuotation } from "@/services/quotationsService";

const Quotations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [quotations, setQuotations] = useState<ApiQuotation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch quotations on component mount
  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const response = await quotationsService.getQuotations({
        page: 1,
        limit: 50,
        search: searchTerm
      });
      setQuotations(response.data.quotations);
    } catch (error) {
      console.error('Error loading quotations:', error);
      // Fallback to mock data if API fails
      setQuotations(mockQuotations);
      toast({
        title: "Using Demo Data",
        description: "Connected to demo data while backend is starting up.",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock data as fallback
  const mockQuotations: ApiQuotation[] = [
    {
      id: 1,
      quotationNumber: "QUO-001",
      customerId: 1,
      customer: {
        id: 1,
        name: "Rajesh Kumar",
        email: "rajesh@email.com",
        phone: "+91 9876543210",
        customerCode: "CUST-001"
      },
      proposedStartDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      proposedEndDate: new Date(Date.now() + 10 * 86400000).toISOString(),
      validUntil: new Date(Date.now() + 14 * 86400000).toISOString(),
      pickupLocation: { address: "Bangalore Convention Center", coordinates: null },
      returnLocation: { address: "Bangalore Convention Center", coordinates: null },
      deliveryRequired: true,
      pickupRequired: true,
      subtotal: 12000,
      discountAmount: 0,
      discountType: 'fixed' as const,
      taxAmount: 2160,
      taxRate: 18,
      deliveryCharges: 500,
      totalAmount: 14660,
      securityDeposit: 5000,
      status: "draft" as const,
      notes: "Client prefers morning delivery",
      termsConditions: "Standard terms and conditions apply",
      internalNotes: "Professional camera setup for corporate event",
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 1
    },
    {
      id: 2,
      quotationNumber: "QUO-002",
      customerId: 2,
      customer: {
        id: 2,
        name: "Priya Sharma",
        email: "priya@email.com",
        phone: "+91 9876543211",
        customerCode: "CUST-002"
      },
      proposedStartDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      proposedEndDate: new Date(Date.now() + 15 * 86400000).toISOString(),
      validUntil: new Date(Date.now() + 21 * 86400000).toISOString(),
      pickupLocation: { address: "Garden Palace Wedding Hall", coordinates: null },
      returnLocation: { address: "Garden Palace Wedding Hall", coordinates: null },
      deliveryRequired: true,
      pickupRequired: true,
      subtotal: 25000,
      discountAmount: 2500,
      discountType: 'fixed' as const,
      taxAmount: 4050,
      taxRate: 18,
      deliveryCharges: 1000,
      totalAmount: 27550,
      securityDeposit: 10000,
      status: "sent" as const,
      notes: "Premium decoration package requested",
      termsConditions: "50% advance required for booking",
      internalNotes: "Complete wedding decoration and setup",
      sentAt: new Date(Date.now() - 86400000).toISOString(),
      items: [],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      createdBy: 1
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Draft", className: "bg-gray-100 text-gray-800" },
      sent: { label: "Sent", className: "bg-blue-100 text-blue-800" },
      viewed: { label: "Viewed", className: "bg-purple-100 text-purple-800" },
      accepted: { label: "Accepted", className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
      expired: { label: "Expired", className: "bg-red-100 text-red-800" },
      converted: { label: "Converted", className: "bg-green-100 text-green-800" },
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
        return <Send className="w-4 h-4 text-blue-500" />;
      case "viewed":
        return <Eye className="w-4 h-4 text-purple-500" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <X className="w-4 h-4 text-red-500" />;
      case "expired":
        return <Clock className="w-4 h-4 text-red-500" />;
      case "converted":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <ClipboardList className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredQuotations = quotations.filter(quotation =>
    quotation.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quotation.id.toString().includes(searchTerm)
  );

  return (
    <Layout>
      <div className="flex-1 space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Rental Quotations</h2>
            <p className="text-muted-foreground">
              Manage and track all rental quotations
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Quotation
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">124</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">71.8% conversion rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">Awaiting customer response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹3.2L</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search quotations by customer, product, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* Quotations List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Quotations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredQuotations.map((quotation) => (
                <div
                  key={quotation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold">{quotation.quotationNumber}</span>
                      {getStatusIcon(quotation.status)}
                      {getStatusBadge(quotation.status)}
                    </div>
                    <p className="text-sm font-medium">{quotation.customer?.name || 'No Customer'}</p>
                    <p className="text-sm text-muted-foreground">Items: {quotation.items?.length || 0} product(s)</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Start: {new Date(quotation.proposedStartDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Valid until: {new Date(quotation.validUntil).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Created: {new Date(quotation.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-2">
                    <p className="text-lg font-bold">₹{quotation.totalAmount.toLocaleString()}</p>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      {quotation.status === "accepted" && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Convert to Order
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
    </Layout>
  );
};

export default Quotations;
