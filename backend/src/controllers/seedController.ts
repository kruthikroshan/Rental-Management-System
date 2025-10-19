import { Request, Response } from 'express';
import { Repository, DataSource } from 'typeorm';
import { User, UserRole } from '../entities/User';
import { Product } from '../entities/Product';
import { Category } from '../entities/Category';
import { BookingOrder, BookingStatus, PaymentStatus } from '../entities/BookingOrder';
import { BookingOrderItem, BookingItemStatus } from '../entities/BookingOrderItem';
import { Invoice, InvoiceType, InvoiceStatus } from '../entities/Invoice';
import { Payment, PaymentMethod, PaymentType, PaymentStatus as PaymentStatusEnum } from '../entities/Payment';
import { RentalUnit, ProductCondition } from '../entities/enums';
import * as bcrypt from 'bcrypt';

export class SeedController {
  private userRepository: Repository<User>;
  private productRepository: Repository<Product>;
  private categoryRepository: Repository<Category>;
  private bookingRepository: Repository<BookingOrder>;
  private bookingItemRepository: Repository<BookingOrderItem>;
  private invoiceRepository: Repository<Invoice>;
  private paymentRepository: Repository<Payment>;

  constructor(dataSource: DataSource) {
    this.userRepository = dataSource.getRepository(User);
    this.productRepository = dataSource.getRepository(Product);
    this.categoryRepository = dataSource.getRepository(Category);
    this.bookingRepository = dataSource.getRepository(BookingOrder);
    this.bookingItemRepository = dataSource.getRepository(BookingOrderItem);
    this.invoiceRepository = dataSource.getRepository(Invoice);
    this.paymentRepository = dataSource.getRepository(Payment);
  }

  // Create sample data for dashboard testing
  async createSampleData(req: Request, res: Response): Promise<void> {
    try {
      // Create sample categories
      const categories = [
        { name: 'Photography Equipment', slug: 'photography-equipment' },
        { name: 'Audio Visual', slug: 'audio-visual' },
        { name: 'Event Furniture', slug: 'event-furniture' },
        { name: 'Wedding Decorations', slug: 'wedding-decorations' }
      ];

      const savedCategories: Category[] = [];
      for (const categoryData of categories) {
        const existing = await this.categoryRepository.findOne({ where: { slug: categoryData.slug } });
        if (!existing) {
          const category = this.categoryRepository.create(categoryData);
          savedCategories.push(await this.categoryRepository.save(category));
        } else {
          savedCategories.push(existing);
        }
      }

      // Create sample products
      const products = [
        {
          name: 'Professional Camera Kit',
          categoryId: savedCategories[0].id,
          baseRentalRate: 500,
          rentalUnits: RentalUnit.DAY,
          condition: ProductCondition.EXCELLENT,
          totalQuantity: 5,
          availableQuantity: 3,
          securityDeposit: 2000,
          sku: 'CAM-001'
        },
        {
          name: 'Wedding Decoration Set',
          categoryId: savedCategories[3].id,
          baseRentalRate: 800,
          rentalUnits: RentalUnit.DAY,
          condition: ProductCondition.GOOD,
          totalQuantity: 3,
          availableQuantity: 2,
          securityDeposit: 1500,
          sku: 'WED-001'
        },
        {
          name: 'Sound System Pro',
          categoryId: savedCategories[1].id,
          baseRentalRate: 600,
          rentalUnits: RentalUnit.DAY,
          condition: ProductCondition.EXCELLENT,
          totalQuantity: 4,
          availableQuantity: 4,
          securityDeposit: 3000,
          sku: 'SND-001'
        }
      ];

      const savedProducts: Product[] = [];
      for (const productData of products) {
        const existing = await this.productRepository.findOne({ where: { sku: productData.sku } });
        if (!existing) {
          const product = this.productRepository.create(productData);
          savedProducts.push(await this.productRepository.save(product));
        } else {
          savedProducts.push(existing);
        }
      }

      // Create sample customers
      const customers = [
        {
          name: 'Rajesh Kumar',
          email: 'rajesh@example.com',
          role: UserRole.CUSTOMER,
          passwordHash: await bcrypt.hash('customer123', 10)
        },
        {
          name: 'Priya Sharma',
          email: 'priya@example.com',
          role: UserRole.CUSTOMER,
          passwordHash: await bcrypt.hash('customer123', 10)
        },
        {
          name: 'Arjun Singh',
          email: 'arjun@example.com',
          role: UserRole.CUSTOMER,
          passwordHash: await bcrypt.hash('customer123', 10)
        }
      ];

      const savedCustomers: User[] = [];
      for (const customerData of customers) {
        const existing = await this.userRepository.findOne({ where: { email: customerData.email } });
        if (!existing) {
          const customer = this.userRepository.create(customerData);
          savedCustomers.push(await this.userRepository.save(customer));
        } else {
          savedCustomers.push(existing);
        }
      }

      // Create sample bookings
      const bookings = [
        {
          customerId: savedCustomers[0].id,
          startDateTime: new Date('2025-08-10T10:00:00'),
          endDateTime: new Date('2025-08-12T18:00:00'),
          totalAmount: 1500,
          status: BookingStatus.ACTIVE,
          paymentStatus: PaymentStatus.PAID
        },
        {
          customerId: savedCustomers[1].id,
          startDateTime: new Date('2025-08-11T09:00:00'),
          endDateTime: new Date('2025-08-13T17:00:00'),
          totalAmount: 2400,
          status: BookingStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PARTIAL
        },
        {
          customerId: savedCustomers[2].id,
          startDateTime: new Date('2025-08-09T14:00:00'),
          endDateTime: new Date('2025-08-11T20:00:00'),
          totalAmount: 1800,
          status: BookingStatus.ACTIVE,
          paymentStatus: PaymentStatus.PAID
        }
      ];

      const savedBookings: BookingOrder[] = [];
      for (const bookingData of bookings) {
        const booking = this.bookingRepository.create(bookingData);
        savedBookings.push(await this.bookingRepository.save(booking));
      }

      // Create sample booking items
      const bookingItems = [
        {
          bookingOrderId: savedBookings[0].id,
          productId: savedProducts[0].id,
          productName: savedProducts[0].name,
          productSku: savedProducts[0].sku,
          quantity: 1,
          unitRate: 500,
          lineTotal: 1500,
          durationType: RentalUnit.DAY,
          duration: 3,
          status: BookingItemStatus.ACTIVE
        },
        {
          bookingOrderId: savedBookings[1].id,
          productId: savedProducts[1].id,
          productName: savedProducts[1].name,
          productSku: savedProducts[1].sku,
          quantity: 1,
          unitRate: 800,
          lineTotal: 2400,
          durationType: RentalUnit.DAY,
          duration: 3,
          status: BookingItemStatus.RESERVED
        },
        {
          bookingOrderId: savedBookings[2].id,
          productId: savedProducts[2].id,
          productName: savedProducts[2].name,
          productSku: savedProducts[2].sku,
          quantity: 1,
          unitRate: 600,
          lineTotal: 1800,
          durationType: RentalUnit.DAY,
          duration: 3,
          status: BookingItemStatus.ACTIVE
        }
      ];

      for (const itemData of bookingItems) {
        const item = this.bookingItemRepository.create(itemData);
        await this.bookingItemRepository.save(item);
      }

      // Create sample invoices and payments
      for (let i = 0; i < savedBookings.length; i++) {
        const booking = savedBookings[i];
        
        // Create invoice
        const invoice = this.invoiceRepository.create({
          bookingOrderId: booking.id,
          customerId: booking.customerId,
          subtotal: booking.totalAmount,
          totalAmount: booking.totalAmount,
          type: InvoiceType.RENTAL,
          status: InvoiceStatus.PAID,
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        });
        const savedInvoice = await this.invoiceRepository.save(invoice);

        // Create payment
        const payment = this.paymentRepository.create({
          invoiceId: savedInvoice.id,
          bookingOrderId: booking.id,
          paidBy: booking.customerId,
          amount: booking.totalAmount,
          currency: 'USD',
          method: PaymentMethod.CREDIT_CARD,
          type: PaymentType.RENTAL_FEE,
          status: PaymentStatusEnum.COMPLETED,
          paymentDate: new Date(),
          transactionId: `TXN-${Date.now()}-${i}`
        });
        await this.paymentRepository.save(payment);
      }

      res.json({
        success: true,
        message: 'Sample data created successfully',
        data: {
          categories: savedCategories.length,
          products: savedProducts.length,
          customers: savedCustomers.length,
          bookings: savedBookings.length
        }
      });
    } catch (error) {
      console.error('Create sample data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create sample data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Clear sample data
  async clearSampleData(req: Request, res: Response): Promise<void> {
    try {
      // Delete in reverse order due to foreign key constraints
      await this.paymentRepository.delete({});
      await this.invoiceRepository.delete({});
      await this.bookingItemRepository.delete({});
      await this.bookingRepository.delete({});
      await this.productRepository.delete({});
      await this.categoryRepository.delete({});
      
      // Delete test customers only
      await this.userRepository.delete({ email: 'rajesh@example.com' });
      await this.userRepository.delete({ email: 'priya@example.com' });
      await this.userRepository.delete({ email: 'arjun@example.com' });

      res.json({
        success: true,
        message: 'Sample data cleared successfully'
      });
    } catch (error) {
      console.error('Clear sample data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear sample data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
