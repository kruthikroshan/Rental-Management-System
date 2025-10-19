// Test API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testEndpoints() {
  console.log('🧪 Testing API Endpoints...\n');

  try {
    // Test 1: Login to get token
    console.log('1. Testing Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@rental.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log(`   Token: ${token.substring(0, 20)}...`);

    const headers = { Authorization: `Bearer ${token}` };

    // Test 2: Get all categories
    console.log('\n2. Testing Categories...');
    const categoriesResponse = await axios.get(`${BASE_URL}/categories`, { headers });
    console.log(`✅ Categories: ${categoriesResponse.data.length} found`);
    categoriesResponse.data.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.slug})`);
    });

    // Test 3: Get all products
    console.log('\n3. Testing Products...');
    const productsResponse = await axios.get(`${BASE_URL}/products`, { headers });
    console.log(`✅ Products: ${productsResponse.data.data.length} found`);
    productsResponse.data.data.slice(0, 3).forEach(product => {
      console.log(`   - ${product.name} (${product.sku}) - $${product.baseRentalRate}/${product.rentalUnits}`);
    });

    // Test 4: Create a quotation
    console.log('\n4. Testing Quotation Creation...');
    const quotationData = {
      customerId: 3, // John Doe
      items: [
        {
          productId: 1, // Excavator
          quantity: 1,
          durationType: 'day',
          duration: 3,
          unitRate: 500
        }
      ],
      notes: 'Test quotation for excavator rental'
    };

    const quotationResponse = await axios.post(`${BASE_URL}/quotations`, quotationData, { headers });
    console.log('✅ Quotation created successfully');
    console.log(`   Quotation ID: ${quotationResponse.data.id}`);
    console.log(`   Total Amount: $${quotationResponse.data.totalAmount}`);

    // Test 5: Get all quotations
    console.log('\n5. Testing Quotations List...');
    const quotationsResponse = await axios.get(`${BASE_URL}/quotations`, { headers });
    console.log(`✅ Quotations: ${quotationsResponse.data.data.length} found`);

    // Test 6: Create a booking
    console.log('\n6. Testing Booking Creation...');
    const bookingData = {
      customerId: 4, // Jane Smith
      items: [
        {
          productId: 3, // Round Tables
          quantity: 5,
          durationType: 'day',
          duration: 2,
          unitRate: 25,
          startDate: '2025-08-20',
          endDate: '2025-08-22'
        }
      ],
      paymentStatus: 'partial',
      notes: 'Wedding event booking'
    };

    const bookingResponse = await axios.post(`${BASE_URL}/bookings`, bookingData, { headers });
    console.log('✅ Booking created successfully');
    console.log(`   Booking ID: ${bookingResponse.data.id}`);
    console.log(`   Total Amount: $${bookingResponse.data.totalAmount}`);

    // Test 7: Get all bookings
    console.log('\n7. Testing Bookings List...');
    const bookingsResponse = await axios.get(`${BASE_URL}/bookings`, { headers });
    console.log(`✅ Bookings: ${bookingsResponse.data.data.length} found`);

    // Test 8: Dashboard stats
    console.log('\n8. Testing Dashboard Stats...');
    const dashboardResponse = await axios.get(`${BASE_URL}/dashboard/stats`, { headers });
    console.log('✅ Dashboard stats retrieved');
    console.log(`   Total Revenue: $${dashboardResponse.data.totalRevenue}`);
    console.log(`   Active Bookings: ${dashboardResponse.data.activeBookings}`);
    console.log(`   Total Products: ${dashboardResponse.data.totalProducts}`);
    console.log(`   Total Customers: ${dashboardResponse.data.totalCustomers}`);

    console.log('\n🎉 All API tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testEndpoints();
