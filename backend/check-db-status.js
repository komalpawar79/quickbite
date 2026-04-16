import mongoose from 'mongoose';
import User from './models/User.js';
import Canteen from './models/Canteen.js';
import Order from './models/Order.js';
import MenuItem from './models/MenuItem.js';
import Category from './models/Category.js';
import dotenv from 'dotenv';

dotenv.config();

const checkDatabase = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get counts
    const userCount = await User.countDocuments();
    const canteenCount = await Canteen.countDocuments();
    const activeCanteenCount = await Canteen.countDocuments({ isActive: true });
    const orderCount = await Order.countDocuments();
    const menuItemCount = await MenuItem.countDocuments();
    const categoryCount = await Category.countDocuments();

    console.log('📊 DATABASE STATUS:');
    console.log('─'.repeat(40));
    console.log(`👥 Total Users: ${userCount}`);
    console.log(`🏪 Total Canteens: ${canteenCount}`);
    console.log(`🟢 Active Canteens: ${activeCanteenCount}`);
    console.log(`📦 Total Orders: ${orderCount}`);
    console.log(`🍜 Total Menu Items: ${menuItemCount}`);
    console.log(`📂 Total Categories: ${categoryCount}`);
    console.log('─'.repeat(40));

    if (userCount === 0) {
      console.log('\n⚠️  Database is EMPTY - No users found');
      console.log('You can either:');
      console.log('1. Run: npm run seed (to add test data)');
      console.log('2. Create users manually through the API');
    } else {
      console.log('\n✅ Database has data!');
      
      // Show sample users
      const users = await User.find().limit(3);
      console.log('\nSample Users:');
      users.forEach((user, i) => {
        console.log(`  ${i+1}. ${user.name} (${user.email}) - Role: ${user.role}`);
      });

      // Show sample canteens
      if (canteenCount > 0) {
        const canteens = await Canteen.find().limit(3);
        console.log('\nSample Canteens:');
        canteens.forEach((canteen, i) => {
          console.log(`  ${i+1}. ${canteen.name} (${canteen.isActive ? 'Active' : 'Inactive'})`);
        });
      }
    }

    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkDatabase();
