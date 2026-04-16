import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const login = async () => {
  try {
    console.log('🔐 Logging in as admin...');
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@quickbite.com',
      password: 'Admin@123'
    });

    console.log('📊 Response structure:', JSON.stringify(response.data, null, 2));
    
    const token = response.data.token || response.data.data?.token;
    if (!token) {
      throw new Error('No token in response');
    }
    
    console.log('\n✅ Login successful!');
    console.log(`📝 Token: ${token}\n`);
    
    // Also show how to use it
    console.log('📋 To use this token with curl:');
    console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:5000/api/admin/dashboard/stats\n`);
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    process.exit(1);
  }
};

login();
