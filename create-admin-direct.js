#!/usr/bin/env node

/**
 * Direct Admin User Creator - Run this to create admin user
 * Usage: node create-admin-direct.js
 */

import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbite';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // Get users collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Check if admin already exists
    const existingAdmin = await usersCollection.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Password: Admin@123');
      mongoose.disconnect();
      process.exit(0);
    }
    
    // Hash the password
    const hashedPassword = await bcryptjs.hash('Admin@123', 10);
    
    // Create admin document
    const adminDoc = {
      name: 'Administrator',
      email: 'admin@quickbite.com',
      password: hashedPassword,
      role: 'admin',
      universityId: 'ADMIN001',
      department: 'Administration',
      phone: '+91-9999999999',
      isVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert admin
    const result = await usersCollection.insertOne(adminDoc);
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@quickbite.com');
    console.log('🔑 Password: Admin@123');
    console.log('👤 Role: admin');
    console.log('');
    console.log('Next steps:');
    console.log('1. Go to http://localhost:3000/login');
    console.log('2. Enter email: admin@quickbite.com');
    console.log('3. Enter password: Admin@123');
    console.log('4. Click Login');
    console.log('5. You will be redirected to http://localhost:3000/admin');
    
    mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.disconnect();
    process.exit(1);
  }
})
.catch((error) => {
  console.error('❌ MongoDB Connection Error:', error.message);
  process.exit(1);
});
