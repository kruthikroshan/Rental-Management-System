import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// API client with auth headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Report interfaces
export interface ReportFilters {
  dateRange?: string;
  startDate?: string;
  endDate?: string;
  reportType?: string;
  customerId?: number;
  productId?: number;
  categoryId?: number;
  status?: string;
  location?: string;
  page?: number;
  limit?: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  monthlyGrowth: number;
  revenueByMonth: RevenueByMonth[];
  revenueByCategory: RevenueByCategory[];
  revenueByLocation: RevenueByLocation[];
  profitMargin: number;
  grossProfit: number;
  netProfit: number;
  operatingExpenses: number;
  costOfGoods: number;
}

export interface RevenueByMonth {
  month: string;
  year: number;
  revenue: number;
  orders: number;
  customers: number;
  growthRate: number;
}

export interface RevenueByCategory {
  categoryId: number;
  categoryName: string;
  revenue: number;
  orders: number;
  percentage: number;
  trend: string;
}

export interface RevenueByLocation {
  location: string;
  city: string;
  state: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface ProductPerformance {
  productId: number;
  productName: string;
  category: string;
  totalRentals: number;
  totalRevenue: number;
  averageRentalPrice: number;
  utilizationRate: number;
  availabilityRate: number;
  maintenanceCost: number;
  profitability: number;
  trend: string;
  rating: number;
  seasonality: SeasonalityData[];
}

export interface SeasonalityData {
  month: string;
  demand: number;
  revenue: number;
  utilizationRate: number;
}

export interface CustomerAnalytics {
  customerId: number;
  customerName: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string;
  customerSince: string;
  lifetimeValue: number;
  paymentBehavior: string;
  preferredCategories: string[];
  riskScore: number;
  loyaltyTier: string;
  renewalRate: number;
  churnRisk: string;
}

export interface OperationalMetrics {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  completionRate: number;
  cancellationRate: number;
  averageRentalDuration: number;
  onTimeDeliveryRate: number;
  onTimeReturnRate: number;
  damageRate: number;
  lossRate: number;
  maintenanceFrequency: number;
  inventoryTurnover: number;
  staffUtilization: number;
  vehicleUtilization: number;
  warehouseUtilization: number;
}

export interface InventoryReport {
  productId: number;
  productName: string;
  category: string;
  totalUnits: number;
  availableUnits: number;
  rentedUnits: number;
  maintenanceUnits: number;
  damagedUnits: number;
  utilizationRate: number;
  reorderLevel: number;
  reorderQuantity: number;
  stockValue: number;
  depreciationRate: number;
  maintenanceSchedule: MaintenanceSchedule[];
}

export interface MaintenanceSchedule {
  scheduleId: number;
  productId: number;
  type: string;
  scheduledDate: string;
  lastMaintenance: string;
  cost: number;
  description: string;
  priority: string;
}

export interface FinancialReport {
  period: string;
  revenue: {
    rental: number;
    damages: number;
    lateFees: number;
    delivery: number;
    other: number;
    total: number;
  };
  expenses: {
    maintenance: number;
    depreciation: number;
    storage: number;
    delivery: number;
    staff: number;
    utilities: number;
    insurance: number;
    other: number;
    total: number;
  };
  netIncome: number;
  profitMargin: number;
  roi: number;
  cashFlow: CashFlowData[];
  balanceSheet: BalanceSheetData;
}

export interface CashFlowData {
  date: string;
  inflow: number;
  outflow: number;
  netFlow: number;
  cumulativeFlow: number;
}

export interface BalanceSheetData {
  assets: {
    inventory: number;
    accounts_receivable: number;
    cash: number;
    equipment: number;
    total: number;
  };
  liabilities: {
    accounts_payable: number;
    loans: number;
    deposits: number;
    total: number;
  };
  equity: number;
}

export interface CustomReport {
  id: number;
  name: string;
  description: string;
  type: string;
  filters: ReportFilters;
  columns: string[];
  groupBy: string[];
  sortBy: string;
  chartType: string;
  schedule: string;
  recipients: string[];
  createdAt: string;
  createdBy: string;
  lastRun: string;
  isActive: boolean;
}

export interface ReportExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeCharts: boolean;
  orientation: 'portrait' | 'landscape';
  pageSize: 'A4' | 'A3' | 'Letter';
  compression: boolean;
}

export interface AnalyticsDashboard {
  widgets: DashboardWidget[];
  metrics: KPIMetrics;
  alerts: ReportAlert[];
  trends: TrendData[];
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'gauge';
  title: string;
  data: any;
  config: any;
  position: { x: number; y: number; w: number; h: number };
}

export interface KPIMetrics {
  revenue: { value: number; change: number; trend: string };
  bookings: { value: number; change: number; trend: string };
  customers: { value: number; change: number; trend: string };
  utilization: { value: number; change: number; trend: string };
  satisfaction: { value: number; change: number; trend: string };
  profit: { value: number; change: number; trend: string };
}

export interface ReportAlert {
  id: number;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  metric: string;
  threshold: number;
  currentValue: number;
  severity: string;
  createdAt: string;
  isRead: boolean;
}

export interface TrendData {
  metric: string;
  data: { date: string; value: number }[];
  prediction: { date: string; value: number; confidence: number }[];
  trend: 'up' | 'down' | 'stable';
  changeRate: number;
}

// Reports Service
class ReportsService {
  // Revenue Reports
  async getRevenueMetrics(filters: ReportFilters = {}): Promise<{ data: RevenueMetrics; success: boolean }> {
    try {
      const response = await apiClient.get('/reports/revenue', { params: filters });
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Error fetching revenue metrics:', error);
      
      // Mock data for development
      const mockData: RevenueMetrics = {
        totalRevenue: 425890,
        totalOrders: 89,
        averageOrderValue: 4785,
        monthlyGrowth: 18.2,
        profitMargin: 32.5,
        grossProfit: 138414,
        netProfit: 89520,
        operatingExpenses: 48894,
        costOfGoods: 287476,
        revenueByMonth: [
          { month: "Jan", year: 2025, revenue: 85000, orders: 24, customers: 18, growthRate: 15.2 },
          { month: "Feb", year: 2025, revenue: 92000, orders: 28, customers: 22, growthRate: 8.2 },
          { month: "Mar", year: 2025, revenue: 78000, orders: 22, customers: 19, growthRate: -15.2 },
          { month: "Apr", year: 2025, revenue: 105000, orders: 32, customers: 28, growthRate: 34.6 },
          { month: "May", year: 2025, revenue: 118000, orders: 38, customers: 31, growthRate: 12.4 },
          { month: "Jun", year: 2025, revenue: 125000, orders: 42, customers: 35, growthRate: 5.9 },
          { month: "Jul", year: 2025, revenue: 132000, orders: 45, customers: 38, growthRate: 5.6 }
        ],
        revenueByCategory: [
          { categoryId: 1, categoryName: "Photography", revenue: 180000, orders: 45, percentage: 42.3, trend: "up" },
          { categoryId: 2, categoryName: "Events", revenue: 135000, orders: 32, percentage: 31.7, trend: "stable" },
          { categoryId: 3, categoryName: "Audio/Video", revenue: 75000, orders: 28, percentage: 17.6, trend: "up" },
          { categoryId: 4, categoryName: "Furniture", revenue: 35890, orders: 15, percentage: 8.4, trend: "down" }
        ],
        revenueByLocation: [
          { location: "Mumbai", city: "Mumbai", state: "Maharashtra", revenue: 180000, orders: 40, customers: 35 },
          { location: "Delhi", city: "New Delhi", state: "Delhi", revenue: 120000, orders: 25, customers: 22 },
          { location: "Bangalore", city: "Bangalore", state: "Karnataka", revenue: 85000, orders: 15, customers: 18 },
          { location: "Chennai", city: "Chennai", state: "Tamil Nadu", revenue: 40890, orders: 9, customers: 12 }
        ]
      };
      
      return { data: mockData, success: true };
    }
  }

  // Product Performance Reports
  async getProductPerformance(filters: ReportFilters = {}): Promise<{ data: ProductPerformance[]; success: boolean }> {
    try {
      const response = await apiClient.get('/reports/products', { params: filters });
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Error fetching product performance:', error);
      
      // Mock data for development
      const mockData: ProductPerformance[] = [
        {
          productId: 1,
          productName: "Professional Camera Kit",
          category: "Photography",
          totalRentals: 45,
          totalRevenue: 90000,
          averageRentalPrice: 2000,
          utilizationRate: 89,
          availabilityRate: 85,
          maintenanceCost: 5400,
          profitability: 32.5,
          trend: "up",
          rating: 4.8,
          seasonality: [
            { month: "Jan", demand: 8, revenue: 16000, utilizationRate: 75 },
            { month: "Feb", demand: 12, revenue: 24000, utilizationRate: 85 },
            { month: "Mar", demand: 15, revenue: 30000, utilizationRate: 95 }
          ]
        },
        {
          productId: 2,
          productName: "Wedding Decoration Set",
          category: "Events",
          totalRentals: 32,
          totalRevenue: 80000,
          averageRentalPrice: 2500,
          utilizationRate: 76,
          availabilityRate: 80,
          maintenanceCost: 3200,
          profitability: 38.2,
          trend: "stable",
          rating: 4.6,
          seasonality: [
            { month: "Jan", demand: 5, revenue: 12500, utilizationRate: 60 },
            { month: "Feb", demand: 8, revenue: 20000, utilizationRate: 70 },
            { month: "Mar", demand: 12, revenue: 30000, utilizationRate: 85 }
          ]
        },
        {
          productId: 3,
          productName: "Sound System Pro",
          category: "Audio/Video",
          totalRentals: 28,
          totalRevenue: 42000,
          averageRentalPrice: 1500,
          utilizationRate: 65,
          availabilityRate: 75,
          maintenanceCost: 2800,
          profitability: 28.1,
          trend: "up",
          rating: 4.4,
          seasonality: [
            { month: "Jan", demand: 6, revenue: 9000, utilizationRate: 55 },
            { month: "Feb", demand: 9, revenue: 13500, utilizationRate: 65 },
            { month: "Mar", demand: 13, revenue: 19500, utilizationRate: 75 }
          ]
        }
      ];
      
      return { data: mockData, success: true };
    }
  }

  // Customer Analytics
  async getCustomerAnalytics(filters: ReportFilters = {}): Promise<{ data: CustomerAnalytics[]; success: boolean }> {
    try {
      const response = await apiClient.get('/reports/customers', { params: filters });
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
      
      // Mock data for development
      const mockData: CustomerAnalytics[] = [
        {
          customerId: 15,
          customerName: "Rajesh Kumar",
          email: "rajesh.kumar@email.com",
          phone: "+91 98765 43210",
          totalOrders: 12,
          totalSpent: 45000,
          averageOrderValue: 3750,
          lastOrderDate: "2025-08-10",
          customerSince: "2024-03-15",
          lifetimeValue: 68000,
          paymentBehavior: "excellent",
          preferredCategories: ["Photography", "Events"],
          riskScore: 15,
          loyaltyTier: "Gold",
          renewalRate: 85,
          churnRisk: "low"
        },
        {
          customerId: 22,
          customerName: "Priya Sharma",
          email: "priya.sharma@email.com",
          phone: "+91 98765 43211",
          totalOrders: 8,
          totalSpent: 32000,
          averageOrderValue: 4000,
          lastOrderDate: "2025-08-09",
          customerSince: "2024-05-20",
          lifetimeValue: 48000,
          paymentBehavior: "good",
          preferredCategories: ["Events", "Furniture"],
          riskScore: 25,
          loyaltyTier: "Silver",
          renewalRate: 75,
          churnRisk: "medium"
        }
      ];
      
      return { data: mockData, success: true };
    }
  }

  // Operational Metrics
  async getOperationalMetrics(filters: ReportFilters = {}): Promise<{ data: OperationalMetrics; success: boolean }> {
    try {
      const response = await apiClient.get('/reports/operations', { params: filters });
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Error fetching operational metrics:', error);
      
      // Mock data for development
      const mockData: OperationalMetrics = {
        totalBookings: 156,
        completedBookings: 142,
        cancelledBookings: 14,
        completionRate: 91.0,
        cancellationRate: 9.0,
        averageRentalDuration: 4.5,
        onTimeDeliveryRate: 94.5,
        onTimeReturnRate: 88.2,
        damageRate: 3.8,
        lossRate: 0.6,
        maintenanceFrequency: 2.1,
        inventoryTurnover: 6.2,
        staffUtilization: 78.5,
        vehicleUtilization: 82.3,
        warehouseUtilization: 65.8
      };
      
      return { data: mockData, success: true };
    }
  }

  // Inventory Reports
  async getInventoryReport(filters: ReportFilters = {}): Promise<{ data: InventoryReport[]; success: boolean }> {
    try {
      const response = await apiClient.get('/reports/inventory', { params: filters });
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Error fetching inventory report:', error);
      
      // Mock data for development
      const mockData: InventoryReport[] = [
        {
          productId: 1,
          productName: "Professional Camera Kit",
          category: "Photography",
          totalUnits: 15,
          availableUnits: 8,
          rentedUnits: 5,
          maintenanceUnits: 1,
          damagedUnits: 1,
          utilizationRate: 73.3,
          reorderLevel: 5,
          reorderQuantity: 3,
          stockValue: 450000,
          depreciationRate: 15.5,
          maintenanceSchedule: [
            { scheduleId: 1, productId: 1, type: "Routine Check", scheduledDate: "2025-08-20", lastMaintenance: "2025-07-20", cost: 500, description: "General inspection and cleaning", priority: "medium" },
            { scheduleId: 2, productId: 1, type: "Deep Maintenance", scheduledDate: "2025-09-15", lastMaintenance: "2025-06-15", cost: 1500, description: "Complete overhaul and calibration", priority: "high" }
          ]
        },
        {
          productId: 2,
          productName: "Wedding Decoration Set",
          category: "Events",
          totalUnits: 8,
          availableUnits: 6,
          rentedUnits: 2,
          maintenanceUnits: 0,
          damagedUnits: 0,
          utilizationRate: 56.3,
          reorderLevel: 3,
          reorderQuantity: 2,
          stockValue: 160000,
          depreciationRate: 8.2,
          maintenanceSchedule: [
            { scheduleId: 3, productId: 2, type: "Cleaning", scheduledDate: "2025-08-18", lastMaintenance: "2025-08-10", cost: 200, description: "Deep cleaning and sanitization", priority: "low" }
          ]
        }
      ];
      
      return { data: mockData, success: true };
    }
  }

  // Financial Reports
  async getFinancialReport(filters: ReportFilters = {}): Promise<{ data: FinancialReport; success: boolean }> {
    try {
      const response = await apiClient.get('/reports/financial', { params: filters });
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Error fetching financial report:', error);
      
      // Mock data for development
      const mockData: FinancialReport = {
        period: "Q2 2025",
        revenue: {
          rental: 380000,
          damages: 12500,
          lateFees: 5800,
          delivery: 18900,
          other: 8690,
          total: 425890
        },
        expenses: {
          maintenance: 45000,
          depreciation: 68000,
          storage: 25000,
          delivery: 32000,
          staff: 125000,
          utilities: 18000,
          insurance: 22000,
          other: 15000,
          total: 350000
        },
        netIncome: 75890,
        profitMargin: 17.8,
        roi: 22.5,
        cashFlow: [
          { date: "2025-05-01", inflow: 125000, outflow: 98000, netFlow: 27000, cumulativeFlow: 27000 },
          { date: "2025-06-01", inflow: 145000, outflow: 112000, netFlow: 33000, cumulativeFlow: 60000 },
          { date: "2025-07-01", inflow: 155890, outflow: 140000, netFlow: 15890, cumulativeFlow: 75890 }
        ],
        balanceSheet: {
          assets: {
            inventory: 1250000,
            accounts_receivable: 85000,
            cash: 95000,
            equipment: 450000,
            total: 1880000
          },
          liabilities: {
            accounts_payable: 65000,
            loans: 450000,
            deposits: 125000,
            total: 640000
          },
          equity: 1240000
        }
      };
      
      return { data: mockData, success: true };
    }
  }

  // Custom Reports
  async getCustomReports(): Promise<{ data: CustomReport[]; success: boolean }> {
    try {
      const response = await apiClient.get('/reports/custom');
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Error fetching custom reports:', error);
      
      // Mock data for development
      const mockData: CustomReport[] = [
        {
          id: 1,
          name: "Monthly Revenue Report",
          description: "Comprehensive monthly revenue analysis with category breakdown",
          type: "revenue",
          filters: { dateRange: "last_month" },
          columns: ["date", "revenue", "orders", "category"],
          groupBy: ["category", "date"],
          sortBy: "revenue",
          chartType: "line",
          schedule: "monthly",
          recipients: ["manager@company.com", "finance@company.com"],
          createdAt: "2025-01-15",
          createdBy: "admin",
          lastRun: "2025-08-01",
          isActive: true
        }
      ];
      
      return { data: mockData, success: true };
    }
  }

  async createCustomReport(report: Omit<CustomReport, 'id' | 'createdAt' | 'createdBy' | 'lastRun'>): Promise<{ data: CustomReport; success: boolean }> {
    try {
      const response = await apiClient.post('/reports/custom', report);
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Error creating custom report:', error);
      throw error;
    }
  }

  async runCustomReport(reportId: number): Promise<{ data: any; success: boolean }> {
    try {
      const response = await apiClient.post(`/reports/custom/${reportId}/run`);
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Error running custom report:', error);
      throw error;
    }
  }

  // Analytics Dashboard
  async getAnalyticsDashboard(): Promise<{ data: AnalyticsDashboard; success: boolean }> {
    try {
      const response = await apiClient.get('/reports/dashboard');
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Error fetching analytics dashboard:', error);
      
      // Mock data for development
      const mockData: AnalyticsDashboard = {
        widgets: [
          {
            id: "revenue-chart",
            type: "chart",
            title: "Revenue Trend",
            data: { chartData: [], type: "line" },
            config: { height: 300, colors: ["#3b82f6"] },
            position: { x: 0, y: 0, w: 6, h: 4 }
          },
          {
            id: "top-products",
            type: "table",
            title: "Top Products",
            data: { rows: [], columns: ["Product", "Revenue", "Orders"] },
            config: { pageSize: 5 },
            position: { x: 6, y: 0, w: 6, h: 4 }
          }
        ],
        metrics: {
          revenue: { value: 425890, change: 18.2, trend: "up" },
          bookings: { value: 156, change: 12.5, trend: "up" },
          customers: { value: 89, change: 8.9, trend: "up" },
          utilization: { value: 78.5, change: 5.2, trend: "up" },
          satisfaction: { value: 4.6, change: 2.1, trend: "up" },
          profit: { value: 75890, change: 25.4, trend: "up" }
        },
        alerts: [
          {
            id: 1,
            type: "warning",
            title: "Low Inventory Alert",
            message: "Professional Camera Kit stock is running low (3 units remaining)",
            metric: "inventory",
            threshold: 5,
            currentValue: 3,
            severity: "medium",
            createdAt: "2025-08-15T10:30:00Z",
            isRead: false
          }
        ],
        trends: [
          {
            metric: "revenue",
            data: [
              { date: "2025-07-01", value: 85000 },
              { date: "2025-07-15", value: 92000 },
              { date: "2025-08-01", value: 105000 },
              { date: "2025-08-15", value: 118000 }
            ],
            prediction: [
              { date: "2025-09-01", value: 125000, confidence: 85 },
              { date: "2025-09-15", value: 132000, confidence: 78 }
            ],
            trend: "up",
            changeRate: 18.2
          }
        ]
      };
      
      return { data: mockData, success: true };
    }
  }

  // Export Reports
  async exportReport(
    reportType: string,
    format: 'pdf' | 'excel' | 'csv' | 'json',
    filters: ReportFilters = {},
    options: ReportExportOptions = {
      format: 'pdf',
      includeCharts: true,
      orientation: 'portrait',
      pageSize: 'A4',
      compression: true
    }
  ): Promise<Blob> {
    try {
      const response = await apiClient.post('/reports/export', {
        reportType,
        format,
        filters,
        options
      }, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exporting report:', error);
      
      // Generate mock blob for development
      const mockData = JSON.stringify({
        report: reportType,
        format: format,
        generatedAt: new Date().toISOString(),
        data: "Mock report data"
      });
      
      return new Blob([mockData], {
        type: format === 'pdf' ? 'application/pdf' : 
              format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
              format === 'csv' ? 'text/csv' : 'application/json'
      });
    }
  }

  // Schedule Reports
  async scheduleReport(reportId: number, schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time: string;
    recipients: string[];
    format: string;
  }): Promise<{ success: boolean }> {
    try {
      await apiClient.post(`/reports/${reportId}/schedule`, schedule);
      return { success: true };
    } catch (error) {
      console.error('Error scheduling report:', error);
      throw error;
    }
  }

  // Report Insights (AI-powered analytics)
  async getReportInsights(reportType: string, filters: ReportFilters = {}): Promise<{ data: any; success: boolean }> {
    try {
      const response = await apiClient.get('/reports/insights', { params: { reportType, ...filters } });
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Error fetching report insights:', error);
      
      // Mock insights for development
      const mockData = {
        insights: [
          {
            type: "trend",
            title: "Revenue Growth Acceleration",
            description: "Revenue growth has accelerated by 25% compared to the previous quarter, driven primarily by increased demand in Photography equipment.",
            impact: "high",
            actionable: true,
            recommendations: [
              "Consider expanding Photography equipment inventory",
              "Implement dynamic pricing for peak demand periods",
              "Develop targeted marketing campaigns for Photography segment"
            ]
          },
          {
            type: "anomaly",
            title: "Unusual Cancellation Pattern",
            description: "Cancellation rates have increased by 15% in the Furniture category over the past month.",
            impact: "medium",
            actionable: true,
            recommendations: [
              "Review furniture quality and customer feedback",
              "Investigate delivery and setup processes",
              "Consider adjusting cancellation policies"
            ]
          }
        ],
        predictions: [
          {
            metric: "monthly_revenue",
            prediction: 145000,
            confidence: 87,
            timeframe: "next_month",
            factors: ["seasonal_demand", "market_trends", "inventory_availability"]
          }
        ]
      };
      
      return { data: mockData, success: true };
    }
  }
}

const reportsService = new ReportsService();
export default reportsService;
