#!/usr/bin/env node

/**
 * Check existing canteens and assign manager
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
  console.log('✅ Connected to MongoDB');
  
  try {
    const db = mongoose.connection.db;
    const canteensCollection = db.collection('canteens');
    const usersCollection = db.collection('users');
    
    // Get all canteens
    const canteens = await canteensCollection.find({}).toArray();
    console.log('\n📍 Available Canteens:');
    canteens.forEach((canteen, index) => {
      console.log(`  ${index + 1}. ${canteen.name} (ID: ${canteen._id})`);
    });
    
    // Get the new canteen manager
    const newManager = await usersCollection.findOne({ email: 'canteen.manager@quickbite.com' });
    console.log('\n👤 Canteen Manager:');
    console.log(`   Email: ${newManager.email}`);
    console.log(`   ID: ${newManager._id}`);
    
    if (canteens.length > 0) {
      // Assign manager to first canteen
      const firstCanteen = canteens[0];
      
      const updateResult = await canteensCollection.updateOne(
        { _id: firstCanteen._id },
        { 
          $set: { 
            manager: newManager._id,
            updatedAt: new Date()
          }
        }
      );
      
      // Also update user's canteenAssigned
      await usersCollection.updateOne(
        { _id: newManager._id },
        { $set: { canteenAssigned: firstCanteen._id } }
      );
      
      console.log(`\n✅ Manager assigned to: ${firstCanteen.name}`);
      console.log('✅ अब login कर सकते हो!');
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
