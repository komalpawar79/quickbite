import mongoose from 'mongoose';
import Canteen from './models/Canteen.js';
import dotenv from 'dotenv';

dotenv.config();

const deleteEmptyCanteen = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('🗑️  Deleting empty Tirupati Canteen...\n');
    
    const result = await Canteen.findByIdAndDelete('69cbb1612aa79e26ed0200b9');
    
    if (result) {
      console.log('✅ Successfully deleted!');
      console.log(`   Name: ${result.name}`);
      console.log(`   ID: ${result._id}`);
    } else {
      console.log('❌ Canteen not found');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

deleteEmptyCanteen();
