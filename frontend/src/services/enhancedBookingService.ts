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

// Booking interfaces
export interface BookingItem {
  id?: number;
  productId: number;
  productName: string;
  productSku: string;
  productImage?: string;
  category: string;
  quantity: number;
  unitRate: number;
  duration: number;
  durationType: 'hour' | 'day' | 'week' | 'month' | 'year';
  lineTotal: number;
  securityDepositPerUnit: number;
  totalSecurityDeposit: number;
  availability: {
    available: number;
    reserved: number;
    maintenance: number;
  };
  specifications?: { [key: string]: string };
  notes?: string;
}

export interface BookingAddress {
  id?: number;
  type: 'delivery' | 'pickup';
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  landmark?: string;
  instructions?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface BookingPayment {
  id?: number;
  method: 'card' | 'upi' | 'bank_transfer' | 'cash' | 'check' | 'digital_wallet';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  transactionId?: string;
  paymentDate?: string;
  dueDate: string;
  installments?: BookingInstallment[];
}

export interface BookingInstallment {
  id: number;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
  description: string;
}

export interface Booking {
  id: number;
  bookingRef: string;
  quotationId?: number;
  quotationRef?: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue' | 'refunded';
  
  // Booking Details
  startDate: string;
  endDate: string;
  duration: number;
  durationType: 'hour' | 'day' | 'week' | 'month' | 'year';
  
  // Items and Pricing
  items: BookingItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalSecurityDeposit: number;
  finalAmount: number;
  
  // Addresses
  deliveryAddress?: BookingAddress;
  pickupAddress?: BookingAddress;
  deliveryRequired: boolean;
  pickupRequired: boolean;
  
  // Payment Information
  payment: BookingPayment;
  
  // Additional Information
  notes?: string;
  specialInstructions?: string;
  internalNotes?: string;
  
  // Tracking
  deliveryStatus?: 'scheduled' | 'in_transit' | 'delivered' | 'failed';
  pickupStatus?: 'scheduled' | 'in_transit' | 'picked_up' | 'failed';
  deliveryDate?: string;
  pickupDate?: string;
  actualDeliveryDate?: string;
  actualPickupDate?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
  
  // Related Records
  invoiceId?: number;
  invoiceRef?: string;
  contracts?: BookingContract[];
  documents?: BookingDocument[];
  timeline?: BookingTimelineEvent[];
}

export interface BookingContract {
  id: number;
  type: 'rental_agreement' | 'security_deposit' | 'insurance' | 'terms_and_conditions';
  title: string;
  content: string;
  signedDate?: string;
  signedBy?: string;
  documentUrl?: string;
  isRequired: boolean;
  isSigned: boolean;
}

export interface BookingDocument {
  id: number;
  type: 'id_proof' | 'address_proof' | 'business_license' | 'insurance_certificate' | 'other';
  name: string;
  url: string;
  uploadedDate: string;
  uploadedBy: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedDate?: string;
}

export interface BookingTimelineEvent {
  id: number;
  type: 'booking_created' | 'payment_received' | 'items_delivered' | 'items_returned' | 'booking_completed' | 'issue_reported' | 'status_changed';
  title: string;
  description: string;
  timestamp: string;
  performedBy: string;
  metadata?: { [key: string]: any };
}

export interface BookingFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  customerId?: number;
  productId?: number;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'startDate' | 'endDate' | 'finalAmount';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateBookingRequest {
  customerId: number;
  startDate: string;
  endDate: string;
  items: Omit<BookingItem, 'id' | 'lineTotal' | 'totalSecurityDeposit'>[];
  deliveryAddress?: Omit<BookingAddress, 'id'>;
  pickupAddress?: Omit<BookingAddress, 'id'>;
  deliveryRequired: boolean;
  pickupRequired: boolean;
  paymentMethod: string;
  notes?: string;
  specialInstructions?: string;
}

export interface BookingStats {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  overdueBookings: number;
  totalRevenue: number;
  pendingPayments: number;
  averageBookingValue: number;
  bookingsByStatus: { [key: string]: number };
  monthlyBookings: { month: string; count: number; revenue: number }[];
  topProducts: { productId: number; productName: string; bookings: number; revenue: number }[];
  topCustomers: { customerId: number; customerName: string; bookings: number; revenue: number }[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  baseRentalRate: number;
  securityDeposit: number;
  categoryId: number;
  category: {
    id: number;
    name: string;
  };
  condition: 'excellent' | 'good' | 'fair' | 'needs_repair';
  rentalUnits: 'hour' | 'day' | 'week' | 'month';
  minRentalDuration: number;
  maxRentalDuration?: number;
  isRentable: boolean;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  maintenanceQuantity: number;
  tags: string[];
  images: ProductImage[];
  specifications?: { [key: string]: string };
  isActive: boolean;
  isFeatured: boolean;
  popularityScore: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: number;
  url: string;
  altText: string;
  isPrimary: boolean;
  order: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  isActive: boolean;
  productsCount: number;
  imageUrl?: string;
}

// Enhanced Booking Service
class BookingService {
  // Get all bookings with filters
  async getBookings(filters: BookingFilters = {}): Promise<{ data: { bookings: Booking[]; total: number; stats: BookingStats }; success: boolean }> {
    try {
      const response = await apiClient.get('/bookings', { params: filters });
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Error fetching bookings:', error);
      
      // Mock data for development
      const mockBookings: Booking[] = [
        {
          id: 1,
          bookingRef: "BKG-2025-001",
          customerId: 15,
          customerName: "Rajesh Kumar",
          customerEmail: "rajesh.kumar@email.com",
          customerPhone: "+91 98765 43210",
          status: "confirmed",
          paymentStatus: "partial",
          startDate: "2025-08-18",
          endDate: "2025-08-20",
          duration: 3,
          durationType: "day",
          items: [
            {
              id: 1,
              productId: 1,
              productName: "Professional Camera Kit",
              productSku: "PRD-001",
              productImage: "/api/placeholder/300/200",
              category: "Photography",
              quantity: 1,
              unitRate: 2000,
              duration: 3,
              durationType: "day",
              lineTotal: 6000,
              securityDepositPerUnit: 10000,
              totalSecurityDeposit: 10000,
              availability: { available: 3, reserved: 1, maintenance: 0 },
              specifications: {
                "Camera": "Canon EOS R5",
                "Lenses": "24-70mm f/2.8, 85mm f/1.4",
                "Accessories": "Tripod, Flash, Memory Cards"
              }
            }
          ],
          subtotal: 6000,
          taxAmount: 1080,
          discountAmount: 0,
          totalSecurityDeposit: 10000,
          finalAmount: 7080,
          deliveryAddress: {
            id: 1,
            type: "delivery",
            contactName: "Rajesh Kumar",
            contactPhone: "+91 98765 43210",
            contactEmail: "rajesh.kumar@email.com",
            street: "123 MG Road",
            city: "Mumbai",
            state: "Maharashtra",
            zipCode: "400001",
            country: "India",
            landmark: "Near Metro Station",
            instructions: "Call 30 minutes before delivery"
          },
          pickupAddress: {
            id: 2,
            type: "pickup",
            contactName: "Rajesh Kumar",
            contactPhone: "+91 98765 43210",
            street: "123 MG Road",
            city: "Mumbai",
            state: "Maharashtra",
            zipCode: "400001",
            country: "India"
          },
          deliveryRequired: true,
          pickupRequired: true,
          payment: {
            id: 1,
            method: "upi",
            status: "completed",
            amount: 7080,
            paidAmount: 3540,
            pendingAmount: 3540,
            dueDate: "2025-08-17",
            installments: [
              {
                id: 1,
                amount: 3540,
                dueDate: "2025-08-15",
                status: "paid",
                paidDate: "2025-08-14",
                description: "Advance payment (50%)"
              },
              {
                id: 2,
                amount: 3540,
                dueDate: "2025-08-20",
                status: "pending",
                description: "Final payment (50%)"
              }
            ]
          },
          notes: "Customer requested early morning delivery",
          specialInstructions: "Handle camera equipment with extra care",
          deliveryStatus: "scheduled",
          pickupStatus: "scheduled",
          deliveryDate: "2025-08-18T08:00:00Z",
          pickupDate: "2025-08-20T18:00:00Z",
          createdAt: "2025-08-12T10:30:00Z",
          updatedAt: "2025-08-12T10:30:00Z",
          createdBy: "customer",
          timeline: [
            {
              id: 1,
              type: "booking_created",
              title: "Booking Created",
              description: "New booking created by customer",
              timestamp: "2025-08-12T10:30:00Z",
              performedBy: "Rajesh Kumar"
            },
            {
              id: 2,
              type: "payment_received",
              title: "Advance Payment Received",
              description: "Received ₹3,540 via UPI",
              timestamp: "2025-08-14T14:20:00Z",
              performedBy: "System"
            }
          ]
        },
        {
          id: 2,
          bookingRef: "BKG-2025-002",
          customerId: 22,
          customerName: "Priya Sharma",
          customerEmail: "priya.sharma@email.com",
          customerPhone: "+91 98765 43211",
          status: "in_progress",
          paymentStatus: "paid",
          startDate: "2025-08-15",
          endDate: "2025-08-17",
          duration: 3,
          durationType: "day",
          items: [
            {
              id: 2,
              productId: 2,
              productName: "Wedding Decoration Set",
              productSku: "PRD-002",
              category: "Events",
              quantity: 1,
              unitRate: 15000,
              duration: 3,
              durationType: "day",
              lineTotal: 45000,
              securityDepositPerUnit: 25000,
              totalSecurityDeposit: 25000,
              availability: { available: 2, reserved: 1, maintenance: 0 }
            }
          ],
          subtotal: 45000,
          taxAmount: 8100,
          discountAmount: 2250,
          totalSecurityDeposit: 25000,
          finalAmount: 50850,
          deliveryAddress: {
            id: 3,
            type: "delivery",
            contactName: "Priya Sharma",
            contactPhone: "+91 98765 43211",
            street: "456 Park Avenue",
            city: "Delhi",
            state: "Delhi",
            zipCode: "110001",
            country: "India"
          },
          deliveryRequired: true,
          pickupRequired: true,
          payment: {
            id: 2,
            method: "card",
            status: "completed",
            amount: 50850,
            paidAmount: 50850,
            pendingAmount: 0,
            dueDate: "2025-08-14"
          },
          deliveryStatus: "delivered",
          pickupStatus: "scheduled",
          deliveryDate: "2025-08-15T06:00:00Z",
          pickupDate: "2025-08-17T20:00:00Z",
          actualDeliveryDate: "2025-08-15T06:15:00Z",
          createdAt: "2025-08-10T15:45:00Z",
          updatedAt: "2025-08-15T06:15:00Z",
          createdBy: "customer"
        }
      ];

      const mockStats: BookingStats = {
        totalBookings: 156,
        activeBookings: 23,
        completedBookings: 128,
        cancelledBookings: 5,
        overdueBookings: 3,
        totalRevenue: 2850000,
        pendingPayments: 185000,
        averageBookingValue: 18269,
        bookingsByStatus: {
          confirmed: 15,
          in_progress: 8,
          completed: 128,
          cancelled: 5
        },
        monthlyBookings: [
          { month: "Jan", count: 18, revenue: 285000 },
          { month: "Feb", count: 22, revenue: 345000 },
          { month: "Mar", count: 25, revenue: 425000 },
          { month: "Apr", count: 28, revenue: 485000 },
          { month: "May", count: 32, revenue: 565000 },
          { month: "Jun", count: 31, revenue: 540000 }
        ],
        topProducts: [
          { productId: 1, productName: "Professional Camera Kit", bookings: 45, revenue: 450000 },
          { productId: 2, productName: "Wedding Decoration Set", bookings: 32, revenue: 680000 }
        ],
        topCustomers: [
          { customerId: 15, customerName: "Rajesh Kumar", bookings: 12, revenue: 185000 },
          { customerId: 22, customerName: "Priya Sharma", bookings: 8, revenue: 142000 }
        ]
      };
      
      return { data: { bookings: mockBookings, total: mockBookings.length, stats: mockStats }, success: true };
    }
  }

  // Get single booking by ID
  async getBooking(id: number): Promise<{ data: Booking; success: boolean }> {
    try {
      const response = await apiClient.get(`/bookings/${id}`);
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  }

  // Create new booking
  async createBooking(bookingData: CreateBookingRequest): Promise<{ data: Booking; success: boolean }> {
    try {
      const response = await apiClient.post('/bookings', bookingData);
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  // Update booking
  async updateBooking(id: number, updateData: Partial<Booking>): Promise<{ data: Booking; success: boolean }> {
    try {
      const response = await apiClient.put(`/bookings/${id}`, updateData);
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }

  // Update booking status
  async updateBookingStatus(id: number, status: string): Promise<{ data: Booking; success: boolean }> {
    try {
      const response = await apiClient.patch(`/bookings/${id}/status`, { status });
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  // Cancel booking
  async cancelBooking(id: number, reason: string): Promise<{ data: Booking; success: boolean }> {
    try {
      const response = await apiClient.patch(`/bookings/${id}/cancel`, { reason });
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  // Get available products for booking
  async getAvailableProducts(filters: {
    startDate: string;
    endDate: string;
    categoryId?: number;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: { products: Product[]; total: number }; success: boolean }> {
    try {
      const response = await apiClient.get('/products/available', { params: filters });
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Error fetching available products:', error);
      
      // Mock available products
      const mockProducts: Product[] = [
        {
          id: 1,
          name: "Professional Camera Kit",
          slug: "professional-camera-kit",
          sku: "PRD-001",
          description: "Complete professional photography setup with DSLR camera, multiple lenses, tripod, lighting equipment, and all necessary accessories. Perfect for events, portraits, and commercial photography.",
          baseRentalRate: 2000,
          securityDeposit: 10000,
          categoryId: 1,
          category: { id: 1, name: "Photography" },
          condition: "excellent",
          rentalUnits: "day",
          minRentalDuration: 1,
          maxRentalDuration: 30,
          isRentable: true,
          totalQuantity: 5,
          availableQuantity: 3,
          reservedQuantity: 1,
          maintenanceQuantity: 1,
          tags: ["camera", "photography", "professional", "DSLR"],
          images: [
            { id: 1, url: "/api/placeholder/400/300", altText: "Professional Camera Kit", isPrimary: true, order: 1 },
            { id: 2, url: "/api/placeholder/400/300", altText: "Camera Kit Contents", isPrimary: false, order: 2 }
          ],
          specifications: {
            "Camera Model": "Canon EOS R5",
            "Primary Lens": "RF 24-70mm f/2.8L IS USM",
            "Secondary Lens": "RF 85mm f/1.2L USM",
            "Tripod": "Manfrotto Professional",
            "Flash": "Canon Speedlite 600EX II-RT",
            "Memory Cards": "2x 128GB CFexpress",
            "Batteries": "3x Canon LP-E6NH",
            "Case": "Professional Hard Case"
          },
          isActive: true,
          isFeatured: true,
          popularityScore: 95,
          rating: 4.8,
          reviewCount: 127,
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2025-08-12T10:00:00Z"
        },
        {
          id: 2,
          name: "Wedding Decoration Set",
          slug: "wedding-decoration-set",
          sku: "PRD-002",
          description: "Comprehensive wedding decoration package including flower arrangements, lighting, draping, centerpieces, and complete setup service. Customizable themes and colors available.",
          baseRentalRate: 15000,
          securityDeposit: 25000,
          categoryId: 2,
          category: { id: 2, name: "Events" },
          condition: "excellent",
          rentalUnits: "day",
          minRentalDuration: 1,
          maxRentalDuration: 7,
          isRentable: true,
          totalQuantity: 3,
          availableQuantity: 2,
          reservedQuantity: 1,
          maintenanceQuantity: 0,
          tags: ["wedding", "decoration", "events", "flowers", "lighting"],
          images: [
            { id: 3, url: "/api/placeholder/400/300", altText: "Wedding Decoration Setup", isPrimary: true, order: 1 },
            { id: 4, url: "/api/placeholder/400/300", altText: "Flower Arrangements", isPrimary: false, order: 2 }
          ],
          specifications: {
            "Flower Arrangements": "20 centerpieces, 8 large arrangements",
            "Lighting": "LED string lights, uplighting, spotlights",
            "Draping": "Silk draping for stage and walls",
            "Seating": "Decorated chairs and tables",
            "Setup": "Complete decoration and removal service",
            "Customization": "Color themes and personalization available"
          },
          isActive: true,
          isFeatured: true,
          popularityScore: 88,
          rating: 4.6,
          reviewCount: 89,
          createdAt: "2024-02-01T10:00:00Z",
          updatedAt: "2025-08-12T10:00:00Z"
        },
        {
          id: 3,
          name: "Sound System Pro",
          slug: "sound-system-pro",
          sku: "PRD-003",
          description: "Professional audio system with speakers, microphones, mixing console, and amplifiers. Suitable for conferences, parties, and outdoor events.",
          baseRentalRate: 1500,
          securityDeposit: 8000,
          categoryId: 3,
          category: { id: 3, name: "Audio/Video" },
          condition: "good",
          rentalUnits: "day",
          minRentalDuration: 1,
          maxRentalDuration: 14,
          isRentable: true,
          totalQuantity: 8,
          availableQuantity: 6,
          reservedQuantity: 1,
          maintenanceQuantity: 1,
          tags: ["audio", "sound", "speakers", "microphone", "events"],
          images: [
            { id: 5, url: "/api/placeholder/400/300", altText: "Sound System Setup", isPrimary: true, order: 1 }
          ],
          specifications: {
            "Main Speakers": "2x JBL SRX835P",
            "Subwoofer": "2x JBL SRX828SP",
            "Mixing Console": "Yamaha MG16XU",
            "Microphones": "4x Wireless + 2x Wired",
            "Amplifier": "Crown XTi 4002",
            "Cables": "Complete cable package included"
          },
          isActive: true,
          isFeatured: false,
          popularityScore: 72,
          rating: 4.4,
          reviewCount: 56,
          createdAt: "2024-01-20T10:00:00Z",
          updatedAt: "2025-08-12T10:00:00Z"
        },
        {
          id: 4,
          name: "Furniture Set Deluxe",
          slug: "furniture-set-deluxe",
          sku: "PRD-004",
          description: "Premium furniture set including sofas, chairs, tables, and decorative items. Perfect for events, photo shoots, and temporary office setups.",
          baseRentalRate: 3000,
          securityDeposit: 15000,
          categoryId: 4,
          category: { id: 4, name: "Furniture" },
          condition: "excellent",
          rentalUnits: "day",
          minRentalDuration: 2,
          maxRentalDuration: 30,
          isRentable: true,
          totalQuantity: 4,
          availableQuantity: 3,
          reservedQuantity: 0,
          maintenanceQuantity: 1,
          tags: ["furniture", "sofa", "chairs", "tables", "premium"],
          images: [
            { id: 6, url: "/api/placeholder/400/300", altText: "Deluxe Furniture Set", isPrimary: true, order: 1 }
          ],
          specifications: {
            "Sofa Set": "3-seater + 2x 2-seater leather sofas",
            "Coffee Table": "Glass top with wooden base",
            "Side Tables": "2x matching wooden side tables",
            "Decorative Items": "Lamps, cushions, throws",
            "Dining Set": "6-seater dining table with chairs",
            "Material": "Premium leather and solid wood"
          },
          isActive: true,
          isFeatured: true,
          popularityScore: 78,
          rating: 4.5,
          reviewCount: 43,
          createdAt: "2024-03-01T10:00:00Z",
          updatedAt: "2025-08-12T10:00:00Z"
        },
        {
          id: 5,
          name: "Lighting Equipment Package",
          slug: "lighting-equipment-package",
          sku: "PRD-005",
          description: "Professional lighting setup with LED panels, softboxes, stands, and control systems. Ideal for photography, videography, and event lighting.",
          baseRentalRate: 2500,
          securityDeposit: 12000,
          categoryId: 1,
          category: { id: 1, name: "Photography" },
          condition: "excellent",
          rentalUnits: "day",
          minRentalDuration: 1,
          maxRentalDuration: 21,
          isRentable: true,
          totalQuantity: 6,
          availableQuantity: 4,
          reservedQuantity: 1,
          maintenanceQuantity: 1,
          tags: ["lighting", "LED", "photography", "videography", "professional"],
          images: [
            { id: 7, url: "/api/placeholder/400/300", altText: "Lighting Equipment", isPrimary: true, order: 1 }
          ],
          specifications: {
            "LED Panels": "4x Aputure 300D Mark II",
            "Softboxes": "4x Professional softboxes",
            "Light Stands": "4x Heavy-duty adjustable stands",
            "Controller": "Wireless DMX controller",
            "Gels & Filters": "Complete color gel kit",
            "Power": "Battery packs and AC adapters"
          },
          isActive: true,
          isFeatured: false,
          popularityScore: 82,
          rating: 4.7,
          reviewCount: 67,
          createdAt: "2024-02-15T10:00:00Z",
          updatedAt: "2025-08-12T10:00:00Z"
        },
        {
          id: 6,
          name: "DJ Equipment Set",
          slug: "dj-equipment-set",
          sku: "PRD-006",
          description: "Complete DJ setup with turntables, mixer, speakers, and lighting. Perfect for parties, weddings, and club events.",
          baseRentalRate: 4000,
          securityDeposit: 20000,
          categoryId: 3,
          category: { id: 3, name: "Audio/Video" },
          condition: "excellent",
          rentalUnits: "day",
          minRentalDuration: 1,
          maxRentalDuration: 7,
          isRentable: true,
          totalQuantity: 2,
          availableQuantity: 1,
          reservedQuantity: 1,
          maintenanceQuantity: 0,
          tags: ["DJ", "turntables", "mixer", "party", "music"],
          images: [
            { id: 8, url: "/api/placeholder/400/300", altText: "DJ Equipment Setup", isPrimary: true, order: 1 }
          ],
          specifications: {
            "Turntables": "2x Pioneer CDJ-3000",
            "Mixer": "Pioneer DJM-A9",
            "Speakers": "2x Pioneer XPRS215",
            "Subwoofer": "Pioneer XPRS115S",
            "Headphones": "Pioneer HDJ-X10",
            "Lighting": "LED party lights and lasers"
          },
          isActive: true,
          isFeatured: true,
          popularityScore: 90,
          rating: 4.8,
          reviewCount: 112,
          createdAt: "2024-01-10T10:00:00Z",
          updatedAt: "2025-08-12T10:00:00Z"
        }
      ];
      
      return { data: { products: mockProducts, total: mockProducts.length }, success: true };
    }
  }

  // Get categories
  async getCategories(): Promise<{ data: Category[]; success: boolean }> {
    try {
      const response = await apiClient.get('/categories');
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Error fetching categories:', error);
      
      const mockCategories: Category[] = [
        { id: 1, name: "Photography", slug: "photography", isActive: true, productsCount: 15, imageUrl: "/api/placeholder/200/150" },
        { id: 2, name: "Events", slug: "events", isActive: true, productsCount: 12, imageUrl: "/api/placeholder/200/150" },
        { id: 3, name: "Audio/Video", slug: "audio-video", isActive: true, productsCount: 18, imageUrl: "/api/placeholder/200/150" },
        { id: 4, name: "Furniture", slug: "furniture", isActive: true, productsCount: 8, imageUrl: "/api/placeholder/200/150" },
        { id: 5, name: "Sports Equipment", slug: "sports", isActive: true, productsCount: 22, imageUrl: "/api/placeholder/200/150" },
        { id: 6, name: "Party Supplies", slug: "party-supplies", isActive: true, productsCount: 35, imageUrl: "/api/placeholder/200/150" }
      ];
      
      return { data: mockCategories, success: true };
    }
  }

  // Calculate booking cost
  async calculateBookingCost(items: Omit<BookingItem, 'lineTotal' | 'totalSecurityDeposit'>[]): Promise<{ 
    data: { 
      subtotal: number; 
      taxAmount: number; 
      totalSecurityDeposit: number; 
      finalAmount: number;
      breakdown: { [key: string]: number };
    }; 
    success: boolean 
  }> {
    try {
      const response = await apiClient.post('/bookings/calculate', { items });
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Error calculating booking cost:', error);
      
      // Mock calculation
      const subtotal = items.reduce((sum, item) => sum + (item.unitRate * item.quantity * item.duration), 0);
      const taxAmount = subtotal * 0.18; // 18% GST
      const totalSecurityDeposit = items.reduce((sum, item) => sum + (item.securityDepositPerUnit * item.quantity), 0);
      const finalAmount = subtotal + taxAmount;
      
      return { 
        data: { 
          subtotal, 
          taxAmount, 
          totalSecurityDeposit, 
          finalAmount,
          breakdown: {
            itemTotal: subtotal,
            gst: taxAmount,
            discount: 0,
            deliveryCharges: 0
          }
        }, 
        success: true 
      };
    }
  }

  // Check product availability
  async checkProductAvailability(productId: number, startDate: string, endDate: string, quantity: number): Promise<{ 
    data: { 
      isAvailable: boolean; 
      availableQuantity: number; 
      conflictingBookings?: any[];
    }; 
    success: boolean 
  }> {
    try {
      const response = await apiClient.post('/products/check-availability', { productId, startDate, endDate, quantity });
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Error checking availability:', error);
      
      // Mock availability check
      return { 
        data: { 
          isAvailable: true, 
          availableQuantity: 5 
        }, 
        success: true 
      };
    }
  }

  // Export bookings
  async exportBookings(format: 'csv' | 'xlsx' | 'pdf', filters: BookingFilters = {}): Promise<Blob> {
    try {
      const response = await apiClient.post('/bookings/export', { format, filters }, { responseType: 'blob' });
      return response.data;
    } catch (error) {
      console.error('Error exporting bookings:', error);
      
      // Mock export
      const mockData = JSON.stringify({ bookings: "mock data", format, generatedAt: new Date().toISOString() });
      return new Blob([mockData], { type: 'application/json' });
    }
  }
}

const bookingService = new BookingService();
export default bookingService;
