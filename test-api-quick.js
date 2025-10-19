const axios = require('axios');

async function testAPI() {
  try {
    console.log('🔍 Testing API health endpoint...');
    
    const response = await axios.get('http://localhost:3000/api/health', {
      timeout: 5000
    });
    
    console.log('✅ API Response:', response.data);
    console.log('🚀 Status:', response.status);
    
    if (response.status === 200) {
      console.log('✅ Backend API is working correctly!');
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running');
      console.log('💡 Please start the backend server first with: npm run dev');
    } else {
      console.log('❌ API Test failed:', error.message);
    }
  }
}

testAPI();
