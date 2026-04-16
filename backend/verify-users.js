// verify-users.js - Show all remaining users in database
import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const verifyUsers = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('\n📋 ALL REMAINING USERS IN DATABASE:\n');
    const allUsers = await User.find();
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Phone: ${user.phone || 'N/A'}`);
      console.log(`   University ID: ${user.universityId || 'N/A'}`);
      console.log(`   Status: ${user.isActive ? '✅ Active' : '❌ Inactive'}`);
      console.log('');
    });
    
    console.log(`📊 Total Users: ${allUsers.length}`);
    console.log('\n✅ Verification complete!');
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

verifyUsers();
