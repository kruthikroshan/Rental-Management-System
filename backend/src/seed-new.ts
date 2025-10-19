import 'reflect-metadata';
import { AppDataSource } from './config/database';
import { User, UserRole } from './entities/User';
import { Category } from './entities/Category';
import { Product } from './entities/Product';
import { Quotation } from './entities/Quotation';
import { QuotationItem } from './entities/QuotationItem';
import { BookingOrder } from './entities/BookingOrder';
import { BookingOrderItem } from './entities/BookingOrderItem';
import { RentalUnit, ProductCondition, BookingStatus } from './entities/enums';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');

    // Clear existing data (optional - remove if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await AppDataSource.query('TRUNCATE TABLE "booking_order_items" RESTART IDENTITY CASCADE');
    await AppDataSource.query('TRUNCATE TABLE "booking_orders" RESTART IDENTITY CASCADE');
    await AppDataSource.query('TRUNCATE TABLE "quotation_items" RESTART IDENTITY CASCADE');
    await AppDataSource.query('TRUNCATE TABLE "quotations" RESTART IDENTITY CASCADE');
    await AppDataSource.query('TRUNCATE TABLE "products" RESTART IDENTITY CASCADE');
    await AppDataSource.query('TRUNCATE TABLE "categories" RESTART IDENTITY CASCADE');
    await AppDataSource.query('TRUNCATE TABLE "user_profiles" RESTART IDENTITY CASCADE');
    await AppDataSource.query('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE');

    // Seed Users
    console.log('👥 Seeding users...');
    const userRepository = AppDataSource.getRepository(User);
    
    // Admin user
    const adminUser = userRepository.create({
      name: 'Admin User',
      email: 'admin@rental.com',
      role: UserRole.ADMIN,
      phone: '+1234567890',
      isActive: true,
      isEmailVerified: true
    });
    adminUser.password = 'admin123';
    await userRepository.save(adminUser);

    // Manager user
    const managerUser = userRepository.create({
      name: 'Manager User',
      email: 'manager@rental.com',
      role: UserRole.MANAGER,
      phone: '+1234567891',
      isActive: true,
      isEmailVerified: true
    });
    managerUser.password = 'manager123';
    await userRepository.save(managerUser);

    // Customer users
    const customers: User[] = [];
    const customerData = [
      { name: 'John Doe', email: 'john@example.com', phone: '+1234567892' },
      { name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567893' },
      { name: 'Mike Johnson', email: 'mike@example.com', phone: '+1234567894' },
      { name: 'Sarah Wilson', email: 'sarah@example.com', phone: '+1234567895' },
      { name: 'Tom Brown', email: 'tom@example.com', phone: '+1234567896' }
    ];

    for (const customerInfo of customerData) {
      const customer = userRepository.create({
        ...customerInfo,
        role: UserRole.CUSTOMER,
        isActive: true,
        isEmailVerified: true
      });
      customer.password = 'customer123';
      await userRepository.save(customer);
      customers.push(customer);
    }

    console.log(`✅ Created ${customers.length + 2} users`);

    // Seed Categories
    console.log('📂 Seeding categories...');
    const categoryRepository = AppDataSource.getRepository(Category);
    
    const categories: Category[] = [];
    const categoryData = [
      { 
        name: 'Construction Equipment',
        slug: 'construction-equipment',
        description: 'Heavy machinery and tools for construction projects',
        isActive: true 
      },
      { 
        name: 'Event Equipment',
        slug: 'event-equipment',
        description: 'Tables, chairs, tents, and decoration items for events',
        isActive: true 
      },
      { 
        name: 'Photography & Video',
        slug: 'photography-video',
        description: 'Cameras, lighting, and video equipment',
        isActive: true 
      },
      { 
        name: 'Transportation',
        slug: 'transportation',
        description: 'Vehicles, trailers, and moving equipment',
        isActive: true 
      },
      { 
        name: 'Party & Entertainment',
        slug: 'party-entertainment',
        description: 'Sound systems, games, and party supplies',
        isActive: true 
      }
    ];

    for (const categoryInfo of categoryData) {
      const category = categoryRepository.create(categoryInfo);
      await categoryRepository.save(category);
      categories.push(category);
    }

    console.log(`✅ Created ${categories.length} categories`);

    // Seed Products
    console.log('📦 Seeding products...');
    const productRepository = AppDataSource.getRepository(Product);
    
    const products: Product[] = [];
    const productData = [
      // Construction Equipment
      {
        categoryId: categories[0].id,
        name: 'Excavator - CAT 320',
        description: 'Heavy-duty excavator for construction and earthmoving',
        sku: 'EXC-CAT-320',
        baseRentalRate: 500.00,
        rentalUnits: RentalUnit.DAY,
        totalQuantity: 3,
        availableQuantity: 3,
        condition: ProductCondition.EXCELLENT,
        brand: 'Caterpillar',
        securityDeposit: 2000.00,
        isRentable: true,
        isActive: true
      },
      {
        categoryId: categories[0].id,
        name: 'Concrete Mixer',
        description: 'Portable concrete mixer for small to medium projects',
        sku: 'MIX-CON-001',
        baseRentalRate: 75.00,
        rentalUnits: RentalUnit.DAY,
        totalQuantity: 8,
        availableQuantity: 8,
        condition: ProductCondition.GOOD,
        securityDeposit: 300.00,
        isRentable: true,
        isActive: true
      },
      // Event Equipment
      {
        categoryId: categories[1].id,
        name: 'Round Tables (8-seater)',
        description: 'White round tables perfect for weddings and events',
        sku: 'TBL-RND-8',
        baseRentalRate: 25.00,
        rentalUnits: RentalUnit.DAY,
        totalQuantity: 50,
        availableQuantity: 50,
        condition: ProductCondition.EXCELLENT,
        securityDeposit: 50.00,
        isRentable: true,
        isActive: true
      },
      {
        categoryId: categories[1].id,
        name: 'Wedding Tent (20x30)',
        description: 'Large white tent suitable for outdoor weddings',
        sku: 'TNT-WED-2030',
        baseRentalRate: 300.00,
        rentalUnits: RentalUnit.DAY,
        totalQuantity: 5,
        availableQuantity: 5,
        condition: ProductCondition.EXCELLENT,
        securityDeposit: 1000.00,
        isRentable: true,
        isActive: true
      },
      // Photography & Video
      {
        categoryId: categories[2].id,
        name: 'Canon EOS R5 Camera',
        description: 'Professional mirrorless camera with 45MP sensor',
        sku: 'CAM-CAN-R5',
        baseRentalRate: 150.00,
        rentalUnits: RentalUnit.DAY,
        totalQuantity: 4,
        availableQuantity: 4,
        condition: ProductCondition.EXCELLENT,
        brand: 'Canon',
        securityDeposit: 800.00,
        isRentable: true,
        isActive: true
      },
      {
        categoryId: categories[2].id,
        name: 'LED Light Panel Set',
        description: 'Professional LED lighting kit for photography/video',
        sku: 'LED-PNL-SET',
        baseRentalRate: 80.00,
        rentalUnits: RentalUnit.DAY,
        totalQuantity: 10,
        availableQuantity: 10,
        condition: ProductCondition.GOOD,
        securityDeposit: 200.00,
        isRentable: true,
        isActive: true
      },
      // Transportation
      {
        categoryId: categories[3].id,
        name: 'Moving Truck (26ft)',
        description: 'Large moving truck with hydraulic lift gate',
        sku: 'TRK-MOV-26',
        baseRentalRate: 250.00,
        rentalUnits: RentalUnit.DAY,
        totalQuantity: 6,
        availableQuantity: 6,
        condition: ProductCondition.GOOD,
        securityDeposit: 1500.00,
        isRentable: true,
        isActive: true
      },
      // Party & Entertainment
      {
        categoryId: categories[4].id,
        name: 'Sound System - DJ Setup',
        description: 'Complete DJ sound system with speakers and mixer',
        sku: 'SND-DJ-001',
        baseRentalRate: 200.00,
        rentalUnits: RentalUnit.DAY,
        totalQuantity: 8,
        availableQuantity: 8,
        condition: ProductCondition.EXCELLENT,
        securityDeposit: 500.00,
        isRentable: true,
        isActive: true
      }
    ];

    for (const productInfo of productData) {
      const product = productRepository.create(productInfo);
      await productRepository.save(product);
      products.push(product);
    }

    console.log(`✅ Created ${products.length} products`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${customers.length + 2} (2 staff + ${customers.length} customers)`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('   Admin: admin@rental.com / admin123');
    console.log('   Manager: manager@rental.com / manager123');
    console.log('   Customer: john@example.com / customer123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
