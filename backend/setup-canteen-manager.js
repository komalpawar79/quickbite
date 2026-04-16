#!/usr/bin/env node

/**
 * Create New Canteen Manager and Assign to Canteen
 */

import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbite';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    const db = mongoose.connection.db;
    const canteensCollection = db.collection('canteens');
    const usersCollection = db.collection('users');
    
    // Get all canteens
    const canteens = await canteensCollection.find({}).toArray();
    if (canteens.length === 0) {
      console.log('❌ No canteens found in database');
      mongoose.disconnect();
      process.exit(1);
    }
    
    console.log('\n📍 Available Canteens:');
    canteens.forEach((canteen, index) => {
      console.log(`  ${index + 1}. ${canteen.name}`);
    });
    
    // Delete existing canteen managers
    const deleteResult = await usersCollection.deleteMany({ role: 'canteen_manager' });
    console.log(`\n🗑️  Deleted ${deleteResult.deletedCount} existing manager(s)`);
    
    // Create new manager
    const newManagerPassword = 'CanteenManager@123';
    const hashedPassword = await bcryptjs.hash(newManagerPassword, 10);
    const firstCanteen = canteens[0];
    
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
      canteenAssigned: firstCanteen._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const insertResult = await usersCollection.insertOne(newManager);
    console.log('✅ New manager created!');
    
    // Assign manager to canteen
    await canteensCollection.updateOne(
      { _id: firstCanteen._id },
      { 
        $set: { 
          manager: insertResult.insertedId,
          updatedAt: new Date()
        }
      }
    );
    
    console.log('\n✅ Manager Assigned to: ' + firstCanteen.name);
    console.log('\n📧 Canteen Manager Credentials:');
    console.log('   ────────────────────────────');
    console.log(`   Email: canteen.manager@quickbite.com`);
    console.log(`   Password: ${newManagerPassword}`);
    console.log(`   Canteen: ${firstCanteen.name}`);
    console.log('   ────────────────────────────\n');
    console.log('✅ अब login कर सकते हो!');
    
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
