import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Pricelist interfaces
export interface PricelistRule {
  id: number;
  condition: string;
  conditionType: 'quantity' | 'amount' | 'customer_type' | 'date_range' | 'product_category';
  minQuantity?: number;
  maxQuantity?: number;
  minAmount?: number;
  maxAmount?: number;
  customerTypes?: string[];
  productCategories?: string[];
  dateFrom?: string;
  dateTo?: string;
  discountType: 'percentage' | 'fixed_amount' | 'fixed_price';
  discountValue: number;
  description: string;
  priority: number;
  isActive: boolean;
}

export interface PricelistItem {
  id: number;
  productId: number;
  productName: string;
  productCategory: string;
  basePrice: number;
  pricelistPrice: number;
  discountPercentage?: number;
  discountAmount?: number;
  minQuantity?: number;
  maxQuantity?: number;
  rules: PricelistRule[];
  isActive: boolean;
}

export interface CustomerSegment {
  id: number;
  name: string;
  description: string;
  criteria: string[];
}

export interface Pricelist {
  id: number;
  name: string;
  description?: string;
  code: string;
  category: 'general' | 'wholesale' | 'retail' | 'vip' | 'promotional' | 'seasonal';
  status: 'active' | 'inactive' | 'draft' | 'expired';
  validFrom: string;
  validTo?: string;
  discountType: 'none' | 'percentage' | 'fixed_amount';
  discountValue: number;
  applicableCustomers: 'all' | 'specific' | 'segments';
  customerIds?: number[];
  customerSegments?: CustomerSegment[];
  customerCount: number;
  itemCount: number;
  priority: number;
  currency: string;
  isDefault: boolean;
  autoApply: boolean;
  stackable: boolean;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  items: PricelistItem[];
  rules: PricelistRule[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastUsed?: string;
  usageCount: number;
  totalSavings: number;
}

export interface PricelistFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: Pricelist['category'];
  status?: Pricelist['status'];
  validFrom?: string;
  validTo?: string;
  customerId?: number;
  productId?: number;
  minDiscount?: number;
  maxDiscount?: number;
  sortBy?: 'name' | 'priority' | 'validFrom' | 'lastUsed' | 'usageCount';
  sortOrder?: 'asc' | 'desc';
}

export interface PricelistResponse {
  pricelists: Pricelist[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PricelistStats {
  totalPricelists: number;
  activePricelists: number;
  totalCustomers: number;
  totalProducts: number;
  averageDiscount: number;
  totalSavings: number;
  mostUsedPricelist: string;
  categoryBreakdown: {
    general: number;
    wholesale: number;
    retail: number;
    vip: number;
    promotional: number;
    seasonal: number;
  };
  statusBreakdown: {
    active: number;
    inactive: number;
    draft: number;
    expired: number;
  };
}

export interface CreatePricelistRequest {
  name: string;
  description?: string;
  code: string;
  category: Pricelist['category'];
  validFrom: string;
  validTo?: string;
  discountType: Pricelist['discountType'];
  discountValue: number;
  applicableCustomers: Pricelist['applicableCustomers'];
  customerIds?: number[];
  customerSegments?: number[];
  priority: number;
  currency: string;
  isDefault?: boolean;
  autoApply?: boolean;
  stackable?: boolean;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  items?: Omit<PricelistItem, 'id'>[];
  rules?: Omit<PricelistRule, 'id'>[];
}

export interface UpdatePricelistRequest extends Partial<CreatePricelistRequest> {
  status?: Pricelist['status'];
}

export interface PriceCalculationRequest {
  productId: number;
  quantity: number;
  customerId?: number;
  orderAmount?: number;
  orderDate?: string;
}

export interface PriceCalculationResponse {
  originalPrice: number;
  finalPrice: number;
  totalDiscount: number;
  discountPercentage: number;
  appliedPricelists: {
    id: number;
    name: string;
    discountType: string;
    discountValue: number;
    savings: number;
  }[];
  savings: number;
}

class PricelistService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Get all pricelists with filters
  async getPricelists(filters: PricelistFilters = {}): Promise<{ data: PricelistResponse }> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(`${API_BASE_URL}/pricelists?${params}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching pricelists:', error);
      throw error;
    }
  }

  // Get pricelist by ID
  async getPricelistById(id: number): Promise<{ data: Pricelist }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/pricelists/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching pricelist:', error);
      throw error;
    }
  }

  // Create new pricelist
  async createPricelist(pricelistData: CreatePricelistRequest): Promise<{ data: Pricelist }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/pricelists`, pricelistData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating pricelist:', error);
      throw error;
    }
  }

  // Update pricelist
  async updatePricelist(id: number, updateData: UpdatePricelistRequest): Promise<{ data: Pricelist }> {
    try {
      const response = await axios.put(`${API_BASE_URL}/pricelists/${id}`, updateData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating pricelist:', error);
      throw error;
    }
  }

  // Update pricelist status
  async updatePricelistStatus(id: number, status: Pricelist['status']): Promise<{ data: Pricelist }> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/pricelists/${id}/status`, { status }, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating pricelist status:', error);
      throw error;
    }
  }

  // Delete pricelist
  async deletePricelist(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/pricelists/${id}`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error deleting pricelist:', error);
      throw error;
    }
  }

  // Duplicate pricelist
  async duplicatePricelist(id: number, newName: string): Promise<{ data: Pricelist }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/pricelists/${id}/duplicate`, 
        { name: newName }, 
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error duplicating pricelist:', error);
      throw error;
    }
  }

  // Calculate price for product
  async calculatePrice(calculation: PriceCalculationRequest): Promise<{ data: PriceCalculationResponse }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/pricelists/calculate-price`, calculation, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating price:', error);
      throw error;
    }
  }

  // Get applicable pricelists for customer
  async getApplicablePricelists(customerId: number, productId?: number): Promise<{ data: Pricelist[] }> {
    try {
      const params = productId ? `?productId=${productId}` : '';
      const response = await axios.get(`${API_BASE_URL}/pricelists/applicable/${customerId}${params}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching applicable pricelists:', error);
      throw error;
    }
  }

  // Get pricelist statistics
  async getPricelistStats(filters?: { dateFrom?: string; dateTo?: string }): Promise<{ data: PricelistStats }> {
    try {
      const params = new URLSearchParams();
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      const response = await axios.get(`${API_BASE_URL}/pricelists/stats?${params}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching pricelist stats:', error);
      throw error;
    }
  }

  // Add item to pricelist
  async addPricelistItem(pricelistId: number, item: Omit<PricelistItem, 'id'>): Promise<{ data: PricelistItem }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/pricelists/${pricelistId}/items`, item, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error adding pricelist item:', error);
      throw error;
    }
  }

  // Update pricelist item
  async updatePricelistItem(pricelistId: number, itemId: number, updateData: Partial<PricelistItem>): Promise<{ data: PricelistItem }> {
    try {
      const response = await axios.put(`${API_BASE_URL}/pricelists/${pricelistId}/items/${itemId}`, updateData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating pricelist item:', error);
      throw error;
    }
  }

  // Remove item from pricelist
  async removePricelistItem(pricelistId: number, itemId: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/pricelists/${pricelistId}/items/${itemId}`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error removing pricelist item:', error);
      throw error;
    }
  }

  // Add rule to pricelist
  async addPricelistRule(pricelistId: number, rule: Omit<PricelistRule, 'id'>): Promise<{ data: PricelistRule }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/pricelists/${pricelistId}/rules`, rule, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error adding pricelist rule:', error);
      throw error;
    }
  }

  // Update pricelist rule
  async updatePricelistRule(pricelistId: number, ruleId: number, updateData: Partial<PricelistRule>): Promise<{ data: PricelistRule }> {
    try {
      const response = await axios.put(`${API_BASE_URL}/pricelists/${pricelistId}/rules/${ruleId}`, updateData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating pricelist rule:', error);
      throw error;
    }
  }

  // Remove rule from pricelist
  async removePricelistRule(pricelistId: number, ruleId: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/pricelists/${pricelistId}/rules/${ruleId}`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error removing pricelist rule:', error);
      throw error;
    }
  }

  // Validate pricelist
  async validatePricelist(pricelistData: CreatePricelistRequest | UpdatePricelistRequest): Promise<{ data: { isValid: boolean; errors: string[] } }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/pricelists/validate`, pricelistData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error validating pricelist:', error);
      throw error;
    }
  }

  // Export pricelist
  async exportPricelist(id: number, format: 'csv' | 'xlsx' | 'pdf'): Promise<Blob> {
    try {
      const response = await axios.get(`${API_BASE_URL}/pricelists/${id}/export?format=${format}`, {
        headers: this.getAuthHeaders(),
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting pricelist:', error);
      throw error;
    }
  }

  // Import pricelist
  async importPricelist(file: File, pricelistId?: number): Promise<{ data: { imported: number; errors: string[] } }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (pricelistId) formData.append('pricelistId', pricelistId.toString());

      const response = await axios.post(`${API_BASE_URL}/pricelists/import`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error importing pricelist:', error);
      throw error;
    }
  }

  // Bulk operations
  async bulkUpdateStatus(pricelistIds: number[], status: Pricelist['status']): Promise<{ data: { updated: number } }> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/pricelists/bulk/status`, {
        pricelistIds,
        status,
      }, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating pricelist status:', error);
      throw error;
    }
  }

  async bulkDeletePricelists(pricelistIds: number[]): Promise<{ data: { deleted: number } }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/pricelists/bulk`, {
        headers: this.getAuthHeaders(),
        data: { pricelistIds },
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk deleting pricelists:', error);
      throw error;
    }
  }

  // Get customer segments
  async getCustomerSegments(): Promise<{ data: CustomerSegment[] }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/customer-segments`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching customer segments:', error);
      throw error;
    }
  }
}

const pricelistService = new PricelistService();
export default pricelistService;
