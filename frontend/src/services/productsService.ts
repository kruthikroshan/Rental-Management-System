// Products API Service
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sku: string;
  barcode?: string;
  categoryId: number;
  category?: {
    id: number;
    name: string;
  };
  isRentable: boolean;
  rentalUnits: 'hour' | 'day' | 'week' | 'month' | 'year';
  minRentalDuration: number;
  maxRentalDuration?: number;
  advanceBookingDays?: number;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  maintenanceQuantity: number;
  baseRentalRate: number;
  securityDeposit?: number;
  lateFeePerDay?: number;
  replacementCost?: number;
  brand?: string;
  model?: string;
  yearManufactured?: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  weight?: number;
  dimensions?: string;
  specifications?: any;
  images: string[];
  manuals?: string[];
  metaTitle?: string;
  metaDescription?: string;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface CreateProductData {
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  categoryId: number;
  isRentable: boolean;
  rentalUnits: 'hour' | 'day' | 'week' | 'month' | 'year';
  minRentalDuration: number;
  maxRentalDuration?: number;
  totalQuantity: number;
  baseRentalRate: number;
  securityDeposit?: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  brand?: string;
  model?: string;
  yearManufactured?: number;
  images?: string[];
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
}

class ProductsService {
  // Get all products with pagination and filtering
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
    condition?: string;
    isRentable?: boolean;
  }): Promise<ProductsResponse> {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Get single product by ID
  async getProduct(id: number): Promise<{ success: boolean; data: Product }> {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Create new product
  async createProduct(data: CreateProductData): Promise<{ success: boolean; data: Product }> {
    try {
      const response = await api.post('/products', data);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Update product
  async updateProduct(id: number, data: Partial<CreateProductData>): Promise<{ success: boolean; data: Product }> {
    try {
      const response = await api.put(`/products/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete product
  async deleteProduct(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Get product categories
  async getCategories(): Promise<{ success: boolean; data: Array<{ id: number; name: string; slug: string }> }> {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Upload product images
  async uploadImages(files: FileList): Promise<{ success: boolean; data: { urls: string[] } }> {
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('images', file);
      });

      const response = await api.post('/products/upload-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  }
}

const productsService = new ProductsService();
export default productsService;
