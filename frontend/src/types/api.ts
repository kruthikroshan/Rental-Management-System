// Backend API Types - shared with frontend
export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  pricePerHour?: number;
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth?: number;
  totalUnits: number;
  availableUnits: number;
  status: 'available' | 'rented' | 'maintenance';
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  registrationDate: Date;
  status: 'active' | 'inactive' | 'vip';
  totalBookings: number;
  totalSpent: number;
  rating: number;
}

export interface Booking {
  id: string;
  customerId: string;
  productId: string;
  startDate: Date;
  endDate: Date;
  duration: {
    value: number;
    unit: 'hour' | 'day' | 'week' | 'month';
  };
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'overdue';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  pickupScheduled?: Date;
  returnScheduled?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: 'card' | 'upi' | 'bank_transfer' | 'cash';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Request Types
export interface CreateProductRequest {
  name: string;
  category: string;
  description: string;
  pricePerHour?: number;
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth?: number;
  totalUnits: number;
}

export interface CreateBookingRequest {
  customerId: string;
  productId: string;
  startDate: string;
  endDate: string;
  duration: {
    value: number;
    unit: 'hour' | 'day' | 'week' | 'month';
  };
}

export interface UpdateBookingStatusRequest {
  status: 'confirmed' | 'active' | 'completed' | 'cancelled';
  pickupScheduled?: string;
  returnScheduled?: string;
}
