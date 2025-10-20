import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Package, 
  DollarSign, 
  Calendar, 
  Clock, 
  Shield, 
  Truck, 
  Image as ImageIcon,
  Plus,
  Minus,
  Save,
  X
} from 'lucide-react';
import { Product } from '../services/enhancedBookingService';

interface RentalPeriodPricing {
  id: string;
  period: string;
  pricelist: string;
  price: number;
}

interface RentalReservationCharge {
  id: string;
  type: 'extra_hour' | 'extra_day' | 'late_return';
  label: string;
  price: number;
}

interface ProductDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  mode?: 'view' | 'edit' | 'create';
  onSave?: (product: Partial<Product>) => void;
}

export function ProductDetailModal({ 
  open, 
  onOpenChange, 
  product, 
  mode = 'view',
  onSave 
}: ProductDetailModalProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    description: product?.description || '',
    category: typeof product?.category === 'object' ? product.category.name : (product?.category || ''),
    categoryId: typeof product?.category === 'object' ? product.category.id : 0,
    basePrice: product?.baseRentalRate || 0,
    securityDeposit: product?.securityDeposit || 0,
    availableQuantity: product?.availableQuantity || 0,
    totalQuantity: product?.totalQuantity || 0,
    condition: product?.condition || 'good',
    specifications: product?.specifications || {},
    images: product?.images || [],
  });

  // Rental pricing table - calculate different periods based on baseRentalRate
  const [rentalPricing, setRentalPricing] = useState<RentalPeriodPricing[]>([
    { id: '1', period: 'Hourly', pricelist: 'Standard Rate', price: product?.baseRentalRate ? product.baseRentalRate / 24 : 0 },
    { id: '2', period: 'Daily', pricelist: 'Standard Rate', price: product?.baseRentalRate || 0 },
    { id: '3', period: 'Weekly', pricelist: 'Standard Rate', price: product?.baseRentalRate ? product.baseRentalRate * 7 * 0.9 : 0 },
    { id: '4', period: 'Monthly', pricelist: 'Standard Rate', price: product?.baseRentalRate ? product.baseRentalRate * 30 * 0.85 : 0 },
  ]);

  // Rental reservation charges
  const [reservationCharges, setReservationCharges] = useState<RentalReservationCharge[]>([
    { id: '1', type: 'extra_hour', label: 'Extra Hour', price: product?.baseRentalRate ? product.baseRentalRate / 24 * 1.5 : 0 },
    { id: '2', type: 'extra_day', label: 'Extra Days', price: product?.baseRentalRate ? product.baseRentalRate * 1.5 : 0 },
    { id: '3', type: 'late_return', label: 'Late Return Penalty', price: product?.baseRentalRate ? product.baseRentalRate * 2 : 0 },
  ]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePricingChange = (id: string, field: keyof RentalPeriodPricing, value: any) => {
    setRentalPricing(prev => 
      prev.map(item => item.id === id ? { ...item, [field]: value } : item)
    );
  };

  const handleChargeChange = (id: string, value: number) => {
    const numValue = isNaN(value) ? 0 : value;
    setReservationCharges(prev =>
      prev.map(item => item.id === id ? { ...item, price: numValue } : item)
    );
  };

  const addPricingRow = () => {
    const newId = (rentalPricing.length + 1).toString();
    setRentalPricing(prev => [
      ...prev,
      { id: newId, period: '', pricelist: 'Standard Rate', price: 0 }
    ]);
  };

  const removePricingRow = (id: string) => {
    setRentalPricing(prev => prev.filter(item => item.id !== id));
  };

  const handleSave = () => {
    if (onSave) {
      // Calculate baseRentalRate from daily pricing
      const dailyPrice = rentalPricing.find(p => p.period === 'Daily')?.price || 0;
      
      onSave({
        name: formData.name,
        sku: formData.sku,
        description: formData.description,
        baseRentalRate: dailyPrice,
        securityDeposit: formData.securityDeposit,
        availableQuantity: formData.availableQuantity,
        totalQuantity: formData.totalQuantity,
        condition: formData.condition as 'excellent' | 'good' | 'fair' | 'needs_repair',
        specifications: formData.specifications,
        categoryId: formData.categoryId,
      });
    }
    onOpenChange(false);
  };

  const isEditMode = mode === 'edit' || mode === 'create';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Package className="h-6 w-6" />
            {mode === 'create' ? 'Create New Product' : mode === 'edit' ? 'Edit Product' : 'Product Details'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Add a new product to your rental catalog' : mode === 'edit' ? 'Update product information and pricing' : 'View detailed product information'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Top Action Buttons */}
          {isEditMode && (
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-sm">
                {mode === 'create' ? '1/80' : `${product?.id || 1}/80`}
              </Badge>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          )}

          {/* Update Stock Button (only in edit mode) */}
          {mode === 'edit' && (
            <Button variant="outline" className="w-full border-2 border-purple-500 text-purple-600 hover:bg-purple-50">
              Update Stock
            </Button>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side: General Product Info */}
            <Card className="border-2">
              <CardContent className="p-6 space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">General Product Info</h3>

                {/* Product Image */}
                <div className="space-y-2">
                  <Label>Product Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    {formData.images && formData.images.length > 0 ? (
                      <img 
                        src={typeof formData.images[0] === 'string' ? formData.images[0] : formData.images[0].url} 
                        alt="Product" 
                        className="max-h-48 object-contain"
                      />
                    ) : (
                      <>
                        <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload image</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Product Name */}
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  {isEditMode ? (
                    <Input
                      id="productName"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter product name"
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded border">{formData.name}</p>
                  )}
                </div>

                {/* SKU */}
                <div className="space-y-2">
                  <Label htmlFor="sku">Product SKU</Label>
                  {isEditMode ? (
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      placeholder="Enter SKU"
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded border">{formData.sku}</p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  {isEditMode ? (
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      placeholder="Enter category"
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded border">{formData.category}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  {isEditMode ? (
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter product description"
                      rows={4}
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded border min-h-[100px]">{formData.description}</p>
                  )}
                </div>

                {/* Available Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="availableQty">Available Quantity</Label>
                    {isEditMode ? (
                      <Input
                        id="availableQty"
                        type="number"
                        value={formData.availableQuantity || 0}
                        onChange={(e) => handleInputChange('availableQuantity', parseInt(e.target.value) || 0)}
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded border">{formData.availableQuantity || 0}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalQty">Total Quantity</Label>
                    {isEditMode ? (
                      <Input
                        id="totalQty"
                        type="number"
                        value={formData.totalQuantity || 0}
                        onChange={(e) => handleInputChange('totalQuantity', parseInt(e.target.value) || 0)}
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded border">{formData.totalQuantity || 0}</p>
                    )}
                  </div>
                </div>

                {/* Condition */}
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  {isEditMode ? (
                    <Input
                      id="condition"
                      value={formData.condition}
                      onChange={(e) => handleInputChange('condition', e.target.value)}
                      placeholder="e.g., Excellent, Good, Fair"
                    />
                  ) : (
                    <Badge className="bg-green-100 text-green-800">{formData.condition}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right Side: Rental Pricing */}
            <Card className="border-2">
              <CardContent className="p-6 space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">Rental Pricing</h3>

                {/* Rental Period Pricing Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Rental Period Pricing</Label>
                    {isEditMode && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={addPricingRow}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Row
                      </Button>
                    )}
                  </div>

                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
                    <div className="col-span-4">Rental Period</div>
                    <div className="col-span-4">Pricelist</div>
                    <div className="col-span-3">Price (Rs)</div>
                    {isEditMode && <div className="col-span-1"></div>}
                  </div>

                  {/* Table Rows */}
                  <div className="space-y-2">
                    {rentalPricing.map((pricing) => (
                      <div key={pricing.id} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-4">
                          {isEditMode ? (
                            <Input
                              value={pricing.period}
                              onChange={(e) => handlePricingChange(pricing.id, 'period', e.target.value)}
                              placeholder="Period"
                              className="h-9"
                            />
                          ) : (
                            <p className="text-sm p-2 bg-gray-50 rounded border h-9 flex items-center">{pricing.period}</p>
                          )}
                        </div>
                        <div className="col-span-4">
                          {isEditMode ? (
                            <Input
                              value={pricing.pricelist}
                              onChange={(e) => handlePricingChange(pricing.id, 'pricelist', e.target.value)}
                              placeholder="Pricelist"
                              className="h-9"
                            />
                          ) : (
                            <p className="text-sm p-2 bg-gray-50 rounded border h-9 flex items-center">{pricing.pricelist}</p>
                          )}
                        </div>
                        <div className="col-span-3">
                          {isEditMode ? (
                            <Input
                              type="number"
                              value={pricing.price || 0}
                              onChange={(e) => handlePricingChange(pricing.id, 'price', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="h-9"
                            />
                          ) : (
                            <p className="text-sm p-2 bg-gray-50 rounded border h-9 flex items-center">₹{pricing.price || 0}</p>
                          )}
                        </div>
                        {isEditMode && (
                          <div className="col-span-1 flex justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removePricingRow(pricing.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Rental Reservations Charges */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Rental Reservations Charges</Label>
                  
                  <div className="space-y-3">
                    {reservationCharges.map((charge) => (
                      <div key={charge.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {charge.type === 'extra_hour' && <Clock className="h-5 w-5 text-blue-600" />}
                          {charge.type === 'extra_day' && <Calendar className="h-5 w-5 text-purple-600" />}
                          {charge.type === 'late_return' && <Shield className="h-5 w-5 text-red-600" />}
                          <span className="font-medium">{charge.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">:</span>
                          {isEditMode ? (
                            <div className="flex items-center gap-1">
                              <span className="text-sm">Rs</span>
                              <Input
                                type="number"
                                value={charge.price || 0}
                                onChange={(e) => handleChargeChange(charge.id, parseFloat(e.target.value) || 0)}
                                className="w-24 h-9"
                              />
                            </div>
                          ) : (
                            <span className="font-semibold text-lg">Rs {charge.price || 0}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Security Deposit */}
                <div className="space-y-2">
                  <Label htmlFor="securityDeposit" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security Deposit
                  </Label>
                  {isEditMode ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Rs</span>
                      <Input
                        id="securityDeposit"
                        type="number"
                        value={formData.securityDeposit || 0}
                        onChange={(e) => handleInputChange('securityDeposit', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                  ) : (
                    <p className="p-3 bg-blue-50 rounded-lg border border-blue-200 font-semibold text-lg">
                      Rs {formData.securityDeposit || 0}
                    </p>
                  )}
                </div>

                {/* Additional Services (Optional) */}
                <div className="space-y-2 pt-4 border-t">
                  <Label className="text-sm text-gray-600">Additional Services Available</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      Delivery Available
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Insurance Coverage
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      24/7 Support
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Action Buttons (only in edit/create mode) */}
          {isEditMode && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                <Save className="h-4 w-4 mr-2" />
                {mode === 'create' ? 'Create Product' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
