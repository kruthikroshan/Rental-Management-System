import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Payment interfaces
export interface PaymentMethod {
  id: number;
  name: string;
  type: 'card' | 'bank_transfer' | 'upi' | 'digital_wallet' | 'cash' | 'check' | 'crypto';
  provider: string;
  isActive: boolean;
  processingFee: number;
  processingTime: string; // e.g., "instant", "1-2 days"
  supportedCurrencies: string[];
  configuration: Record<string, any>;
}

export interface PaymentGateway {
  id: number;
  name: string;
  provider: string;
  isActive: boolean;
  supportedMethods: string[];
  configuration: Record<string, any>;
  webhookUrl?: string;
  apiKey?: string;
  merchantId?: string;
}

export interface PaymentRefund {
  id: number;
  refundId: string;
  originalPaymentId: number;
  amount: number;
  reason: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  initiatedBy: string;
  approvedBy?: string;
  processedAt?: string;
  refundMethod: string;
  refundReference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentDispute {
  id: number;
  paymentId: number;
  disputeId: string;
  type: 'chargeback' | 'fraud' | 'authorization' | 'processing_error' | 'customer_complaint';
  status: 'open' | 'under_review' | 'evidence_required' | 'closed' | 'resolved';
  amount: number;
  reason: string;
  description: string;
  evidenceRequired: string[];
  evidenceSubmitted: string[];
  dueDate?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  paymentId: string;
  transactionId: string;
  invoiceId?: number;
  invoiceRef?: string;
  bookingId?: number;
  bookingRef?: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  
  // Financial details
  amount: number;
  currency: string;
  processingFee: number;
  netAmount: number;
  taxAmount: number;
  discountAmount: number;
  finalAmount: number;
  
  // Payment details
  method: 'card' | 'bank_transfer' | 'upi' | 'digital_wallet' | 'cash' | 'check' | 'crypto';
  methodDetails: {
    cardType?: 'visa' | 'mastercard' | 'amex' | 'discover';
    cardLast4?: string;
    bankName?: string;
    accountLast4?: string;
    upiId?: string;
    walletProvider?: string;
    cryptoCurrency?: string;
    checkNumber?: string;
  };
  gateway: string;
  gatewayTransactionId?: string;
  gatewayResponse?: Record<string, any>;
  
  // Status and timing
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded' | 'disputed';
  failureReason?: string;
  date: string;
  time: string;
  processedAt?: string;
  settledAt?: string;
  
  // References and descriptions
  reference: string;
  description: string;
  internalNotes?: string;
  customerNotes?: string;
  
  // Related records
  refunds: PaymentRefund[];
  disputes: PaymentDispute[];
  
  // Risk and compliance
  riskScore?: number;
  riskFlags: string[];
  complianceChecks: {
    aml: boolean;
    fraud: boolean;
    sanctions: boolean;
  };
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  location?: {
    country: string;
    region: string;
    city: string;
  };
  
  // Audit trail
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  processedBy?: string;
  approvedBy?: string;
  
  // Relationships
  isRecurring: boolean;
  recurringPaymentId?: number;
  parentPaymentId?: number;
  splitPayments?: number[];
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: Payment['status'];
  method?: Payment['method'];
  gateway?: string;
  customerId?: number;
  invoiceId?: number;
  bookingId?: number;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  currency?: string;
  riskScoreMin?: number;
  riskScoreMax?: number;
  hasDisputes?: boolean;
  hasRefunds?: boolean;
  sortBy?: 'paymentId' | 'date' | 'amount' | 'status' | 'customer' | 'method';
  sortOrder?: 'asc' | 'desc';
}

export interface PaymentResponse {
  payments: Payment[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  disputedPayments: number;
  refundedAmount: number;
  processingFees: number;
  averageTransactionValue: number;
  successRate: number;
  methodBreakdown: {
    card: { count: number; amount: number };
    bank_transfer: { count: number; amount: number };
    upi: { count: number; amount: number };
    digital_wallet: { count: number; amount: number };
    cash: { count: number; amount: number };
    check: { count: number; amount: number };
    crypto: { count: number; amount: number };
  };
  statusBreakdown: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    cancelled: number;
    refunded: number;
    partially_refunded: number;
    disputed: number;
  };
  gatewayBreakdown: Record<string, { count: number; amount: number; successRate: number }>;
  timeSeriesData: {
    date: string;
    amount: number;
    count: number;
  }[];
}

export interface CreatePaymentRequest {
  invoiceId?: number;
  bookingId?: number;
  customerId: number;
  amount: number;
  currency?: string;
  method: Payment['method'];
  description: string;
  reference?: string;
  customerNotes?: string;
  autoCapture?: boolean;
  metadata?: Record<string, any>;
}

export interface ProcessPaymentRequest {
  paymentId: number;
  gatewayResponse: Record<string, any>;
  gatewayTransactionId: string;
  processedAt?: string;
}

export interface RefundPaymentRequest {
  paymentId: number;
  amount?: number; // If not provided, full refund
  reason: string;
  refundMethod?: string;
  notes?: string;
}

export interface PaymentAnalytics {
  period: string;
  totalRevenue: number;
  transactionCount: number;
  averageTransactionValue: number;
  successRate: number;
  topPaymentMethods: { method: string; percentage: number; amount: number }[];
  topCustomers: { customerId: number; customerName: string; totalAmount: number; transactionCount: number }[];
  fraudRate: number;
  chargebackRate: number;
  conversionRate: number;
}

class PaymentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Get all payments with filters
  async getPayments(filters: PaymentFilters = {}): Promise<{ data: PaymentResponse }> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(`${API_BASE_URL}/payments?${params}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  // Get payment by ID
  async getPaymentById(id: number): Promise<{ data: Payment }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  }

  // Create new payment
  async createPayment(paymentData: CreatePaymentRequest): Promise<{ data: Payment }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments`, paymentData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  // Process payment
  async processPayment(processData: ProcessPaymentRequest): Promise<{ data: Payment }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/${processData.paymentId}/process`, processData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Capture payment (for authorized payments)
  async capturePayment(id: number, amount?: number): Promise<{ data: Payment }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/${id}/capture`, 
        { amount }, 
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error capturing payment:', error);
      throw error;
    }
  }

  // Cancel payment
  async cancelPayment(id: number, reason: string): Promise<{ data: Payment }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/${id}/cancel`, 
        { reason }, 
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error cancelling payment:', error);
      throw error;
    }
  }

  // Refund payment
  async refundPayment(refundData: RefundPaymentRequest): Promise<{ data: PaymentRefund }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/${refundData.paymentId}/refund`, refundData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  // Get payment statistics
  async getPaymentStats(filters?: { dateFrom?: string; dateTo?: string }): Promise<{ data: PaymentStats }> {
    try {
      const params = new URLSearchParams();
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      const response = await axios.get(`${API_BASE_URL}/payments/stats?${params}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  }

  // Get payment analytics
  async getPaymentAnalytics(period: 'day' | 'week' | 'month' | 'quarter' | 'year'): Promise<{ data: PaymentAnalytics }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/analytics?period=${period}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment analytics:', error);
      throw error;
    }
  }

  // Verify payment status with gateway
  async verifyPaymentStatus(id: number): Promise<{ data: { status: string; gatewayResponse: any } }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/${id}/verify`, {}, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying payment status:', error);
      throw error;
    }
  }

  // Retry failed payment
  async retryPayment(id: number): Promise<{ data: Payment }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/${id}/retry`, {}, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error retrying payment:', error);
      throw error;
    }
  }

  // Get payment methods
  async getPaymentMethods(): Promise<{ data: PaymentMethod[] }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/payment-methods`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  // Get payment gateways
  async getPaymentGateways(): Promise<{ data: PaymentGateway[] }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/payment-gateways`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment gateways:', error);
      throw error;
    }
  }

  // Handle webhook
  async handleWebhook(gatewayId: number, payload: any, signature: string): Promise<{ data: { processed: boolean } }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/webhook/${gatewayId}`, 
        { payload, signature }, 
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  // Search payments
  async searchPayments(query: string): Promise<{ data: Payment[] }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/search?q=${encodeURIComponent(query)}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error searching payments:', error);
      throw error;
    }
  }

  // Export payments
  async exportPayments(format: 'csv' | 'xlsx' | 'pdf', filters?: PaymentFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await axios.get(`${API_BASE_URL}/payments/export?${params}`, {
        headers: this.getAuthHeaders(),
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting payments:', error);
      throw error;
    }
  }

  // Generate payment report
  async generatePaymentReport(id: number): Promise<Blob> {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/${id}/report`, {
        headers: this.getAuthHeaders(),
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error generating payment report:', error);
      throw error;
    }
  }

  // Bulk operations
  async bulkUpdateStatus(paymentIds: number[], status: Payment['status']): Promise<{ data: { updated: number } }> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/payments/bulk/status`, {
        paymentIds,
        status,
      }, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating payment status:', error);
      throw error;
    }
  }

  async bulkRefund(paymentIds: number[], reason: string): Promise<{ data: { processed: number; failed: number } }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/bulk/refund`, {
        paymentIds,
        reason,
      }, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk refunding payments:', error);
      throw error;
    }
  }

  // Get customer payment history
  async getCustomerPaymentHistory(customerId: number): Promise<{ data: Payment[] }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/customers/${customerId}/payments`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching customer payment history:', error);
      throw error;
    }
  }

  // Get failed payments
  async getFailedPayments(): Promise<{ data: Payment[] }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/failed`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching failed payments:', error);
      throw error;
    }
  }

  // Get disputed payments
  async getDisputedPayments(): Promise<{ data: Payment[] }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/disputed`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching disputed payments:', error);
      throw error;
    }
  }

  // Risk assessment
  async assessPaymentRisk(paymentData: CreatePaymentRequest): Promise<{ data: { riskScore: number; riskFlags: string[]; recommendation: string } }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/risk-assessment`, paymentData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error assessing payment risk:', error);
      throw error;
    }
  }

  // Reconcile payments
  async reconcilePayments(startDate: string, endDate: string): Promise<{ data: { matched: number; unmatched: number; discrepancies: any[] } }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/reconcile`, {
        startDate,
        endDate,
      }, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error reconciling payments:', error);
      throw error;
    }
  }
}

const paymentService = new PaymentService();
export default paymentService;
