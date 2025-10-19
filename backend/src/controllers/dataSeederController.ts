import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Product, RentalUnit, ProductCondition } from '../entities/Product';
import { Category } from '../entities/Category';
import { User, UserRole } from '../entities/User';
import { BookingOrder, BookingStatus, PaymentStatus } from '../entities/BookingOrder';
import { BookingOrderItem, BookingItemStatus } from '../entities/BookingOrderItem';
import { Quotation, QuotationStatus } from '../entities/Quotation';
import { QuotationItem } from '../entities/QuotationItem';

export class DataSeederController {
  private productRepository = AppDataSource.getRepository(Product);
  private categoryRepository = AppDataSource.getRepository(Category);
  private userRepository = AppDataSource.getRepository(User);
  private bookingRepository = AppDataSource.getRepository(BookingOrder);
  private bookingItemRepository = AppDataSource.getRepository(BookingOrderItem);
  private quotationRepository = AppDataSource.getRepository(Quotation);
  private quotationItemRepository = AppDataSource.getRepository(QuotationItem);

  async seedDatabase(req: Request, res: Response): Promise<void> {
    try {
      console.log('🌱 Starting database seeding...');

      // Create categories
      const categories = [
        { name: 'Construction Equipment', description: 'Heavy machinery and construction tools', slug: 'construction' },
        { name: 'Event Equipment', description: 'Tables, chairs, tents, and event supplies', slug: 'events' },
        { name: 'Technology', description: 'Laptops, projectors, and tech equipment', slug: 'technology' },
        { name: 'Vehicles', description: 'Cars, trucks, and transportation', slug: 'vehicles' },
        { name: 'Tools', description: 'Power tools and hand tools', slug: 'tools' },
        { name: 'Sports Equipment', description: 'Sports gear and equipment', slug: 'sports' }
      ];

      const savedCategories = await Promise.all(
        categories.map(async (cat) => {
          let category = await this.categoryRepository.findOne({ where: { slug: cat.slug } });
          if (!category) {
            category = this.categoryRepository.create(cat);
            return await this.categoryRepository.save(category);
          }
          return category;
        })
      );

      console.log(`✅ Created ${savedCategories.length} categories`);

      // Create products
      const productsData = [
        {
          categoryId: savedCategories[0].id, // Construction
          name: 'Excavator CAT 320',
          slug: 'excavator-cat-320',
          description: 'Heavy-duty excavator for construction projects',
          shortDescription: '20-ton excavator with GPS tracking',
          sku: 'EXC-CAT-320-001',
          isRentable: true,
          rentalUnits: RentalUnit.DAY,
          minRentalDuration: 1,
          maxRentalDuration: 30,
          totalQuantity: 5,
          availableQuantity: 3,
          reservedQuantity: 2,
          maintenanceQuantity: 0,
          baseRentalRate: 450.00,
          securityDeposit: 2000.00,
          lateFeePerDay: 50.00,
          replacementCost: 120000.00,
          brand: 'Caterpillar',
          model: '320',
          yearManufactured: 2022,
          condition: ProductCondition.EXCELLENT,
          weight: 20000,
          isActive: true,
          isFeatured: true
        },
        {
          categoryId: savedCategories[1].id, // Events
          name: 'Round Tables (8-person)',
          slug: 'round-tables-8-person',
          description: 'Elegant round tables perfect for weddings and events',
          shortDescription: '60-inch round tables seating 8 people',
          sku: 'TBL-RND-8P-001',
          isRentable: true,
          rentalUnits: RentalUnit.DAY,
          minRentalDuration: 1,
          maxRentalDuration: 7,
          totalQuantity: 50,
          availableQuantity: 42,
          reservedQuantity: 8,
          maintenanceQuantity: 0,
          baseRentalRate: 12.00,
          securityDeposit: 25.00,
          lateFeePerDay: 5.00,
          replacementCost: 150.00,
          brand: 'EventPro',
          model: 'Classic Round',
          yearManufactured: 2023,
          condition: ProductCondition.EXCELLENT,
          weight: 15,
          isActive: true,
          isFeatured: true
        },
        {
          categoryId: savedCategories[2].id, // Technology
          name: 'MacBook Pro 16" M3',
          slug: 'macbook-pro-16-m3',
          description: 'Latest MacBook Pro with M3 chip for professional work',
          shortDescription: '16-inch display, 512GB SSD, 18GB RAM',
          sku: 'MBP-16-M3-512',
          isRentable: true,
          rentalUnits: RentalUnit.DAY,
          minRentalDuration: 1,
          maxRentalDuration: 30,
          totalQuantity: 15,
          availableQuantity: 12,
          reservedQuantity: 3,
          maintenanceQuantity: 0,
          baseRentalRate: 89.00,
          securityDeposit: 500.00,
          lateFeePerDay: 25.00,
          replacementCost: 3999.00,
          brand: 'Apple',
          model: 'MacBook Pro 16"',
          yearManufactured: 2023,
          condition: ProductCondition.EXCELLENT,
          weight: 2.1,
          isActive: true,
          isFeatured: true
        },
        {
          categoryId: savedCategories[3].id, // Vehicles
          name: 'Toyota Camry 2023',
          slug: 'toyota-camry-2023',
          description: 'Reliable midsize sedan for business or personal use',
          shortDescription: 'Fuel-efficient sedan with safety features',
          sku: 'CAR-TOY-CAM-2023',
          isRentable: true,
          rentalUnits: RentalUnit.DAY,
          minRentalDuration: 1,
          maxRentalDuration: 30,
          totalQuantity: 8,
          availableQuantity: 6,
          reservedQuantity: 2,
          maintenanceQuantity: 0,
          baseRentalRate: 65.00,
          securityDeposit: 300.00,
          lateFeePerDay: 15.00,
          replacementCost: 28000.00,
          brand: 'Toyota',
          model: 'Camry',
          yearManufactured: 2023,
          condition: ProductCondition.EXCELLENT,
          weight: 1550,
          isActive: true,
          isFeatured: false
        },
        {
          categoryId: savedCategories[4].id, // Tools
          name: 'DeWalt Circular Saw',
          slug: 'dewalt-circular-saw',
          description: 'Professional-grade circular saw for construction',
          shortDescription: '7.25" blade, 15-amp motor',
          sku: 'SAW-DEW-CIR-001',
          isRentable: true,
          rentalUnits: RentalUnit.DAY,
          minRentalDuration: 1,
          maxRentalDuration: 14,
          totalQuantity: 20,
          availableQuantity: 18,
          reservedQuantity: 2,
          maintenanceQuantity: 0,
          baseRentalRate: 25.00,
          securityDeposit: 50.00,
          lateFeePerDay: 8.00,
          replacementCost: 299.00,
          brand: 'DeWalt',
          model: 'DWE575SB',
          yearManufactured: 2023,
          condition: ProductCondition.GOOD,
          weight: 4.0,
          isActive: true,
          isFeatured: false
        },
        {
          categoryId: savedCategories[5].id, // Sports
          name: 'Mountain Bike - Trek',
          slug: 'mountain-bike-trek',
          description: 'High-quality mountain bike for trails and adventures',
          shortDescription: '29" wheels, 21-speed, aluminum frame',
          sku: 'BIKE-TRK-MTN-001',
          isRentable: true,
          rentalUnits: RentalUnit.DAY,
          minRentalDuration: 1,
          maxRentalDuration: 7,
          totalQuantity: 12,
          availableQuantity: 10,
          reservedQuantity: 2,
          maintenanceQuantity: 0,
          baseRentalRate: 35.00,
          securityDeposit: 100.00,
          lateFeePerDay: 10.00,
          replacementCost: 899.00,
          brand: 'Trek',
          model: 'Marlin 7',
          yearManufactured: 2023,
          condition: ProductCondition.GOOD,
          weight: 13.5,
          isActive: true,
          isFeatured: true
        }
      ];

      const savedProducts = await Promise.all(
        productsData.map(async (prod) => {
          let product = await this.productRepository.findOne({ where: { sku: prod.sku } });
          if (!product) {
            product = this.productRepository.create(prod);
            return await this.productRepository.save(product);
          }
          return product;
        })
      );

      console.log(`✅ Created ${savedProducts.length} products`);

      // Create sample customers
      const customersData = [
        {
          name: 'John Smith',
          email: 'john.smith@email.com',
          passwordHash: '$2a$10$rOlPZH.mZdPKsZL5wlwpQuKMxF1nYG.K5LzGVFZhJeM9F.ByZBDgm', // password: test123
          phone: '+1-555-0101',
          role: UserRole.CUSTOMER,
          isActive: true,
          isEmailVerified: true
        },
        {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          passwordHash: '$2a$10$rOlPZH.mZdPKsZL5wlwpQuKMxF1nYG.K5LzGVFZhJeM9F.ByZBDgm', // password: test123
          phone: '+1-555-0102',
          role: UserRole.CUSTOMER,
          isActive: true,
          isEmailVerified: true
        },
        {
          name: 'Mike Wilson',
          email: 'mike.wilson@email.com',
          passwordHash: '$2a$10$rOlPZH.mZdPKsZL5wlwpQuKMxF1nYG.K5LzGVFZhJeM9F.ByZBDgm', // password: test123
          phone: '+1-555-0103',
          role: UserRole.CUSTOMER,
          isActive: true,
          isEmailVerified: true
        },
        {
          name: 'Emily Davis',
          email: 'emily.davis@email.com',
          passwordHash: '$2a$10$rOlPZH.mZdPKsZL5wlwpQuKMxF1nYG.K5LzGVFZhJeM9F.ByZBDgm', // password: test123
          phone: '+1-555-0104',
          role: UserRole.CUSTOMER,
          isActive: true,
          isEmailVerified: true
        },
        {
          name: 'Admin User',
          email: 'admin@rentalmanagement.com',
          passwordHash: '$2a$10$rOlPZH.mZdPKsZL5wlwpQuKMxF1nYG.K5LzGVFZhJeM9F.ByZBDgm', // password: test123
          phone: '+1-555-0001',
          role: UserRole.ADMIN,
          isActive: true,
          isEmailVerified: true
        }
      ];

      const savedCustomers = await Promise.all(
        customersData.map(async (customer) => {
          let user = await this.userRepository.findOne({ where: { email: customer.email } });
          if (!user) {
            user = this.userRepository.create(customer);
            return await this.userRepository.save(user);
          }
          return user;
        })
      );

      console.log(`✅ Created ${savedCustomers.length} users`);

      // Create sample bookings
      const bookingsData = [
        {
          customerId: savedCustomers[0].id,
          orderNumber: 'BO-2025-001',
          pickupDate: new Date('2025-08-15'),
          returnDate: new Date('2025-08-17'),
          pickupLocation: {
            address: '123 Main St, City, State',
            coordinates: { lat: 40.7128, lng: -74.0060 },
            contact: '+1-555-0101'
          },
          returnLocation: {
            address: '123 Main St, City, State',
            coordinates: { lat: 40.7128, lng: -74.0060 },
            contact: '+1-555-0101'
          },
          deliveryRequired: false,
          pickupRequired: true,
          subtotal: 178.00,
          taxAmount: 14.24,
          totalAmount: 192.24,
          securityDeposit: 150.00,
          status: BookingStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PARTIAL,
          advancePaid: 96.12,
          balanceAmount: 96.12
        }
      ];

      const savedBookings = await Promise.all(
        bookingsData.map(async (booking) => {
          let existingBooking = await this.bookingRepository.findOne({ 
            where: { orderNumber: booking.orderNumber } 
          });
          if (!existingBooking) {
            existingBooking = this.bookingRepository.create(booking);
            return await this.bookingRepository.save(existingBooking);
          }
          return existingBooking;
        })
      );

      console.log(`✅ Created ${savedBookings.length} bookings`);

      // Create booking items
      if (savedBookings.length > 0) {
        const bookingItemsData = [
          {
            bookingOrderId: savedBookings[0].id,
            productId: savedProducts[1].id, // Round Tables
            productName: savedProducts[1].name,
            productSku: savedProducts[1].sku,
            quantity: 5,
            unitRate: 12.00,
            duration: 2,
            durationType: RentalUnit.DAY,
            lineTotal: 120.00,
            securityDepositPerUnit: 25.00,
            status: BookingItemStatus.RESERVED
          },
          {
            bookingOrderId: savedBookings[0].id,
            productId: savedProducts[2].id, // MacBook
            productName: savedProducts[2].name,
            productSku: savedProducts[2].sku,
            quantity: 1,
            unitRate: 89.00,
            duration: 2,
            durationType: RentalUnit.DAY,
            lineTotal: 178.00,
            securityDepositPerUnit: 500.00,
            status: BookingItemStatus.RESERVED
          }
        ];

        await Promise.all(
          bookingItemsData.map(async (item) => {
            let existingItem = await this.bookingItemRepository.findOne({
              where: { 
                bookingOrderId: item.bookingOrderId,
                productId: item.productId 
              }
            });
            if (!existingItem) {
              existingItem = this.bookingItemRepository.create(item);
              return await this.bookingItemRepository.save(existingItem);
            }
            return existingItem;
          })
        );

        console.log(`✅ Created booking items`);
      }

      // Create sample quotations
      const quotationsData = [
        {
          customerId: savedCustomers[1].id,
          quotationNumber: 'QT-2025-001',
          pickupDate: new Date('2025-08-20'),
          returnDate: new Date('2025-08-22'),
          expiryDate: new Date('2025-08-18'),
          pickupLocation: {
            address: '456 Business Ave, City, State',
            coordinates: { lat: 40.7589, lng: -73.9851 },
            contact: '+1-555-0102'
          },
          returnLocation: {
            address: '456 Business Ave, City, State',
            coordinates: { lat: 40.7589, lng: -73.9851 },
            contact: '+1-555-0102'
          },
          subtotal: 450.00,
          discountAmount: 22.50,
          taxAmount: 34.20,
          totalAmount: 461.70,
          notes: 'Corporate event rental',
          status: QuotationStatus.SENT
        }
      ];

      const savedQuotations = await Promise.all(
        quotationsData.map(async (quotation) => {
          let existing = await this.quotationRepository.findOne({
            where: { quotationNumber: quotation.quotationNumber }
          });
          if (!existing) {
            existing = this.quotationRepository.create(quotation);
            return await this.quotationRepository.save(existing);
          }
          return existing;
        })
      );

      console.log(`✅ Created ${savedQuotations.length} quotations`);

      console.log('🎉 Database seeding completed successfully!');

      res.json({
        success: true,
        message: 'Database seeded successfully',
        data: {
          categories: savedCategories.length,
          products: savedProducts.length,
          users: savedCustomers.length,
          bookings: savedBookings.length,
          quotations: savedQuotations.length
        }
      });

    } catch (error: any) {
      console.error('❌ Seeding error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to seed database',
        error: error.message
      });
    }
  }

  async clearDatabase(req: Request, res: Response): Promise<void> {
    try {
      console.log('🗑️ Clearing database...');

      // Clear in reverse dependency order
      await this.quotationItemRepository.createQueryBuilder().delete().execute();
      await this.quotationRepository.createQueryBuilder().delete().execute();
      await this.bookingItemRepository.createQueryBuilder().delete().execute();
      await this.bookingRepository.createQueryBuilder().delete().execute();
      await this.productRepository.createQueryBuilder().delete().execute();
      await this.categoryRepository.createQueryBuilder().delete().execute();
      await this.userRepository.createQueryBuilder().delete().execute();

      console.log('✅ Database cleared successfully');

      res.json({
        success: true,
        message: 'Database cleared successfully'
      });

    } catch (error: any) {
      console.error('❌ Clear database error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear database',
        error: error.message
      });
    }
  }

  async getDatabaseStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = {
        categories: await this.categoryRepository.count(),
        products: await this.productRepository.count(),
        users: await this.userRepository.count(),
        bookings: await this.bookingRepository.count(),
        quotations: await this.quotationRepository.count()
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error: any) {
      console.error('❌ Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get database stats',
        error: error.message
      });
    }
  }
}
