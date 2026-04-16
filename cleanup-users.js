// cleanup-users.js - Remove admin and student users from database
import mongoose from 'mongoose';
import User from './backend/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const cleanupUsers = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('📊 Current Users:');
    const allUsers = await User.find().select('name email role universityId');
    console.table(allUsers);
    
    console.log('\n🗑️  Removing admin and student users...');
    
    // Delete admin and student roles only
    const result = await User.deleteMany({ 
      role: { $in: ['admin', 'student'] } 
    });
    
    console.log(`✅ Deleted ${result.deletedCount} users (admin and student roles)`);
    
    console.log('\n📋 Remaining Users (Admin-created only):');
    const remainingUsers = await User.find().select('name email role universityId').exec();
    console.table(remainingUsers);
    
    await mongoose.connection.close();
    console.log('\n✅ Cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

cleanupUsers();
