// src/config/api.ts - API Configuration
export const API_CONFIG = {
  // Use environment variable or fallback to localhost for development
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

// Check if we're in production
export const isProduction = import.meta.env.PROD;

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    profile: '/api/auth/profile',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
  },
  products: {
    list: '/api/products',
    create: '/api/products',
    update: (id: string) => `/api/products/${id}`,
    delete: (id: string) => `/api/products/${id}`,
    get: (id: string) => `/api/products/${id}`,
  },
  customers: {
    list: '/api/customers',
    create: '/api/customers',
    update: (id: string) => `/api/customers/${id}`,
    delete: (id: string) => `/api/customers/${id}`,
  },
  dashboard: {
    stats: '/api/dashboard/stats',
    revenue: '/api/dashboard/revenue',
  },
  bookings: {
    list: '/api/bookings',
    create: '/api/bookings',
    update: (id: string) => `/api/bookings/${id}`,
  },
  quotations: {
    list: '/api/quotations',
    create: '/api/quotations',
    update: (id: string) => `/api/quotations/${id}`,
  },
};

console.log('🔧 API Configuration:', {
  baseURL: API_CONFIG.baseURL,
  environment: isProduction ? 'production' : 'development',
});
