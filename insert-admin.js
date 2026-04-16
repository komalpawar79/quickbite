// Script to insert admin user into MongoDB
// Run with: node insert-admin.js

import mongoose from 'mongoose';
import User from './backend/models/User.js';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbite');
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const insertAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@quickbite.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      return;
    }

    // Create admin user
    const admin = new User({
      name: 'Administrator',
      email: 'admin@quickbite.com',
      password: 'Admin@123', // This will be hashed by the model's pre-save hook
      role: 'admin',
      universityId: 'ADMIN001',
      department: 'Administration',
      phone: '+91-9999999999',
      isVerified: true,
      isActive: true
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@quickbite.com');
    console.log('🔑 Password: Admin@123');
  } catch (error) {
    console.error('❌ Error inserting admin:', error.message);
  }
};

const main = async () => {
  await connectDB();
  await insertAdmin();
  process.exit(0);
};

main();
