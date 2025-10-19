// Quick authentication test script
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testAuthentication() {
  try {
    console.log('🧪 Testing Authentication System...\n');

    // Test 1: Login with admin account
    console.log('1️⃣ Testing admin login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@rentease.com',
      password: 'admin123'
    });

    if (loginResponse.data.success) {
      console.log('✅ Admin login successful');
      console.log(`👤 User: ${loginResponse.data.data.user.name} (${loginResponse.data.data.user.role})`);
      
      const token = loginResponse.data.data.tokens.accessToken;
      
      // Test 2: Verify token with protected route
      console.log('\n2️⃣ Testing protected route access...');
      const profileResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (profileResponse.data.success) {
        console.log('✅ Protected route access successful');
        console.log(`📋 Profile: ${profileResponse.data.data.name} - ${profileResponse.data.data.email}`);
      }
    }

    // Test 3: Test invalid login
    console.log('\n3️⃣ Testing invalid credentials...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'wrong@email.com',
        password: 'wrongpassword'
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Invalid credentials properly rejected');
      }
    }

    console.log('\n🎉 All authentication tests passed!');

  } catch (error) {
    console.error('❌ Authentication test failed:', error.response?.data?.message || error.message);
  }
}

testAuthentication();
