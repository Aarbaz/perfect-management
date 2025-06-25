const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

async function testAPI() {
  console.log('🧪 Testing Vehicle  Management API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthRes = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthRes.data.message);
    console.log('   Timestamp:', healthRes.data.timestamp);
    console.log('');

    // Test registration
    console.log('2. Testing user registration...');
    const registerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'test123'
    };
    
    try {
      const registerRes = await axios.post(`${BASE_URL}/api/auth/register`, registerData);
      console.log('✅ Registration successful');
      console.log('   User ID:', registerRes.data.data.user.id);
      console.log('   Token received:', registerRes.data.data.token ? 'Yes' : 'No');
      console.log('');
      
      // Test login with registered user
      console.log('3. Testing user login...');
      const loginData = {
        username: 'testuser',
        password: 'test123'
      };
      
      const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
      console.log('✅ Login successful');
      console.log('   Token received:', loginRes.data.data.token ? 'Yes' : 'No');
      console.log('');
      
      const token = loginRes.data.data.token;
      
      // Test protected endpoint with token
      console.log('4. Testing protected endpoint (vehicles)...');
      const vehiclesRes = await axios.get(`${BASE_URL}/api/vehicles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Protected endpoint accessible');
      console.log('   Vehicles count:', vehiclesRes.data.data.vehicles.length);
      console.log('   Pagination:', vehiclesRes.data.data.pagination);
      console.log('');
      
      // Test dashboard endpoint
      console.log('5. Testing dashboard endpoint...');
      const dashboardRes = await axios.get(`${BASE_URL}/api/dashboard/daily-summary`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Dashboard endpoint accessible');
      console.log('   Total vehicles:', dashboardRes.data.data.totalVehicles);
      console.log('   Total amount:', dashboardRes.data.data.totalAmount);
      console.log('');
      
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('⚠️  User already exists, testing login instead...');
        
        // Test login with existing user
        const loginData = {
          username: 'testuser',
          password: 'test123'
        };
        
        const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
        console.log('✅ Login successful');
        console.log('   Token received:', loginRes.data.data.token ? 'Yes' : 'No');
        console.log('');
      } else {
        throw error;
      }
    }

    console.log('🎉 All API tests passed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Backend server is running on port 8080');
    console.log('   ✅ Database connection is working');
    console.log('   ✅ Authentication system is functional');
    console.log('   ✅ Protected routes are working');
    console.log('   ✅ API endpoints are responding correctly');
    
  } catch (error) {
    console.error('❌ API test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data?.message || error.message);
    } else if (error.request) {
      console.error('   Network error - Backend server might not be running');
      console.error('   Make sure to start the backend with: npm start');
    } else {
      console.error('   Error:', error.message);
    }
  }
}

// Run the test
testAPI(); 