import 'reflect-metadata';
import { AppDataSource } from '../config/database';

const testAPI = async () => {
  try {
    console.log('🧪 Testing RentEase API endpoints...\n');
    
    const baseURL = 'http://localhost:3000/api';
    
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    try {
      const healthResponse = await fetch(`${baseURL}/health`);
      if (healthResponse.ok) {
        const health = await healthResponse.json();
        console.log('   ✅ Health Check:', health);
      } else {
        console.log('   ❌ Health Check failed');
      }
    } catch (error) {
      console.log('   ⚠️ Server not running - start with: npm run dev');
    }

    // Test 2: Database Connection
    console.log('\n2️⃣ Testing Database Connection...');
    try {
      await AppDataSource.initialize();
      console.log('   ✅ Database connection successful');
      
      // Check if tables exist
      const queryRunner = AppDataSource.createQueryRunner();
      const tables = await queryRunner.getTables(['users', 'products', 'categories']);
      console.log(`   ✅ Found ${tables.length} core tables`);
      
      await queryRunner.release();
      await AppDataSource.destroy();
    } catch (error) {
      console.log('   ❌ Database connection failed:', (error as Error).message);
    }

    // Test 3: User Registration
    console.log('\n3️⃣ Testing User Registration...');
    try {
      const registerResponse = await fetch(`${baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'testpass123',
          phone: '+1234567890'
        })
      });
      
      if (registerResponse.ok) {
        const result = await registerResponse.json() as any;
        console.log('   ✅ User registration successful');
        console.log('   📧 User email:', result.user?.email);
      } else {
        const error = await registerResponse.json() as any;
        console.log('   ❌ Registration failed:', error.message);
      }
    } catch (error) {
      console.log('   ⚠️ Registration test failed - server may not be running');
    }

    // Test 4: User Login
    console.log('\n4️⃣ Testing User Login...');
    try {
      const loginResponse = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@rentease.com',
          password: 'admin123'
        })
      });
      
      if (loginResponse.ok) {
        const result = await loginResponse.json() as any;
        console.log('   ✅ Login successful');
        console.log('   🔑 Token received:', result.token ? '✅' : '❌');
        
        // Test 5: Protected Route
        console.log('\n5️⃣ Testing Protected Route...');
        const profileResponse = await fetch(`${baseURL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${result.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (profileResponse.ok) {
          const profile = await profileResponse.json() as any;
          console.log('   ✅ Profile access successful');
          console.log('   👤 User role:', profile.user?.role);
        } else {
          console.log('   ❌ Profile access failed');
        }
      } else {
        const error = await loginResponse.json() as any;
        console.log('   ❌ Login failed:', error.message);
      }
    } catch (error) {
      console.log('   ⚠️ Login test failed - server may not be running');
    }

    console.log('\n🎯 API Testing Summary:');
    console.log('   ✅ Run these tests after starting the server with: npm run dev');
    console.log('   ✅ Make sure PostgreSQL is running and database is set up');
    console.log('   ✅ Test endpoints: /health, /auth/register, /auth/login');
    console.log('   ✅ Default admin login: admin@rentease.com / admin123');

  } catch (error) {
    console.error('❌ API testing failed:', error);
  }
};

// Manual test function for when server is running
const manualAPITest = () => {
  console.log('🧪 Manual API Testing Guide\n');
  
  console.log('Prerequisites:');
  console.log('1. Start server: npm run dev');
  console.log('2. Server should be running on http://localhost:3000\n');
  
  console.log('Test Commands (use in a new terminal):');
  console.log('');
  
  console.log('# Test 1: Health Check');
  console.log('curl http://localhost:3000/api/health');
  console.log('');
  
  console.log('# Test 2: User Registration');
  console.log('curl -X POST http://localhost:3000/api/auth/register \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d "{\\\"name\\\":\\\"Test User\\\",\\\"email\\\":\\\"test@example.com\\\",\\\"password\\\":\\\"testpass123\\\",\\\"phone\\\":\\\"+1234567890\\\"}"');
  console.log('');
  
  console.log('# Test 3: Admin Login');
  console.log('curl -X POST http://localhost:3000/api/auth/login \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d "{\\\"email\\\":\\\"admin@rentease.com\\\",\\\"password\\\":\\\"admin123\\\"}"');
  console.log('');
  
  console.log('# Test 4: Get Profile (replace TOKEN with actual token from login)');
  console.log('curl -X GET http://localhost:3000/api/auth/profile \\');
  console.log('  -H "Authorization: Bearer TOKEN"');
  console.log('');
  
  console.log('🔐 Default Test Credentials:');
  console.log('Admin: admin@rentease.com / admin123');
  console.log('Manager: manager@rentease.com / manager123');
  console.log('Customer: customer1@example.com / customer123');
};

// Run tests based on command line argument
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--manual')) {
    manualAPITest();
  } else {
    testAPI();
  }
}

export { testAPI, manualAPITest };
