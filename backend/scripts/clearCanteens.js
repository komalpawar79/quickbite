import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Canteen from './models/Canteen.js';

dotenv.config();

const clearCanteens = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbite');
    console.log('✅ MongoDB connected');

    const result = await Canteen.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} canteens`);

    console.log('\n✅ All canteens cleared!');
    console.log('Now you can add canteens from admin dashboard.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

clearCanteens();
