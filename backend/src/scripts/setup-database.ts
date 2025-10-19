#!/usr/bin/env node

/**
 * PostgreSQL Database Setup Script for RentEase
 * 
 * This script sets up the PostgreSQL database with all required tables,
 * relationships, indexes, and creates a default admin user.
 */

import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User, UserRole, UserPermission } from '../entities/User';
import { Category } from '../entities/Category';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const setupDatabase = async () => {
  try {
    console.log('🚀 Starting PostgreSQL Database Setup...\n');
    
    // Initialize database connection
    console.log('📡 Connecting to PostgreSQL...');
    await AppDataSource.initialize();
    console.log('✅ PostgreSQL connected successfully');
    
    // Sync database schema (creates tables)
    console.log('🔨 Creating database schema...');
    await AppDataSource.synchronize(true); // true = drop existing tables
    console.log('✅ Database schema created successfully');
    
    // Create default categories
    console.log('📁 Creating default categories...');
    await createDefaultCategories();
    
    // Create default admin user
    console.log('👤 Creating default admin user...');
    await createDefaultAdmin();
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Setup Summary:');
    console.log('   ✅ Database schema created');
    console.log('   ✅ Default categories added');
    console.log('   ✅ Admin user created');
    console.log('\n🔐 Admin Login Details:');
    console.log(`   Email: ${process.env.DEFAULT_ADMIN_EMAIL || 'admin@rentease.com'}`);
    console.log(`   Password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'}`);
    console.log('\n⚠️  Please change the admin password after first login!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('\n📤 Database connection closed');
    process.exit(0);
  }
};

const createDefaultCategories = async () => {
  const categoryRepository = AppDataSource.getRepository(Category);
  
  const defaultCategories = [
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets for rent',
      isActive: true,
      sortOrder: 1
    },
    {
      name: 'Furniture',
      slug: 'furniture',
      description: 'Furniture items for home and office',
      isActive: true,
      sortOrder: 2
    },
    {
      name: 'Vehicles',
      slug: 'vehicles',
      description: 'Cars, bikes, and other vehicles',
      isActive: true,
      sortOrder: 3
    },
    {
      name: 'Tools & Equipment',
      slug: 'tools-equipment',
      description: 'Professional tools and equipment',
      isActive: true,
      sortOrder: 4
    },
    {
      name: 'Sports & Recreation',
      slug: 'sports-recreation',
      description: 'Sports equipment and recreational items',
      isActive: true,
      sortOrder: 5
    },
    {
      name: 'Event Supplies',
      slug: 'event-supplies',
      description: 'Items for events, parties, and celebrations',
      isActive: true,
      sortOrder: 6
    }
  ];
  
  for (const categoryData of defaultCategories) {
    const existingCategory = await categoryRepository.findOne({
      where: { slug: categoryData.slug }
    });
    
    if (!existingCategory) {
      const category = categoryRepository.create(categoryData);
      await categoryRepository.save(category);
      console.log(`   ✅ Created category: ${categoryData.name}`);
    } else {
      console.log(`   ⚠️  Category already exists: ${categoryData.name}`);
    }
  }
};

const createDefaultAdmin = async () => {
  const userRepository = AppDataSource.getRepository(User);
  
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@rentease.com';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
  
  // Check if admin already exists
  const existingAdmin = await userRepository.findOne({
    where: { email: adminEmail }
  });
  
  if (existingAdmin) {
    console.log('   ⚠️  Admin user already exists');
    return;
  }
  
  // Create admin user
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
  const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
  
  const admin = userRepository.create({
    name: 'System Administrator',
    email: adminEmail,
    passwordHash: hashedPassword,
    role: UserRole.ADMIN,
    isActive: true,
    isEmailVerified: true,
    permissions: [
      UserPermission.READ_ALL,
      UserPermission.WRITE_ALL,
      UserPermission.DELETE_ALL,
      UserPermission.MANAGE_USERS,
      UserPermission.VIEW_REPORTS,
      UserPermission.MANAGE_SETTINGS
    ]
  });
  
  await userRepository.save(admin);
  console.log(`   ✅ Admin user created: ${adminEmail}`);
};

// Test database connection
const testConnection = async () => {
  try {
    console.log('🏓 Testing database connection...');
    await AppDataSource.initialize();
    await AppDataSource.query('SELECT 1');
    console.log('✅ Database connection test successful');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    console.log('\n💡 Troubleshooting Tips:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Check your database credentials in .env file');
    console.log('   3. Ensure the database exists');
    console.log('   4. Verify network connectivity');
    process.exit(1);
  }
};

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--test')) {
  testConnection();
} else if (args.includes('--setup')) {
  setupDatabase();
} else {
  console.log('🔧 RentEase Database Setup Tool\n');
  console.log('Usage:');
  console.log('  npm run db:test    - Test database connection');
  console.log('  npm run db:setup   - Setup complete database');
  console.log('  npm run db:reset   - Reset and setup database\n');
  
  // Default to setup
  setupDatabase();
}

export { setupDatabase, testConnection };
