#!/usr/bin/env node

/**
 * Fix Canteen Manager Assignment
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
    
    // Get all canteen managers
    const managers = await usersCollection.find({ role: 'canteen_manager' }).toArray();
    
    console.log('🔧 Fixing Canteen Manager Assignments...\n');
    
    for (const manager of managers) {
      const canteenId = manager.canteenAssigned;
      
      if (!canteenId) {
        console.log(`⚠️  ${manager.email} - NO CANTEEN ASSIGNED`);
        continue;
      }
      
      // Update canteen's manager field
      const updateResult = await canteensCollection.updateOne(
        { _id: new mongoose.Types.ObjectId(canteenId) },
        { 
          $set: { 
            manager: manager._id,
            updatedAt: new Date()
          }
        }
      );
      
      // Get canteen name
      const canteen = await canteensCollection.findOne({ _id: new mongoose.Types.ObjectId(canteenId) });
      
      console.log(`✅ ${manager.email}`);
      console.log(`   Manager ID: ${manager._id}`);
      console.log(`   Canteen: ${canteen.name}`);
      console.log(`   Updated: ${updateResult.modifiedCount > 0 ? 'YES' : 'ALREADY CORRECT'}`);
      console.log('');
    }
    
    console.log('✅ All canteen managers are now properly assigned!');
    console.log('\n🧪 Testing - Fetching updated data:');
    
    const rushi = await usersCollection.findOne({ email: 'rushi@gmail.com' });
    const tuckShopCanteen = await canteensCollection.findOne({ _id: new mongoose.Types.ObjectId(rushi.canteenAssigned) });
    
    console.log(`\n${rushi.email} -> ${tuckShopCanteen.name}`);
    console.log(`Rushi ID: ${rushi._id}`);
    console.log(`Canteen Manager: ${tuckShopCanteen.manager}`);
    console.log(`Match: ${rushi._id.toString() === tuckShopCanteen.manager.toString() ? '✅ YES' : '❌ NO'}`);
    
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
