import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Minus, Check, Package } from 'lucide-react';
import { Product } from '../BookingWizard';

interface ProductStepProps {
  selectedProducts: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

const ProductStep: React.FC<ProductStepProps> = ({ selectedProducts, onUpdateProducts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Mock product data
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Professional Camera Kit',
        category: 'Photography',
        price: 150,
        available: true,
        description: 'High-end DSLR with lenses',
        image: '/api/placeholder/200/200',
      },
      {
        id: '2',
        name: 'Laptop - MacBook Pro',
        category: 'Electronics',
        price: 200,
        available: true,
        description: '16-inch M2 Pro',
        image: '/api/placeholder/200/200',
      },
      {
        id: '3',
        name: 'Party Tent (20x20)',
        category: 'Events',
        price: 300,
        available: true,
        description: 'Weather-resistant event tent',
        image: '/api/placeholder/200/200',
      },
      {
        id: '4',
        name: 'Sound System',
        category: 'Audio',
        price: 250,
        available: false,
        description: 'Professional PA system',
        image: '/api/placeholder/200/200',
      },
      {
        id: '5',
        name: 'Projector & Screen',
        category: 'Electronics',
        price: 120,
        available: true,
        description: '4K projector with 100" screen',
        image: '/api/placeholder/200/200',
      },
      {
        id: '6',
        name: 'Drone with 4K Camera',
        category: 'Photography',
        price: 180,
        available: true,
        description: 'Professional aerial drone',
        image: '/api/placeholder/200/200',
      },
    ];
    setProducts(mockProducts);
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isSelected = (productId: string) =>
    selectedProducts.some((p) => p.id === productId);

  const toggleProduct = (product: Product) => {
    if (isSelected(product.id)) {
      onUpdateProducts(selectedProducts.filter((p) => p.id !== product.id));
    } else {
      onUpdateProducts([...selectedProducts, product]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Selected Products Summary */}
      {selectedProducts.length > 0 && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-green-900">
                {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
              </h4>
              <p className="text-sm text-green-700">
                {selectedProducts.map((p) => p.name).join(', ')}
              </p>
            </div>
            <Badge variant="secondary" className="bg-green-200 text-green-900">
              <Check className="w-3 h-3 mr-1" />
              Ready
            </Badge>
          </div>
        </Card>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
        {filteredProducts.map((product) => {
          const selected = isSelected(product.id);
          return (
            <Card
              key={product.id}
              className={`p-4 transition-all duration-200 ${
                selected
                  ? 'border-2 border-green-500 bg-green-50'
                  : product.available
                  ? 'hover:shadow-md hover:border-blue-300 cursor-pointer'
                  : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => product.available && toggleProduct(product)}
            >
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                    </div>
                    {selected && (
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                      {product.available ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          Unavailable
                        </Badge>
                      )}
                    </div>
                    <p className="font-bold text-lg text-gray-900">${product.price}/day</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {product.available && (
                <Button
                  variant={selected ? 'destructive' : 'default'}
                  size="sm"
                  className="w-full mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleProduct(product);
                  }}
                >
                  {selected ? (
                    <>
                      <Minus className="w-4 h-4 mr-2" />
                      Remove
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Booking
                    </>
                  )}
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No products found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default ProductStep;
