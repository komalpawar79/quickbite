#!/usr/bin/env node

/**
 * Find all canteen managers in database
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbite';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB\n');
  
  try {
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Find all canteen managers
    const managers = await usersCollection.find({ role: 'canteen_manager' }).toArray();
    
    if (managers.length === 0) {
      console.log('❌ कोई canteen manager नहीं मिला');
    } else {
      console.log(`📋 Total Canteen Managers: ${managers.length}\n`);
      
      managers.forEach((manager, index) => {
        console.log(`${index + 1}. Canteen Manager:`);
        console.log(`   📧 Email: ${manager.email}`);
        console.log(`   👤 Name: ${manager.name}`);
        console.log(`   📱 Phone: ${manager.phone}`);
        console.log(`   🏪 Canteen ID: ${manager.canteenAssigned}`);
        console.log(`   ✅ Verified: ${manager.isVerified}`);
        console.log(`   🔓 Active: ${manager.isActive}`);
        console.log(`   ⏰ Created: ${manager.createdAt}`);
        console.log('');
      });
      
      console.log('⚠️  Password hash को नहीं दिखा सकते (encrypted है)');
      console.log('💡 अगर password भूल گए हो तो नया password set कर सकते हो');
    }
    
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
