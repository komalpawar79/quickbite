import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const admin = await User.findOne({ email: 'admin@quickbite.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found with email: admin@quickbite.com');
      
      // Try to find any admin users
      const admins = await User.find({ role: 'admin' });
      console.log(`\n📝 Found ${admins.length} admin users:`);
      admins.forEach(a => {
        console.log(`  - ${a.name} (${a.email})`);
      });
    } else {
      console.log('✅ Admin user found!');
      console.log(`📧 Email: ${admin.email}`);
      console.log(`👤 Name: ${admin.name}`);
      console.log(`✅ isVerified: ${admin.isVerified}`);
      console.log(`✅ isActive: ${admin.isActive}`);
      console.log(`🔐 Role: ${admin.role}`);
      console.log(`\n📝 Raw password hash (first 20 chars): ${admin.password.substring(0, 20)}...`);
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

checkAdmin();
