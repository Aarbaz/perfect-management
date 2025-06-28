const axios = require('axios');

async function testDashboard() {
  try {
    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('Login successful, token:', token.substring(0, 20) + '...');
    
    // Test dashboard summary with token
    const dashboardResponse = await axios.get('http://localhost:8080/api/dashboard/summary', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Dashboard summary response:', dashboardResponse.data);
  } catch (error) {
    console.error('Error testing dashboard:', error);
  }
}

testDashboard(); 