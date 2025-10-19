import connectDB from './config/database';
import { User } from './models/User';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();

    // Check if admin user already exists
    const adminExists = await User.findOne({ email: process.env.DEFAULT_ADMIN_EMAIL });
    
    if (adminExists) {
      console.log('✅ Admin user already exists');
      process.exit(0);
    }

    // Create default admin user
    const adminUser = new User({
      name: 'System Administrator',
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@rentease.com',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      phone: '+919876543210',
      isEmailVerified: true,
      isActive: true,
      address: {
        street: '123 Business Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      },
      preferences: {
        notifications: true,
        language: 'en',
        timezone: 'Asia/Kolkata'
      }
    });

    await adminUser.save();
    console.log('✅ Default admin user created successfully');

    // Create demo manager user
    const managerUser = new User({
      name: 'Manager User',
      email: 'manager@rentease.com',
      password: 'manager123',
      role: 'manager',
      phone: '+919876543211',
      isEmailVerified: true,
      isActive: true,
      address: {
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India'
      }
    });

    await managerUser.save();
    console.log('✅ Demo manager user created successfully');

    // Create demo customer user
    const customerUser = new User({
      name: 'John Customer',
      email: 'customer@example.com',
      password: 'customer123',
      role: 'customer',
      phone: '+919876543212',
      isEmailVerified: true,
      isActive: true,
      address: {
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India'
      }
    });

    await customerUser.save();
    console.log('✅ Demo customer user created successfully');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Demo Accounts Created:');
    console.log('🔐 Admin: admin@rentease.com / admin123');
    console.log('👤 Manager: manager@rentease.com / manager123');
    console.log('👥 Customer: customer@example.com / customer123');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
