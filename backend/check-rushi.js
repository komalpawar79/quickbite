#!/usr/bin/env node

/**
 * Check specific canteen manager's canteenAssigned value
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
    const canteensCollection = db.collection('canteens');
    
    // Find rushi
    const rushi = await usersCollection.findOne({ email: 'rushi@gmail.com' });
    
    if (!rushi) {
      console.log('❌ rushi@gmail.com not found');
      mongoose.disconnect();
      process.exit(1);
    }
    
    console.log('👤 Rushi Profile:');
    console.log(`   📧 Email: ${rushi.email}`);
    console.log(`   👤 Name: ${rushi.name}`);
    console.log(`   🏪 canteenAssigned: ${rushi.canteenAssigned}`);
    console.log(`   ✅ isVerified: ${rushi.isVerified}`);
    console.log(`   🔓 isActive: ${rushi.isActive}`);
    
    if (rushi.canteenAssigned) {
      // Find the canteen
      const canteen = await canteensCollection.findOne({ _id: new mongoose.Types.ObjectId(rushi.canteenAssigned) });
      if (canteen) {
        console.log(`\n🏪 Assigned Canteen:`);
        console.log(`   Name: ${canteen.name}`);
        console.log(`   ID: ${canteen._id}`);
        console.log(`   Manager in Canteen: ${canteen.manager}`);
      }
    } else {
      console.log('\n❌ NO CANTEEN ASSIGNED!');
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
