import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Invoice interfaces
export interface InvoiceItem {
  id: number;
  productId: number;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  discountAmount?: number;
  totalAmount: number;
  taxPercentage?: number;
  taxAmount?: number;
  netAmount: number;
}

export interface InvoiceAddress {
  id: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  bookingId: number;
  quotationId?: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  billingAddress: InvoiceAddress;
  shippingAddress?: InvoiceAddress;
  status: 'draft' | 'sent' | 'viewed' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  paymentDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  discountPercentage?: number;
  discountAmount?: number;
  taxPercentage?: number;
  taxAmount?: number;
  shippingAmount?: number;
  totalAmount: number;
  paidAmount?: number;
  balanceAmount?: number;
  paymentTerms?: string;
  notes?: string;
  internalNotes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  viewedAt?: string;
}

export interface InvoiceFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: Invoice['status'];
  customerId?: number;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  sortBy?: 'issueDate' | 'dueDate' | 'totalAmount' | 'customerName';
  sortOrder?: 'asc' | 'desc';
}

export interface InvoiceResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  totalPages: number;
}

export interface InvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  averageAmount: number;
  statusBreakdown: {
    draft: number;
    sent: number;
    viewed: number;
    partially_paid: number;
    paid: number;
    overdue: number;
    cancelled: number;
  };
}

export interface CreateInvoiceRequest {
  bookingId: number;
  quotationId?: number;
  customerId: number;
  billingAddress: Omit<InvoiceAddress, 'id'>;
  shippingAddress?: Omit<InvoiceAddress, 'id'>;
  dueDate: string;
  items: Omit<InvoiceItem, 'id'>[];
  discountPercentage?: number;
  discountAmount?: number;
  taxPercentage?: number;
  shippingAmount?: number;
  paymentTerms?: string;
  notes?: string;
  internalNotes?: string;
}

export interface UpdateInvoiceRequest extends Partial<CreateInvoiceRequest> {
  status?: Invoice['status'];
  paymentDate?: string;
  paidAmount?: number;
}

class InvoiceService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Get all invoices with filters
  async getInvoices(filters: InvoiceFilters = {}): Promise<{ data: InvoiceResponse }> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(`${API_BASE_URL}/invoices?${params}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  // Get invoice by ID
  async getInvoiceById(id: number): Promise<{ data: Invoice }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/invoices/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  // Create new invoice
  async createInvoice(invoiceData: CreateInvoiceRequest): Promise<{ data: Invoice }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/invoices`, invoiceData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  // Update invoice
  async updateInvoice(id: number, updateData: UpdateInvoiceRequest): Promise<{ data: Invoice }> {
    try {
      const response = await axios.put(`${API_BASE_URL}/invoices/${id}`, updateData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  // Update invoice status
  async updateInvoiceStatus(id: number, status: Invoice['status']): Promise<{ data: Invoice }> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/invoices/${id}/status`, { status }, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  }

  // Delete invoice
  async deleteInvoice(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/invoices/${id}`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }

  // Send invoice to customer
  async sendInvoice(id: number, recipientEmail?: string): Promise<{ data: { sent: boolean; sentAt: string } }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/invoices/${id}/send`, 
        { recipientEmail }, 
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending invoice:', error);
      throw error;
    }
  }

  // Download invoice PDF
  async downloadInvoicePDF(id: number): Promise<Blob> {
    try {
      const response = await axios.get(`${API_BASE_URL}/invoices/${id}/pdf`, {
        headers: this.getAuthHeaders(),
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading invoice PDF:', error);
      throw error;
    }
  }

  // Get invoice statistics
  async getInvoiceStats(filters?: { dateFrom?: string; dateTo?: string }): Promise<{ data: InvoiceStats }> {
    try {
      const params = new URLSearchParams();
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      const response = await axios.get(`${API_BASE_URL}/invoices/stats?${params}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
      throw error;
    }
  }

  // Record payment
  async recordPayment(id: number, amount: number, paymentDate: string, paymentMethod?: string, notes?: string): Promise<{ data: Invoice }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/invoices/${id}/payments`, {
        amount,
        paymentDate,
        paymentMethod,
        notes,
      }, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }

  // Generate invoice from booking
  async generateFromBooking(bookingId: number, dueDate: string): Promise<{ data: Invoice }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/invoices/generate-from-booking`, {
        bookingId,
        dueDate,
      }, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error generating invoice from booking:', error);
      throw error;
    }
  }

  // Generate invoice from quotation
  async generateFromQuotation(quotationId: number, dueDate: string): Promise<{ data: Invoice }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/invoices/generate-from-quotation`, {
        quotationId,
        dueDate,
      }, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error generating invoice from quotation:', error);
      throw error;
    }
  }

  // Get overdue invoices
  async getOverdueInvoices(): Promise<{ data: InvoiceResponse }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/invoices/overdue`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching overdue invoices:', error);
      throw error;
    }
  }

  // Bulk operations
  async bulkUpdateStatus(invoiceIds: number[], status: Invoice['status']): Promise<{ data: { updated: number } }> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/invoices/bulk/status`, {
        invoiceIds,
        status,
      }, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating invoice status:', error);
      throw error;
    }
  }

  async bulkSendInvoices(invoiceIds: number[]): Promise<{ data: { sent: number; failed: number } }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/invoices/bulk/send`, {
        invoiceIds,
      }, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk sending invoices:', error);
      throw error;
    }
  }
}

const invoiceService = new InvoiceService();
export default invoiceService;
