// Customers API Service
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

export interface Customer {
  id: number;
  customerCode: string;
  name: string;
  email: string;
  phone: string;
  altPhone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  dateOfBirth?: string;
  companyName?: string;
  customerType: 'individual' | 'business';
  documentType?: 'passport' | 'license' | 'id_card' | 'business_license';
  documentNumber?: string;
  documentExpiryDate?: string;
  preferredCommunication: 'email' | 'phone' | 'sms';
  creditLimit?: number;
  paymentTerms?: number; // days
  taxNumber?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'suspended' | 'verified' | 'pending_verification';
  totalBookings: number;
  totalRevenue: number;
  lastBookingDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomersResponse {
  success: boolean;
  data: {
    customers: Customer[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface CreateCustomerData {
  name: string;
  email: string;
  phone: string;
  altPhone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  dateOfBirth?: string;
  companyName?: string;
  customerType: 'individual' | 'business';
  documentType?: 'passport' | 'license' | 'id_card' | 'business_license';
  documentNumber?: string;
  documentExpiryDate?: string;
  preferredCommunication: 'email' | 'phone' | 'sms';
  creditLimit?: number;
  paymentTerms?: number;
  taxNumber?: string;
  notes?: string;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  customerGrowthRate: number;
  averageCustomerValue: number;
  topCustomers: Array<{
    id: number;
    name: string;
    totalRevenue: number;
    totalBookings: number;
  }>;
}

class CustomersService {
  // Get all customers with pagination and filtering
  async getCustomers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customerType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<CustomersResponse> {
    try {
      const response = await api.get('/customers', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  // Get single customer by ID
  async getCustomer(id: number): Promise<{ success: boolean; data: Customer }> {
    try {
      const response = await api.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  }

  // Create new customer
  async createCustomer(data: CreateCustomerData): Promise<{ success: boolean; data: Customer }> {
    try {
      const response = await api.post('/customers', data);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Update customer
  async updateCustomer(id: number, data: Partial<CreateCustomerData>): Promise<{ success: boolean; data: Customer }> {
    try {
      const response = await api.put(`/customers/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  // Delete customer (soft delete)
  async deleteCustomer(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  // Update customer status
  async updateCustomerStatus(id: number, status: 'active' | 'inactive' | 'suspended' | 'verified' | 'pending_verification'): Promise<{ success: boolean; data: Customer }> {
    try {
      const response = await api.patch(`/customers/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating customer status:', error);
      throw error;
    }
  }

  // Search customers
  async searchCustomers(query: string): Promise<{
    success: boolean;
    data: Array<{
      id: number;
      name: string;
      email: string;
      phone: string;
      customerCode: string;
    }>;
  }> {
    try {
      const response = await api.get(`/customers/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }

  // Get customer bookings
  async getCustomerBookings(id: number, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    success: boolean;
    data: {
      bookings: Array<{
        id: number;
        orderNumber: string;
        pickupDate: string;
        returnDate: string;
        totalAmount: number;
        status: string;
        itemsCount: number;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }> {
    try {
      const response = await api.get(`/customers/${id}/bookings`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
      throw error;
    }
  }

  // Get customer payments
  async getCustomerPayments(id: number, params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: {
      payments: Array<{
        id: number;
        bookingId: number;
        amount: number;
        paymentMethod: string;
        status: string;
        transactionDate: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }> {
    try {
      const response = await api.get(`/customers/${id}/payments`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching customer payments:', error);
      throw error;
    }
  }

  // Get customer statistics
  async getCustomerStats(): Promise<{
    success: boolean;
    data: CustomerStats;
  }> {
    try {
      const response = await api.get('/customers/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      throw error;
    }
  }

  // Verify customer document
  async verifyCustomer(id: number, notes?: string): Promise<{ success: boolean; data: Customer }> {
    try {
      const response = await api.post(`/customers/${id}/verify`, { notes });
      return response.data;
    } catch (error) {
      console.error('Error verifying customer:', error);
      throw error;
    }
  }

  // Send customer communication
  async sendCommunication(id: number, data: {
    type: 'email' | 'sms';
    subject?: string;
    message: string;
    templateId?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`/customers/${id}/communicate`, data);
      return response.data;
    } catch (error) {
      console.error('Error sending communication:', error);
      throw error;
    }
  }

  // Export customers data
  async exportCustomers(params?: {
    format: 'csv' | 'excel';
    filters?: {
      status?: string;
      customerType?: string;
      dateFrom?: string;
      dateTo?: string;
    };
  }): Promise<Blob> {
    try {
      const response = await api.get('/customers/export', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting customers:', error);
      throw error;
    }
  }

  // Bulk update customers
  async bulkUpdateCustomers(customerIds: number[], updates: {
    status?: string;
    customerType?: string;
    creditLimit?: number;
    paymentTerms?: number;
  }): Promise<{ success: boolean; message: string; updatedCount: number }> {
    try {
      const response = await api.post('/customers/bulk-update', {
        customerIds,
        updates,
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating customers:', error);
      throw error;
    }
  }
}

const customersService = new CustomersService();
export default customersService;
