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
  Package, 
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Filter,
  Loader2
} from "lucide-react";
import productsService, { Product as ApiProduct } from "@/services/productsService";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { toast } = useToast();

  // Fetch products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsService.getProducts({
        page: 1,
        limit: 50,
        search: searchTerm,
        categoryId: selectedCategory ? parseInt(selectedCategory) : undefined
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error loading products:', error);
      // Fallback to mock data if API fails
      setProducts(mockProducts);
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
  const mockProducts: ApiProduct[] = [
    {
      id: 1,
      name: "Professional Camera Kit",
      slug: "professional-camera-kit",
      sku: "PRD-001",
      description: "Complete professional photography setup with DSLR, lenses, and accessories",
      baseRentalRate: 2000,
      securityDeposit: 10000,
      categoryId: 1,
      category: {
        id: 1,
        name: "Photography"
      },
      condition: "excellent",
      rentalUnits: "day",
      minRentalDuration: 1,
      isRentable: true,
      totalQuantity: 5,
      availableQuantity: 3,
      reservedQuantity: 1,
      maintenanceQuantity: 0,
      tags: ["camera", "photography", "professional"],
      images: [],
      isActive: true,
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      name: "Wedding Decoration Set",
      slug: "wedding-decoration-set",
      sku: "PRD-002",
      description: "Complete wedding decoration package including flowers, lights, and setup",
      baseRentalRate: 15000,
      securityDeposit: 25000,
      categoryId: 2,
      category: {
        id: 2,
        name: "Events"
      },
      condition: "good",
      rentalUnits: "day",
      minRentalDuration: 1,
      isRentable: true,
      totalQuantity: 3,
      availableQuantity: 2,
      reservedQuantity: 0,
      maintenanceQuantity: 0,
      tags: ["wedding", "decoration", "events"],
      images: [],
      isActive: true,
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      name: "Sound System Pro",
      slug: "sound-system-pro",
      sku: "PRD-003",
      description: "Professional grade sound system with speakers, microphones, and mixing console",
      baseRentalRate: 3000,
      securityDeposit: 15000,
      categoryId: 3,
      category: {
        id: 3,
        name: "Audio"
      },
      condition: "excellent",
      rentalUnits: "day",
      minRentalDuration: 1,
      isRentable: true,
      totalQuantity: 4,
      availableQuantity: 1,
      reservedQuantity: 0,
      maintenanceQuantity: 0,
      tags: ["audio", "sound", "professional"],
      images: [],
      isActive: true,
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const getAvailabilityStatus = (product: ApiProduct) => {
    if (product.availableQuantity > 0) return "available";
    if (product.maintenanceQuantity > 0) return "maintenance";
    return "unavailable";
  };

  const getAvailabilityColor = (product: ApiProduct) => {
    const status = getAvailabilityStatus(product);
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = async () => {
    await loadProducts();
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await productsService.deleteProduct(productId);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      loadProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading products...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your rental inventory</p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter by Category
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Product Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {products.filter(p => getAvailabilityStatus(p) === "available").length}
                </p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {products.filter(p => p.totalQuantity - p.availableQuantity - p.maintenanceQuantity > 0).length}
                </p>
                <p className="text-sm text-muted-foreground">On Rent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {products.filter(p => getAvailabilityStatus(p) === "maintenance").length}
                </p>
                <p className="text-sm text-muted-foreground">Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{product.category.name}</p>
                </div>
                <Badge className={getAvailabilityColor(product)}>
                  {getAvailabilityStatus(product)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{product.description}</p>
              
              {/* Pricing */}
              <div className="space-y-2">
                <h4 className="font-medium">Pricing:</h4>
                <div className="text-sm space-y-1">
                  <p>₹{product.baseRentalRate}/{product.rentalUnits}</p>
                  {product.securityDeposit && (
                    <p className="text-muted-foreground">Security: ₹{product.securityDeposit}</p>
                  )}
                </div>
              </div>
              
              {/* Availability */}
              <div>
                <h4 className="font-medium mb-1">Availability:</h4>
                <p className="text-sm text-muted-foreground">
                  {product.availableQuantity} of {product.totalQuantity} units available
                </p>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>
    </Layout>
  );
}
