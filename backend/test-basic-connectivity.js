// Simple API connectivity test
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testBasicConnectivity() {
  console.log('🧪 Testing Basic API Connectivity...\n');

  try {
    console.log('1. Testing server health...');
    
    // Test a simple endpoint first
    try {
      const response = await axios.get(`${BASE_URL}/categories`, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Categories endpoint requires authentication (expected)');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Server is responding correctly - authentication required');
      } else {
        console.log('❌ Server error:', error.message);
        return;
      }
    }

    console.log('\n2. Testing login with admin credentials...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@rental.com',
      password: 'admin123'
    }, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log(`   User: ${loginResponse.data.user.name} (${loginResponse.data.user.role})`);

    const headers = { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('\n3. Testing authenticated endpoints...');
    
    // Test categories
    const categoriesResponse = await axios.get(`${BASE_URL}/categories`, { headers });
    console.log(`✅ Categories: ${categoriesResponse.data.length} found`);

    // Test products
    const productsResponse = await axios.get(`${BASE_URL}/products`, { headers });
    console.log(`✅ Products: ${productsResponse.data.data.length} found`);

    // Test dashboard
    const dashboardResponse = await axios.get(`${BASE_URL}/dashboard/stats`, { headers });
    console.log(`✅ Dashboard stats retrieved`);
    console.log(`   Total Revenue: $${dashboardResponse.data.totalRevenue}`);
    console.log(`   Active Bookings: ${dashboardResponse.data.activeBookings}`);

    console.log('\n🎉 All basic connectivity tests passed!');
    console.log('\n🌐 Your rental management system is fully operational!');
    console.log('📱 Frontend: http://localhost:5173');
    console.log('🔧 Backend API: http://localhost:3000');
    console.log('\n🔐 Test Credentials:');
    console.log('   Admin: admin@rental.com / admin123');
    console.log('   Manager: manager@rental.com / manager123');
    console.log('   Customer: john@example.com / customer123');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Cannot connect to server. Make sure the backend is running on port 3000');
    } else {
      console.error('❌ Test failed:', error.response?.data || error.message);
    }
  }
}

testBasicConnectivity();
