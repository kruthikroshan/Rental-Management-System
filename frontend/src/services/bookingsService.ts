// Bookings API Service
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

export interface BookingItem {
  id?: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitRate: number;
  duration: number;
  durationType: 'hour' | 'day' | 'week' | 'month' | 'year';
  lineTotal: number;
  securityDepositPerUnit: number;
  status?: 'reserved' | 'picked_up' | 'returned' | 'overdue' | 'damaged';
}

export interface Booking {
  id: number;
  orderNumber: string;
  customerId: number;
  customer?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  pickupDate: string;
  returnDate: string;
  actualPickupDate?: string;
  actualReturnDate?: string;
  pickupLocation: any; // JSON object with address and coordinates
  returnLocation: any; // JSON object with address and coordinates
  deliveryRequired: boolean;
  pickupRequired: boolean;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  deliveryCharges: number;
  totalAmount: number;
  securityDeposit: number;
  lateFees: number;
  damageCharges: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded' | 'cancelled';
  advancePaid: number;
  balanceAmount: number;
  status: 'draft' | 'confirmed' | 'processing' | 'picked_up' | 'active' | 'returned' | 'completed' | 'cancelled' | 'overdue';
  termsConditions?: string;
  customerNotes?: string;
  internalNotes?: string;
  items: BookingItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BookingsResponse {
  success: boolean;
  data: {
    bookings: Booking[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface CreateBookingData {
  customerId: number;
  pickupDate: string;
  returnDate: string;
  pickupLocation: {
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  returnLocation: {
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  deliveryRequired: boolean;
  pickupRequired?: boolean;
  discountAmount?: number;
  deliveryCharges?: number;
  termsConditions?: string;
  customerNotes?: string;
  internalNotes?: string;
  items: Array<{
    productId: number;
    quantity: number;
    unitRate: number;
    duration: number;
    durationType: 'hour' | 'day' | 'week' | 'month' | 'year';
  }>;
}

class BookingsService {
  // Get all bookings with pagination and filtering
  async getBookings(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customerId?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<BookingsResponse> {
    try {
      const response = await api.get('/bookings', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }

  // Get single booking by ID
  async getBooking(id: number): Promise<{ success: boolean; data: Booking }> {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  }

  // Create new booking
  async createBooking(data: CreateBookingData): Promise<{ success: boolean; data: Booking }> {
    try {
      const response = await api.post('/bookings', data);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  // Update booking
  async updateBooking(id: number, data: Partial<CreateBookingData>): Promise<{ success: boolean; data: Booking }> {
    try {
      const response = await api.put(`/bookings/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }

  // Cancel booking
  async cancelBooking(id: number, reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`/bookings/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  // Confirm booking
  async confirmBooking(id: number): Promise<{ success: boolean; data: Booking }> {
    try {
      const response = await api.post(`/bookings/${id}/confirm`);
      return response.data;
    } catch (error) {
      console.error('Error confirming booking:', error);
      throw error;
    }
  }

  // Process pickup
  async processPickup(id: number, data: {
    actualPickupDate: string;
    pickupStaff?: string;
    notes?: string;
  }): Promise<{ success: boolean; data: Booking }> {
    try {
      const response = await api.post(`/bookings/${id}/pickup`, data);
      return response.data;
    } catch (error) {
      console.error('Error processing pickup:', error);
      throw error;
    }
  }

  // Process return
  async processReturn(id: number, data: {
    actualReturnDate: string;
    returnStaff?: string;
    notes?: string;
    damageNotes?: string;
    damageCharges?: number;
  }): Promise<{ success: boolean; data: Booking }> {
    try {
      const response = await api.post(`/bookings/${id}/return`, data);
      return response.data;
    } catch (error) {
      console.error('Error processing return:', error);
      throw error;
    }
  }

  // Get booking statistics
  async getBookingStats(period = '30'): Promise<{
    success: boolean;
    data: {
      totalBookings: number;
      activeRentals: number;
      pendingPickups: number;
      pendingReturns: number;
      overdueReturns: number;
      totalRevenue: number;
      averageBookingValue: number;
    };
  }> {
    try {
      const response = await api.get(`/bookings/stats?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      throw error;
    }
  }

  // Search customers for booking creation
  async searchCustomers(query: string): Promise<{
    success: boolean;
    data: Array<{
      id: number;
      name: string;
      email: string;
      phone: string;
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

  // Search products for booking creation
  async searchProducts(query: string): Promise<{
    success: boolean;
    data: Array<{
      id: number;
      name: string;
      sku: string;
      baseRentalRate: number;
      availableQuantity: number;
      rentalUnits: string;
    }>;
  }> {
    try {
      const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
}

const bookingsService = new BookingsService();
export default bookingsService;
