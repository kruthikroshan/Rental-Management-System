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

/**
 * Get auth token from storage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Create secure headers for API requests
 */
export function getSecureHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Enhanced fetch with security features
 */
export async function secureFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const secureOptions: RequestInit = {
    ...options,
    headers: {
      ...getSecureHeaders(),
      ...options.headers,
    },
    credentials: 'include', // Include cookies
    mode: 'cors',
  };
  
  // Add timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_CONFIG.timeout);
  
  try {
    const response = await fetch(url, {
      ...secureOptions,
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    
    // Handle token expiration
    if (response.status === 401) {
      // Clear auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}
