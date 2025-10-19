import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Return interfaces
export interface ReturnAction {
  id: number;
  date: string;
  action: string;
  notes: string;
  createdBy: string;
  attachments?: string[];
}

export interface DamageReport {
  id: number;
  itemsAffected: string[];
  damageDescription: string;
  damagePhotos: string[];
  repairCost: number;
  repairQuote?: string;
  repairVendor?: string;
  isRepairable: boolean;
  replacementCost?: number;
  severity: 'minor' | 'moderate' | 'major' | 'total_loss';
  assessedBy: string;
  assessmentDate: string;
}

export interface ReturnItem {
  id: number;
  productId: number;
  productName: string;
  productCategory: string;
  quantity: number;
  expectedQuantity: number;
  condition: 'excellent' | 'good' | 'fair' | 'damaged' | 'missing';
  notes?: string;
  damageReport?: DamageReport;
  replacementCost: number;
  serialNumbers?: string[];
}

export interface Return {
  id: number;
  returnId: string;
  type: 'normal_return' | 'delayed_return' | 'damaged_return' | 'lost_item' | 'early_return';
  bookingId: number;
  bookingRef: string;
  customerId: number;
  customerName: string;
  customerContact: string;
  status: 'pending' | 'overdue' | 'processing' | 'investigating' | 'resolved' | 'completed' | 'disputed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Dates
  expectedReturnDate: string;
  actualReturnDate?: string;
  daysOverdue: number;
  lastContactDate?: string;
  finalReturnDate?: string;
  
  // Financial
  originalRentalAmount: number;
  securityDeposit: number;
  penaltyAmount: number;
  damageCharges: number;
  refundAmount: number;
  finalAmount: number;
  
  // Items and details
  items: ReturnItem[];
  totalItems: number;
  returnedItems: number;
  missingItems: number;
  damagedItems: number;
  
  // Reasons and notes
  reason: string;
  customerNotes?: string;
  internalNotes?: string;
  resolutionNotes?: string;
  
  // Communication
  lastContact?: string;
  nextFollowUp?: string;
  escalationLevel: 0 | 1 | 2 | 3; // 0: none, 1: supervisor, 2: manager, 3: legal
  communicationHistory: ReturnAction[];
  
  // Resolution
  isResolved: boolean;
  resolutionType?: 'full_return' | 'partial_return' | 'compensation' | 'insurance_claim' | 'written_off';
  compensationAmount?: number;
  insuranceClaimId?: string;
  legalActionRequired: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedTo?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface ReturnFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: Return['type'];
  status?: Return['status'];
  priority?: Return['priority'];
  customerId?: number;
  bookingId?: number;
  dateFrom?: string;
  dateTo?: string;
  overdueOnly?: boolean;
  assignedTo?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'returnId' | 'expectedReturnDate' | 'daysOverdue' | 'penaltyAmount' | 'status' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface ReturnResponse {
  returns: Return[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ReturnStats {
  totalReturns: number;
  pendingReturns: number;
  overdueReturns: number;
  resolvedReturns: number;
  disputedReturns: number;
  totalPenalties: number;
  totalDamageCharges: number;
  totalRefunds: number;
  averageResolutionTime: number; // in days
  returnRate: number; // percentage of items returned
  damageRate: number; // percentage of items damaged
  typeBreakdown: {
    normal_return: number;
    delayed_return: number;
    damaged_return: number;
    lost_item: number;
    early_return: number;
  };
  statusBreakdown: {
    pending: number;
    overdue: number;
    processing: number;
    investigating: number;
    resolved: number;
    completed: number;
    disputed: number;
  };
  priorityBreakdown: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

export interface CreateReturnRequest {
  bookingId: number;
  type: Return['type'];
  expectedReturnDate: string;
  items: Omit<ReturnItem, 'id'>[];
  reason: string;
  customerNotes?: string;
  priority?: Return['priority'];
}

export interface UpdateReturnRequest extends Partial<CreateReturnRequest> {
  status?: Return['status'];
  actualReturnDate?: string;
  penaltyAmount?: number;
  damageCharges?: number;
  refundAmount?: number;
  internalNotes?: string;
  resolutionNotes?: string;
  assignedTo?: string;
  escalationLevel?: Return['escalationLevel'];
  resolutionType?: Return['resolutionType'];
  compensationAmount?: number;
  legalActionRequired?: boolean;
}

export interface ReturnActionRequest {
  action: string;
  notes: string;
  attachments?: File[];
  nextFollowUp?: string;
}

export interface DamageAssessmentRequest {
  itemId: number;
  damageDescription: string;
  repairCost: number;
  severity: DamageReport['severity'];
  isRepairable: boolean;
  replacementCost?: number;
  damagePhotos?: File[];
}

export interface BulkReturnOperation {
  returnIds: number[];
  operation: 'update_status' | 'assign' | 'escalate' | 'resolve';
  data: any;
}

class ReturnService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Get all returns with filters
  async getReturns(filters: ReturnFilters = {}): Promise<{ data: ReturnResponse }> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(`${API_BASE_URL}/returns?${params}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching returns:', error);
      throw error;
    }
  }

  // Get return by ID
  async getReturnById(id: number): Promise<{ data: Return }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/returns/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching return:', error);
      throw error;
    }
  }

  // Create new return
  async createReturn(returnData: CreateReturnRequest): Promise<{ data: Return }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/returns`, returnData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating return:', error);
      throw error;
    }
  }

  // Update return
  async updateReturn(id: number, updateData: UpdateReturnRequest): Promise<{ data: Return }> {
    try {
      const response = await axios.put(`${API_BASE_URL}/returns/${id}`, updateData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating return:', error);
      throw error;
    }
  }

  // Update return status
  async updateReturnStatus(id: number, status: Return['status'], notes?: string): Promise<{ data: Return }> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/returns/${id}/status`, 
        { status, notes }, 
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating return status:', error);
      throw error;
    }
  }

  // Add action to return
  async addReturnAction(id: number, actionData: ReturnActionRequest): Promise<{ data: ReturnAction }> {
    try {
      const formData = new FormData();
      formData.append('action', actionData.action);
      formData.append('notes', actionData.notes);
      if (actionData.nextFollowUp) {
        formData.append('nextFollowUp', actionData.nextFollowUp);
      }
      
      if (actionData.attachments) {
        actionData.attachments.forEach((file, index) => {
          formData.append(`attachments[${index}]`, file);
        });
      }

      const response = await axios.post(`${API_BASE_URL}/returns/${id}/actions`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error adding return action:', error);
      throw error;
    }
  }

  // Process return with items
  async processReturn(id: number, items: Partial<ReturnItem>[]): Promise<{ data: Return }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/returns/${id}/process`, 
        { items }, 
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error processing return:', error);
      throw error;
    }
  }

  // Assess damage
  async assessDamage(returnId: number, assessmentData: DamageAssessmentRequest): Promise<{ data: DamageReport }> {
    try {
      const formData = new FormData();
      formData.append('itemId', assessmentData.itemId.toString());
      formData.append('damageDescription', assessmentData.damageDescription);
      formData.append('repairCost', assessmentData.repairCost.toString());
      formData.append('severity', assessmentData.severity);
      formData.append('isRepairable', assessmentData.isRepairable.toString());
      
      if (assessmentData.replacementCost) {
        formData.append('replacementCost', assessmentData.replacementCost.toString());
      }
      
      if (assessmentData.damagePhotos) {
        assessmentData.damagePhotos.forEach((file, index) => {
          formData.append(`damagePhotos[${index}]`, file);
        });
      }

      const response = await axios.post(`${API_BASE_URL}/returns/${returnId}/damage-assessment`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error assessing damage:', error);
      throw error;
    }
  }

  // Calculate penalties
  async calculatePenalties(id: number): Promise<{ data: { penaltyAmount: number; breakdown: any } }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/returns/${id}/calculate-penalties`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating penalties:', error);
      throw error;
    }
  }

  // Resolve return
  async resolveReturn(id: number, resolutionData: {
    resolutionType: Return['resolutionType'];
    compensationAmount?: number;
    resolutionNotes: string;
  }): Promise<{ data: Return }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/returns/${id}/resolve`, resolutionData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error resolving return:', error);
      throw error;
    }
  }

  // Escalate return
  async escalateReturn(id: number, escalationLevel: Return['escalationLevel'], reason: string): Promise<{ data: Return }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/returns/${id}/escalate`, 
        { escalationLevel, reason }, 
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error escalating return:', error);
      throw error;
    }
  }

  // Get return statistics
  async getReturnStats(filters?: { dateFrom?: string; dateTo?: string }): Promise<{ data: ReturnStats }> {
    try {
      const params = new URLSearchParams();
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      const response = await axios.get(`${API_BASE_URL}/returns/stats?${params}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching return stats:', error);
      throw error;
    }
  }

  // Get overdue returns
  async getOverdueReturns(): Promise<{ data: Return[] }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/returns/overdue`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching overdue returns:', error);
      throw error;
    }
  }

  // Send reminder
  async sendReminder(id: number, reminderType: 'sms' | 'email' | 'call', message?: string): Promise<{ data: { sent: boolean } }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/returns/${id}/remind`, 
        { reminderType, message }, 
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending reminder:', error);
      throw error;
    }
  }

  // Export returns
  async exportReturns(format: 'csv' | 'xlsx' | 'pdf', filters?: ReturnFilters): Promise<Blob> {
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

      const response = await axios.get(`${API_BASE_URL}/returns/export?${params}`, {
        headers: this.getAuthHeaders(),
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting returns:', error);
      throw error;
    }
  }

  // Bulk operations
  async bulkOperation(operation: BulkReturnOperation): Promise<{ data: { affected: number; results: any[] } }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/returns/bulk`, operation, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      throw error;
    }
  }

  // Get return timeline
  async getReturnTimeline(id: number): Promise<{ data: ReturnAction[] }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/returns/${id}/timeline`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching return timeline:', error);
      throw error;
    }
  }

  // Get customer return history
  async getCustomerReturnHistory(customerId: number): Promise<{ data: Return[] }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/customers/${customerId}/returns`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching customer return history:', error);
      throw error;
    }
  }

  // Generate return report
  async generateReturnReport(id: number): Promise<Blob> {
    try {
      const response = await axios.get(`${API_BASE_URL}/returns/${id}/report`, {
        headers: this.getAuthHeaders(),
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error generating return report:', error);
      throw error;
    }
  }

  // Auto-detect overdue returns
  async detectOverdueReturns(): Promise<{ data: { detected: number; notified: number } }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/returns/detect-overdue`, {}, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error detecting overdue returns:', error);
      throw error;
    }
  }

  // Schedule follow-up
  async scheduleFollowUp(id: number, followUpDate: string, notes: string): Promise<{ data: Return }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/returns/${id}/follow-up`, 
        { followUpDate, notes }, 
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      throw error;
    }
  }
}

const returnService = new ReturnService();
export default returnService;
