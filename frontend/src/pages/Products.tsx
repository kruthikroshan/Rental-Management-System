import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Package, Search, Star, Calendar, MapPin, Filter, Eye, ShoppingCart, Plus, Minus, Heart, Share2, Clock, Shield, Truck, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import bookingService, { Product, Category } from '../services/enhancedBookingService';
import { useToast } from '../hooks/use-toast';

interface BookingItem {
  productId: number;
  productName: string;
  productSku: string;
  productImage?: string;
  category: string;
  quantity: number;
  unitRate: number;
  duration: number;
  durationType: 'hour' | 'day' | 'week' | 'month' | 'year';
  securityDepositPerUnit: number;
  specifications?: { [key: string]: string };
  notes?: string;
}

interface BookingCart {
  items: BookingItem[];
  startDate: string;
  endDate: string;
  deliveryRequired: boolean;
  pickupRequired: boolean;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bookingCart, setBookingCart] = useState<BookingCart>({
    items: [],
    startDate: '',
    endDate: '',
    deliveryRequired: false,
    pickupRequired: false
  });
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showCartDialog, setShowCartDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingDates, setBookingDates] = useState({
    startDate: '',
    endDate: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsResponse, categoriesResponse] = await Promise.all([
        bookingService.getAvailableProducts({
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }),
        bookingService.getCategories()
      ]);

      if (productsResponse.success) {
        setProducts(productsResponse.data.products);
      }

      if (categoriesResponse.success) {
        setCategories([{ id: 0, name: 'All Categories', slug: 'all', isActive: true, productsCount: 0 }, ...categoriesResponse.data]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    const matchesPrice = product.baseRentalRate >= priceRange[0] && product.baseRentalRate <= priceRange[1];
    const matchesAvailability = availabilityFilter === 'all' || 
                               (availabilityFilter === 'available' && product.availableQuantity > 0) ||
                               (availabilityFilter === 'limited' && product.availableQuantity > 0 && product.availableQuantity <= 2) ||
                               (availabilityFilter === 'out_of_stock' && product.availableQuantity === 0);
    
    return matchesSearch && matchesCategory && matchesPrice && matchesAvailability;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.baseRentalRate - b.baseRentalRate;
      case 'price-high':
        return b.baseRentalRate - a.baseRentalRate;
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
        return b.popularityScore - a.popularityScore;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const addToCart = (product: Product, quantity: number = 1, duration: number = 1) => {
    if (!bookingDates.startDate || !bookingDates.endDate) {
      toast({
        title: "Select Dates",
        description: "Please select booking dates first.",
        variant: "destructive"
      });
      return;
    }

    const existingItemIndex = bookingCart.items.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...bookingCart.items];
      updatedItems[existingItemIndex].quantity += quantity;
      setBookingCart(prev => ({ ...prev, items: updatedItems }));
    } else {
      const newItem: BookingItem = {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        productImage: product.images[0]?.url,
        category: product.category.name,
        quantity,
        unitRate: product.baseRentalRate,
        duration,
        durationType: product.rentalUnits as any,
        securityDepositPerUnit: product.securityDeposit,
        specifications: product.specifications
      };
      
      setBookingCart(prev => ({
        ...prev,
        items: [...prev.items, newItem],
        startDate: bookingDates.startDate,
        endDate: bookingDates.endDate
      }));
    }

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your booking cart.`,
    });
  };

  const removeFromCart = (productId: number) => {
    setBookingCart(prev => ({
      ...prev,
      items: prev.items.filter(item => item.productId !== productId)
    }));
  };

  const updateCartItemQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setBookingCart(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.productId === productId ? { ...item, quantity } : item
      )
    }));
  };

  const calculateCartTotal = () => {
    return bookingCart.items.reduce((total, item) => {
      return total + (item.unitRate * item.quantity * item.duration);
    }, 0);
  };

  const calculateSecurityDeposit = () => {
    return bookingCart.items.reduce((total, item) => {
      return total + (item.securityDepositPerUnit * item.quantity);
    }, 0);
  };

  const getAvailabilityStatus = (product: Product) => {
    if (product.availableQuantity === 0) {
      return { status: 'out_of_stock', text: 'Out of Stock', color: 'destructive' };
    } else if (product.availableQuantity <= 2) {
      return { status: 'limited', text: `Only ${product.availableQuantity} left`, color: 'warning' };
    } else {
      return { status: 'available', text: `${product.availableQuantity} available`, color: 'success' };
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'needs_repair': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Product Catalog</h1>
          <p className="text-gray-600 mt-1">Browse and rent equipment for your events</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {sortedProducts.length} Products Available
          </Badge>
          {bookingCart.items.length > 0 && (
            <Button 
              onClick={() => setShowCartDialog(true)}
              className="relative"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart ({bookingCart.items.length})
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {bookingCart.items.reduce((sum, item) => sum + item.quantity, 0)}
              </Badge>
            </Button>
          )}
        </div>
      </div>

      {/* Booking Dates Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Booking Dates
          </CardTitle>
          <CardDescription>Choose your rental period to check availability and pricing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={bookingDates.startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setBookingDates(prev => ({ ...prev, startDate: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={bookingDates.endDate}
                min={bookingDates.startDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setBookingDates(prev => ({ ...prev, endDate: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          {bookingDates.startDate && bookingDates.endDate && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Rental period: {Math.ceil((new Date(bookingDates.endDate).getTime() - new Date(bookingDates.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory.toString()} onValueChange={(value) => setSelectedCategory(value === 'all' ? 'all' : parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Availability Filter */}
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="limited">Limited Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="price-low">Price (Low to High)</SelectItem>
                <SelectItem value="price-high">Price (High to Low)</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProducts.map((product) => {
          const availability = getAvailabilityStatus(product);
          return (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {product.images.length > 0 ? (
                  <img 
                    src={product.images[0].url} 
                    alt={product.images[0].altText}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                
                {/* Overlay badges */}
                <div className="absolute top-2 left-2 space-y-1">
                  <Badge className={getConditionColor(product.condition)}>
                    {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
                  </Badge>
                  {product.isFeatured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Featured
                    </Badge>
                  )}
                </div>

                {/* Action buttons */}
                <div className="absolute top-2 right-2 space-y-1">
                  <Button size="sm" variant="outline" className="p-2 bg-white/80 hover:bg-white">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="p-2 bg-white/80 hover:bg-white">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Availability badge */}
                <div className="absolute bottom-2 left-2">
                  <Badge 
                    variant={availability.color as any} 
                    className={
                      availability.status === 'available' ? 'bg-green-100 text-green-800' :
                      availability.status === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }
                  >
                    {availability.text}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold line-clamp-1">{product.name}</CardTitle>
                    <CardDescription className="text-sm">{product.category.name}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-xs text-gray-500">({product.reviewCount})</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

                {/* Pricing */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-green-600">₹{product.baseRentalRate.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">/{product.rentalUnits}</span>
                  </div>
                  <p className="text-xs text-gray-500">Security Deposit: ₹{product.securityDeposit.toLocaleString()}</p>
                </div>

                {/* Key Features */}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-1">Key Features:</h5>
                    <div className="space-y-1">
                      {Object.entries(product.specifications).slice(0, 2).map(([key, value]) => (
                        <p key={key} className="text-xs text-gray-600">• {key}: {value}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {product.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{product.name}</DialogTitle>
                        <DialogDescription>{product.category.name}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* Product Images */}
                        <div className="grid grid-cols-2 gap-2">
                          {product.images.length > 0 ? (
                            product.images.map((image) => (
                              <img 
                                key={image.id}
                                src={image.url} 
                                alt={image.altText}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            ))
                          ) : (
                            <div className="col-span-2 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Description</h4>
                          <p className="text-sm text-gray-600">{product.description}</p>
                        </div>

                        {/* Specifications */}
                        {product.specifications && (
                          <div>
                            <h4 className="font-semibold mb-2">Specifications</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {Object.entries(product.specifications).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-sm">
                                  <span className="text-gray-600">{key}:</span>
                                  <span className="font-medium">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Pricing Details */}
                        <div>
                          <h4 className="font-semibold mb-2">Pricing</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Rental Rate:</span>
                              <span className="font-medium">₹{product.baseRentalRate.toLocaleString()}/{product.rentalUnits}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Security Deposit:</span>
                              <span className="font-medium">₹{product.securityDeposit.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Min. Rental Period:</span>
                              <span className="font-medium">{product.minRentalDuration} {product.rentalUnits}(s)</span>
                            </div>
                          </div>
                        </div>

                        {/* Availability */}
                        <div>
                          <h4 className="font-semibold mb-2">Availability</h4>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-2 bg-green-50 rounded">
                              <p className="text-lg font-bold text-green-600">{product.availableQuantity}</p>
                              <p className="text-xs text-green-700">Available</p>
                            </div>
                            <div className="p-2 bg-yellow-50 rounded">
                              <p className="text-lg font-bold text-yellow-600">{product.reservedQuantity}</p>
                              <p className="text-xs text-yellow-700">Reserved</p>
                            </div>
                            <div className="p-2 bg-red-50 rounded">
                              <p className="text-lg font-bold text-red-600">{product.maintenanceQuantity}</p>
                              <p className="text-xs text-red-700">Maintenance</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => addToCart(product)}
                    disabled={product.availableQuantity === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {sortedProducts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search criteria.</p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setAvailabilityFilter('all');
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Shopping Cart Dialog */}
      <Dialog open={showCartDialog} onOpenChange={setShowCartDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Booking Cart ({bookingCart.items.length} items)
            </DialogTitle>
            <DialogDescription>
              Review your selected items and proceed to booking
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Booking Period */}
            {bookingCart.startDate && bookingCart.endDate && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Booking Period
                </h4>
                <p className="text-sm">
                  {new Date(bookingCart.startDate).toLocaleDateString()} - {new Date(bookingCart.endDate).toLocaleDateString()}
                  ({Math.ceil((new Date(bookingCart.endDate).getTime() - new Date(bookingCart.startDate).getTime()) / (1000 * 60 * 60 * 24))} days)
                </p>
              </div>
            )}

            {/* Cart Items */}
            <div className="space-y-3">
              {bookingCart.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Package className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h5 className="font-medium">{item.productName}</h5>
                    <p className="text-sm text-gray-600">{item.category}</p>
                    <p className="text-sm text-green-600">₹{item.unitRate.toLocaleString()}/{item.durationType}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
                      className="p-1 h-8 w-8"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                      className="p-1 h-8 w-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">₹{(item.unitRate * item.quantity * item.duration).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">({item.quantity} × {item.duration} {item.durationType})</p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1 h-8 w-8 text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            {bookingCart.items.length > 0 && (
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Rental Total:</span>
                    <span className="font-medium">₹{calculateCartTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Deposit:</span>
                    <span className="font-medium">₹{calculateSecurityDeposit().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (18%):</span>
                    <span className="font-medium">₹{(calculateCartTotal() * 0.18).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      <span>₹{(calculateCartTotal() * 1.18).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty Cart */}
            {bookingCart.items.length === 0 && (
              <div className="text-center py-8">
                <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h4 className="text-lg font-semibold mb-2">Your cart is empty</h4>
                <p className="text-gray-600">Add some products to get started with your booking.</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCartDialog(false)}>
              Continue Shopping
            </Button>
            {bookingCart.items.length > 0 && (
              <Button className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Proceed to Booking
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
