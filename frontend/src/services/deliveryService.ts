import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export interface DeliveryAddress {
  id: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface DeliveryRecord {
  id: number;
  bookingId: number;
  customerName: string;
  customerEmail: string;
  deliveryType: 'pickup' | 'delivery' | 'both';
  status: 'pending' | 'scheduled' | 'in_transit' | 'delivered' | 'returned' | 'cancelled';
  scheduledDate: string;
  actualDate?: string;
  deliveryAddress?: DeliveryAddress;
  returnAddress?: DeliveryAddress;
  notes?: string;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    condition: 'excellent' | 'good' | 'fair' | 'poor';
  }>;
  deliveryFee: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: DeliveryRecord['status'];
  deliveryType?: DeliveryRecord['deliveryType'];
  dateFrom?: string;
  dateTo?: string;
}

export interface DeliveryResponse {
  deliveries: DeliveryRecord[];
  total: number;
  page: number;
  totalPages: number;
}

class DeliveryService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getDeliveries(filters: DeliveryFilters = {}): Promise<{ data: DeliveryResponse }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/deliveries`, {
        params: filters,
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      throw error;
    }
  }

  async getDeliveryById(id: number): Promise<{ data: DeliveryRecord }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/deliveries/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Error fetching delivery:', error);
      throw error;
    }
  }

  async createDelivery(delivery: Partial<DeliveryRecord>): Promise<{ data: DeliveryRecord }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/deliveries`, delivery, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Error creating delivery:', error);
      throw error;
    }
  }

  async updateDelivery(id: number, delivery: Partial<DeliveryRecord>): Promise<{ data: DeliveryRecord }> {
    try {
      const response = await axios.put(`${API_BASE_URL}/deliveries/${id}`, delivery, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Error updating delivery:', error);
      throw error;
    }
  }

  async updateDeliveryStatus(id: number, status: DeliveryRecord['status']): Promise<{ data: DeliveryRecord }> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/deliveries/${id}/status`, { status }, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Error updating delivery status:', error);
      throw error;
    }
  }

  async deleteDelivery(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/deliveries/${id}`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error deleting delivery:', error);
      throw error;
    }
  }

  async scheduleDelivery(id: number, scheduledDate: string): Promise<{ data: DeliveryRecord }> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/deliveries/${id}/schedule`, { scheduledDate }, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Error scheduling delivery:', error);
      throw error;
    }
  }
}

export default new DeliveryService();
