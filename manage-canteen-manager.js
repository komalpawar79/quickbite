#!/usr/bin/env node

/**
 * Canteen Manager Management Script
 * Deletes existing canteen manager and creates a new one
 * Usage: node manage-canteen-manager.js
 */

import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbite';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Step 1: Find and delete existing canteen managers
    console.log('\n📋 Looking for existing canteen managers...');
    const existingManagers = await usersCollection.find({ role: 'canteen_manager' }).toArray();
    
    if (existingManagers.length > 0) {
      console.log(`Found ${existingManagers.length} canteen manager(s):`);
      existingManagers.forEach((manager, index) => {
        console.log(`  ${index + 1}. ${manager.name} (${manager.email})`);
      });
      
      const deleteResult = await usersCollection.deleteMany({ role: 'canteen_manager' });
      console.log(`✅ Deleted ${deleteResult.deletedCount} canteen manager(s) from database`);
    } else {
      console.log('ℹ️  No existing canteen managers found');
    }
    
    // Step 2: Create new canteen manager
    console.log('\n🆕 Creating new canteen manager...');
    
    const newManagerPassword = 'CanteenManager@123';
    const hashedPassword = await bcryptjs.hash(newManagerPassword, 10);
    
    const newManager = {
      name: 'Canteen Manager',
      email: 'canteen.manager@quickbite.com',
      password: hashedPassword,
      phone: '+91-9999999998',
      role: 'canteen_manager',
      universityId: 'CM001',
      department: 'Canteen',
      profileImage: null,
      preferences: {
        dietary: 'all',
        theme: 'light',
        notifications: true
      },
      loyaltyPoints: 0,
      isVerified: true,
      isActive: true,
      canteenAssigned: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const insertResult = await usersCollection.insertOne(newManager);
    console.log('✅ New canteen manager created successfully!');
    console.log('\n📧 Canteen Manager Credentials:');
    console.log('   ────────────────────────────');
    console.log(`   Email: canteen.manager@quickbite.com`);
    console.log(`   Password: ${newManagerPassword}`);
    console.log(`   University ID: CM001`);
    console.log('   ────────────────────────────\n');
    
    console.log('💡 अब इस email और password से login करके canteen dashboard access कर सकते हो!');
    
    mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.disconnect();
    process.exit(1);
  }
})
.catch(error => {
  console.error('❌ MongoDB connection failed:', error.message);
  process.exit(1);
});
