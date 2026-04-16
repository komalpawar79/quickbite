import mongoose from 'mongoose';
import Canteen from './models/Canteen.js';
import MenuItem from './models/MenuItem.js';
import dotenv from 'dotenv';

dotenv.config();

const checkAllCanteens = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('📋 All Canteens in Database:\n');
    
    const canteens = await Canteen.find().lean();
    
    for (const canteen of canteens) {
      const menuCount = await MenuItem.countDocuments({ canteen: canteen._id });
      console.log(`🏪 ${canteen.name}`);
      console.log(`   ID: ${canteen._id}`);
      console.log(`   Active: ${canteen.isActive}`);
      console.log(`   Menu Items: ${menuCount}`);
      console.log(`   Manager: ${canteen.manager || 'None'}`);
      console.log('');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

checkAllCanteens();
