import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { Category } from '../entities/Category';
import { Product, ProductCondition } from '../entities/Product';
import { RentalUnit } from '../entities/enums';
import { Quotation, QuotationStatus } from '../entities/Quotation';
import { QuotationItem } from '../entities/QuotationItem';
import { BookingOrder, BookingStatus, PaymentStatus } from '../entities/BookingOrder';
import { BookingOrderItem, BookingItemStatus } from '../entities/BookingOrderItem';

const createSampleData = async () => {
  try {
    console.log('🚀 Creating sample data for RentEase...\n');
    
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Create repositories
    const userRepo = AppDataSource.getRepository(User);
    const categoryRepo = AppDataSource.getRepository(Category);
    const productRepo = AppDataSource.getRepository(Product);
    const quotationRepo = AppDataSource.getRepository(Quotation);
    const quotationItemRepo = AppDataSource.getRepository(QuotationItem);
    const bookingRepo = AppDataSource.getRepository(BookingOrder);
    const bookingItemRepo = AppDataSource.getRepository(BookingOrderItem);

    // 1. Create sample users
    console.log('👥 Creating sample users...');
    
    // Check if admin already exists
    let admin = await userRepo.findOne({ where: { email: 'admin@rentease.com' } });
    if (!admin) {
      admin = userRepo.create({
        name: 'John Admin',
        email: 'admin@rentease.com',
        passwordHash: await bcrypt.hash('admin123', 12),
        role: UserRole.ADMIN,
        phone: '+1234567890',
        isActive: true,
        isEmailVerified: true
      });
      await userRepo.save(admin);
      console.log('   ✅ Created admin user');
    } else {
      console.log('   ⚠️  Admin user already exists, using existing one');
    }

    // Check if manager already exists
    let manager = await userRepo.findOne({ where: { email: 'manager@rentease.com' } });
    if (!manager) {
      manager = userRepo.create({
        name: 'Sarah Manager',
        email: 'manager@rentease.com',
        passwordHash: await bcrypt.hash('manager123', 12),
        role: UserRole.MANAGER,
        phone: '+1234567891',
        isActive: true,
        isEmailVerified: true
      });
      await userRepo.save(manager);
      console.log('   ✅ Created manager user');
    } else {
      console.log('   ⚠️  Manager user already exists, using existing one');
    }

    const customers: User[] = [];
    for (let i = 1; i <= 5; i++) {
      let customer = await userRepo.findOne({ where: { email: `customer${i}@example.com` } });
      if (!customer) {
        customer = userRepo.create({
          name: `Customer ${i}`,
          email: `customer${i}@example.com`,
          passwordHash: await bcrypt.hash('customer123', 12),
          role: UserRole.CUSTOMER,
          phone: `+123456789${i}`,
          isActive: true,
          isEmailVerified: true
        });
        await userRepo.save(customer);
      }
      customers.push(customer);
    }

    console.log(`   ✅ Total users available: ${customers.length + 2}`);

    // 2. Create sample categories
    console.log('📁 Creating sample categories...');
    
    // Check existing categories
    const existingCategories = await categoryRepo.find();
    let electronics, furniture, vehicles;

    if (existingCategories.length === 0) {
      electronics = categoryRepo.create({
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        isActive: true,
        sortOrder: 1
      });
      await categoryRepo.save(electronics);

      furniture = categoryRepo.create({
        name: 'Furniture',
        slug: 'furniture',
        description: 'Furniture for home and office',
        isActive: true,
        sortOrder: 2
      });
      await categoryRepo.save(furniture);

      vehicles = categoryRepo.create({
        name: 'Vehicles',
        slug: 'vehicles',
        description: 'Cars, bikes, and scooters',
        isActive: true,
        sortOrder: 3
      });
      await categoryRepo.save(vehicles);
      console.log('   ✅ Created 3 new categories');
    } else {
      // Use existing categories
      electronics = existingCategories.find(c => c.slug === 'electronics') || existingCategories[0];
      furniture = existingCategories.find(c => c.slug === 'furniture') || existingCategories[1];
      vehicles = existingCategories.find(c => c.slug === 'vehicles') || existingCategories[2];
      console.log(`   ⚠️  Using ${existingCategories.length} existing categories`);
    }

    // 3. Create sample products
    console.log('📦 Creating sample products...');
    
    const products = [
      {
        categoryId: electronics.id,
        name: 'MacBook Pro 14"',
        slug: 'macbook-pro-14',
        description: 'Latest MacBook Pro with M2 chip, perfect for professional work',
        sku: 'MBP-14-001',
        isRentable: true,
        rentalUnits: RentalUnit.DAY,
        minRentalDuration: 1,
        maxRentalDuration: 30,
        totalQuantity: 5,
        availableQuantity: 3,
        baseRentalRate: 50.00,
        securityDeposit: 500.00,
        lateFeePerDay: 10.00,
        brand: 'Apple',
        model: 'MacBook Pro',
        yearManufactured: 2023,
        condition: ProductCondition.EXCELLENT,
        images: ['https://via.placeholder.com/400x300/007bff/ffffff?text=MacBook+Pro'],
        tags: ['laptop', 'apple', 'professional', 'work']
      },
      {
        categoryId: electronics.id,
        name: 'Canon EOS R5 Camera',
        slug: 'canon-eos-r5',
        description: 'Professional mirrorless camera with 45MP sensor',
        sku: 'CAM-R5-001',
        isRentable: true,
        rentalUnits: RentalUnit.DAY,
        minRentalDuration: 1,
        maxRentalDuration: 14,
        totalQuantity: 3,
        availableQuantity: 2,
        baseRentalRate: 75.00,
        securityDeposit: 1000.00,
        lateFeePerDay: 15.00,
        brand: 'Canon',
        model: 'EOS R5',
        yearManufactured: 2022,
        condition: ProductCondition.EXCELLENT,
        images: ['https://via.placeholder.com/400x300/28a745/ffffff?text=Canon+EOS+R5'],
        tags: ['camera', 'professional', 'photography', 'video']
      },
      {
        categoryId: furniture.id,
        name: 'Executive Office Chair',
        slug: 'executive-office-chair',
        description: 'Ergonomic leather office chair with lumbar support',
        sku: 'CHR-EXE-001',
        isRentable: true,
        rentalUnits: RentalUnit.MONTH,
        minRentalDuration: 1,
        maxRentalDuration: 12,
        totalQuantity: 10,
        availableQuantity: 8,
        baseRentalRate: 80.00,
        securityDeposit: 200.00,
        lateFeePerDay: 5.00,
        brand: 'Herman Miller',
        condition: ProductCondition.GOOD,
        images: ['https://via.placeholder.com/400x300/dc3545/ffffff?text=Office+Chair'],
        tags: ['chair', 'office', 'ergonomic', 'furniture']
      },
      {
        categoryId: vehicles.id,
        name: 'BMW X3 SUV',
        slug: 'bmw-x3-suv',
        description: 'Luxury SUV perfect for family trips and business travel',
        sku: 'BMW-X3-001',
        isRentable: true,
        rentalUnits: RentalUnit.DAY,
        minRentalDuration: 1,
        maxRentalDuration: 30,
        totalQuantity: 2,
        availableQuantity: 1,
        baseRentalRate: 120.00,
        securityDeposit: 2000.00,
        lateFeePerDay: 50.00,
        brand: 'BMW',
        model: 'X3',
        yearManufactured: 2022,
        condition: ProductCondition.EXCELLENT,
        images: ['https://via.placeholder.com/400x300/6610f2/ffffff?text=BMW+X3'],
        tags: ['car', 'suv', 'luxury', 'family']
      },
      {
        categoryId: electronics.id,
        name: 'iPad Pro 12.9"',
        slug: 'ipad-pro-12-9',
        description: 'Latest iPad Pro with M2 chip and Apple Pencil support',
        sku: 'IPD-PRO-001',
        isRentable: true,
        rentalUnits: RentalUnit.DAY,
        minRentalDuration: 1,
        maxRentalDuration: 21,
        totalQuantity: 8,
        availableQuantity: 6,
        baseRentalRate: 25.00,
        securityDeposit: 300.00,
        lateFeePerDay: 5.00,
        brand: 'Apple',
        model: 'iPad Pro',
        yearManufactured: 2023,
        condition: ProductCondition.EXCELLENT,
        images: ['https://via.placeholder.com/400x300/fd7e14/ffffff?text=iPad+Pro'],
        tags: ['tablet', 'apple', 'creative', 'portable']
      }
    ];

    const createdProducts: Product[] = [];
    for (const productData of products) {
      const product = productRepo.create(productData);
      createdProducts.push(await productRepo.save(product));
    }

    console.log(`   ✅ Created ${createdProducts.length} products`);

    // 4. Create sample quotations
    console.log('💰 Creating sample quotations...');
    
    const quotation1 = quotationRepo.create({
      customerId: customers[0].id,
      pickupDate: new Date('2025-08-15'),
      returnDate: new Date('2025-08-20'),
      expiryDate: new Date('2025-08-14'),
      pickupLocation: {
        address: '123 Main St, New York, NY 10001',
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      returnLocation: {
        address: '123 Main St, New York, NY 10001',
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      deliveryRequired: true,
      subtotal: 250.00,
      taxAmount: 25.00,
      deliveryCharges: 20.00,
      totalAmount: 295.00,
      securityDeposit: 800.00,
      status: QuotationStatus.SENT,
      notes: 'Client needs equipment for a week-long conference'
    });
    await quotationRepo.save(quotation1);

    // Create quotation items
    const quotationItem1 = quotationItemRepo.create({
      quotationId: quotation1.id,
      productId: createdProducts[0].id, // MacBook Pro
      productName: createdProducts[0].name,
      productSku: createdProducts[0].sku,
      quantity: 2,
      unitRate: 50.00,
      duration: 5,
      durationType: RentalUnit.DAY,
      lineTotal: 500.00,
      securityDepositPerUnit: 500.00
    });
    await quotationItemRepo.save(quotationItem1);

    const quotationItem2 = quotationItemRepo.create({
      quotationId: quotation1.id,
      productId: createdProducts[4].id, // iPad Pro
      productName: createdProducts[4].name,
      productSku: createdProducts[4].sku,
      quantity: 3,
      unitRate: 25.00,
      duration: 5,
      durationType: RentalUnit.DAY,
      lineTotal: 375.00,
      securityDepositPerUnit: 300.00
    });
    await quotationItemRepo.save(quotationItem2);

    console.log('   ✅ Created 1 quotation with 2 items');

    // 5. Create sample booking orders
    console.log('📋 Creating sample booking orders...');
    
    const booking1 = bookingRepo.create({
      customerId: customers[1].id,
      pickupDate: new Date('2025-08-12'),
      returnDate: new Date('2025-08-19'),
      pickupLocation: {
        address: '456 Business Ave, Los Angeles, CA 90210',
        coordinates: { lat: 34.0522, lng: -118.2437 }
      },
      returnLocation: {
        address: '456 Business Ave, Los Angeles, CA 90210',
        coordinates: { lat: 34.0522, lng: -118.2437 }
      },
      deliveryRequired: false,
      subtotal: 525.00,
      taxAmount: 52.50,
      totalAmount: 577.50,
      securityDeposit: 1000.00,
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PARTIAL,
      advancePaid: 200.00,
      balanceAmount: 377.50,
      termsConditions: 'Standard rental terms apply',
      customerNotes: 'Will pick up equipment personally'
    });
    await bookingRepo.save(booking1);

    // Create booking items
    const bookingItem1 = bookingItemRepo.create({
      bookingOrderId: booking1.id,
      productId: createdProducts[1].id, // Canon Camera
      productName: createdProducts[1].name,
      productSku: createdProducts[1].sku,
      quantity: 1,
      unitRate: 75.00,
      duration: 7,
      durationType: RentalUnit.DAY,
      lineTotal: 525.00,
      securityDepositPerUnit: 1000.00,
      status: BookingItemStatus.RESERVED
    });
    await bookingItemRepo.save(bookingItem1);

    console.log('   ✅ Created 1 booking order with 1 item');

    // Update product availability
    await productRepo.decrement({ id: createdProducts[1].id }, 'availableQuantity', 1);
    await productRepo.increment({ id: createdProducts[1].id }, 'reservedQuantity', 1);

    console.log('\n🎉 Sample data creation completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Users: ${1 + 1 + customers.length} (1 admin, 1 manager, ${customers.length} customers)`);
    console.log(`   📁 Categories: 3`);
    console.log(`   📦 Products: ${createdProducts.length}`);
    console.log(`   💰 Quotations: 1 (with 2 items)`);
    console.log(`   📋 Bookings: 1 (with 1 item)`);
    
    console.log('\n🔐 Test Login Credentials:');
    console.log('   Admin: admin@rentease.com / admin123');
    console.log('   Manager: manager@rentease.com / manager123');
    console.log('   Customer 1: customer1@example.com / customer123');
    console.log('   Customer 2: customer2@example.com / customer123');

  } catch (error) {
    console.error('❌ Sample data creation failed:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('\n📤 Database connection closed');
  }
};

// Run sample data creation
if (require.main === module) {
  createSampleData();
}

export { createSampleData };
