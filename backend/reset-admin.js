import mongoose from 'mongoose';
import User from './models/User.js';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // New password hash (Admin@123)
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash('Admin@123', salt);
    
    console.log('🔧 Resetting admin user...');
    const result = await User.findOneAndUpdate(
      { email: 'admin@quickbite.com' },
      { 
        $set: { 
          password: hashedPassword,
          isVerified: true,
          isActive: true,
          name: 'Administrator'
        } 
      },
      { new: true }
    );
    
    console.log('✅ Admin user reset successfully!');
    console.log(`📧 Email: ${result.email}`);
    console.log(`👤 Name: ${result.name}`);
    console.log(`✅ isVerified: ${result.isVerified}`);
    console.log(`✅ isActive: ${result.isActive}`);
    console.log(`🔐 Role: ${result.role}`);
    console.log('\n🔑 Login Credentials:');
    console.log(`   Email: admin@quickbite.com`);
    console.log(`   Password: Admin@123`);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

resetAdmin();
