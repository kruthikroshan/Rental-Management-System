// Quotations API Service
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

export interface QuotationItem {
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
  description?: string;
}

export interface Quotation {
  id: number;
  quotationNumber: string;
  customerId: number;
  customer?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    customerCode: string;
  };
  proposedStartDate: string;
  proposedEndDate: string;
  validUntil: string;
  pickupLocation: any; // JSON object with address and coordinates
  returnLocation: any; // JSON object with address and coordinates
  deliveryRequired: boolean;
  pickupRequired: boolean;
  subtotal: number;
  discountAmount: number;
  discountType: 'percentage' | 'fixed';
  taxAmount: number;
  taxRate: number;
  deliveryCharges: number;
  totalAmount: number;
  securityDeposit: number;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'converted';
  notes?: string;
  termsConditions?: string;
  internalNotes?: string;
  sentAt?: string;
  viewedAt?: string;
  respondedAt?: string;
  items: QuotationItem[];
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  assignedTo?: number;
}

export interface QuotationsResponse {
  success: boolean;
  data: {
    quotations: Quotation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface CreateQuotationData {
  customerId: number;
  proposedStartDate: string;
  proposedEndDate: string;
  validUntil: string;
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
  discountType?: 'percentage' | 'fixed';
  taxRate?: number;
  deliveryCharges?: number;
  notes?: string;
  termsConditions?: string;
  internalNotes?: string;
  assignedTo?: number;
  items: Array<{
    productId: number;
    quantity: number;
    unitRate: number;
    duration: number;
    durationType: 'hour' | 'day' | 'week' | 'month' | 'year';
    description?: string;
  }>;
}

export interface QuotationStats {
  totalQuotations: number;
  pendingQuotations: number;
  acceptedQuotations: number;
  rejectedQuotations: number;
  expiredQuotations: number;
  conversionRate: number;
  averageQuotationValue: number;
  totalQuotationValue: number;
}

class QuotationsService {
  // Get all quotations with pagination and filtering
  async getQuotations(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customerId?: number;
    assignedTo?: number;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<QuotationsResponse> {
    try {
      const response = await api.get('/quotations', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching quotations:', error);
      throw error;
    }
  }

  // Get single quotation by ID
  async getQuotation(id: number): Promise<{ success: boolean; data: Quotation }> {
    try {
      const response = await api.get(`/quotations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quotation:', error);
      throw error;
    }
  }

  // Create new quotation
  async createQuotation(data: CreateQuotationData): Promise<{ success: boolean; data: Quotation }> {
    try {
      const response = await api.post('/quotations', data);
      return response.data;
    } catch (error) {
      console.error('Error creating quotation:', error);
      throw error;
    }
  }

  // Update quotation
  async updateQuotation(id: number, data: Partial<CreateQuotationData>): Promise<{ success: boolean; data: Quotation }> {
    try {
      const response = await api.put(`/quotations/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating quotation:', error);
      throw error;
    }
  }

  // Delete quotation
  async deleteQuotation(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/quotations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting quotation:', error);
      throw error;
    }
  }

  // Send quotation to customer
  async sendQuotation(id: number, data?: {
    emailSubject?: string;
    emailMessage?: string;
    sendCopy?: boolean;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`/quotations/${id}/send`, data);
      return response.data;
    } catch (error) {
      console.error('Error sending quotation:', error);
      throw error;
    }
  }

  // Accept quotation (customer action)
  async acceptQuotation(id: number, notes?: string): Promise<{ success: boolean; data: Quotation }> {
    try {
      const response = await api.post(`/quotations/${id}/accept`, { notes });
      return response.data;
    } catch (error) {
      console.error('Error accepting quotation:', error);
      throw error;
    }
  }

  // Reject quotation (customer action)
  async rejectQuotation(id: number, reason?: string): Promise<{ success: boolean; data: Quotation }> {
    try {
      const response = await api.post(`/quotations/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting quotation:', error);
      throw error;
    }
  }

  // Convert quotation to booking
  async convertToBooking(id: number, bookingData?: {
    pickupDate?: string;
    returnDate?: string;
    customerNotes?: string;
  }): Promise<{ success: boolean; data: { booking: any; quotation: Quotation } }> {
    try {
      const response = await api.post(`/quotations/${id}/convert`, bookingData);
      return response.data;
    } catch (error) {
      console.error('Error converting quotation to booking:', error);
      throw error;
    }
  }

  // Duplicate quotation
  async duplicateQuotation(id: number): Promise<{ success: boolean; data: Quotation }> {
    try {
      const response = await api.post(`/quotations/${id}/duplicate`);
      return response.data;
    } catch (error) {
      console.error('Error duplicating quotation:', error);
      throw error;
    }
  }

  // Get quotation PDF
  async getQuotationPDF(id: number): Promise<Blob> {
    try {
      const response = await api.get(`/quotations/${id}/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error getting quotation PDF:', error);
      throw error;
    }
  }

  // Get quotation statistics
  async getQuotationStats(period = '30'): Promise<{
    success: boolean;
    data: QuotationStats;
  }> {
    try {
      const response = await api.get(`/quotations/stats?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quotation stats:', error);
      throw error;
    }
  }

  // Search products for quotation
  async searchProducts(query: string): Promise<{
    success: boolean;
    data: Array<{
      id: number;
      name: string;
      sku: string;
      baseRentalRate: number;
      availableQuantity: number;
      rentalUnits: string;
      securityDeposit: number;
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

  // Get quotation templates
  async getQuotationTemplates(): Promise<{
    success: boolean;
    data: Array<{
      id: number;
      name: string;
      description: string;
      items: QuotationItem[];
    }>;
  }> {
    try {
      const response = await api.get('/quotations/templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching quotation templates:', error);
      throw error;
    }
  }

  // Create quotation from template
  async createFromTemplate(templateId: number, data: {
    customerId: number;
    proposedStartDate: string;
    proposedEndDate: string;
    validUntil: string;
  }): Promise<{ success: boolean; data: Quotation }> {
    try {
      const response = await api.post(`/quotations/templates/${templateId}/create`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating quotation from template:', error);
      throw error;
    }
  }

  // Bulk update quotations
  async bulkUpdateQuotations(quotationIds: number[], updates: {
    status?: string;
    assignedTo?: number;
    validUntil?: string;
  }): Promise<{ success: boolean; message: string; updatedCount: number }> {
    try {
      const response = await api.post('/quotations/bulk-update', {
        quotationIds,
        updates,
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating quotations:', error);
      throw error;
    }
  }

  // Export quotations
  async exportQuotations(params?: {
    format: 'csv' | 'excel';
    filters?: {
      status?: string;
      dateFrom?: string;
      dateTo?: string;
      customerId?: number;
    };
  }): Promise<Blob> {
    try {
      const response = await api.get('/quotations/export', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting quotations:', error);
      throw error;
    }
  }
}

const quotationsService = new QuotationsService();
export default quotationsService;
