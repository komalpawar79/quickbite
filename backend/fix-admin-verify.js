import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const fixAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('🔧 Updating admin user verification status...');
    const result = await User.findOneAndUpdate(
      { email: 'admin@quickbite.com' },
      { $set: { isVerified: true } },
      { new: true }
    );
    
    console.log('✅ Admin user updated!');
    console.log(`📧 Email: ${result.email}`);
    console.log(`✅ isVerified: ${result.isVerified}`);
    console.log(`✅ isActive: ${result.isActive}`);
    console.log(`🔐 Role: ${result.role}`);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

fixAdmin();
