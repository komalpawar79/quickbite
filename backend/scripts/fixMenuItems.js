import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from './models/MenuItem.js';
import Canteen from './models/Canteen.js';

dotenv.config();

const fixMenuItems = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbite');
    console.log('✅ MongoDB connected');

    // Get first canteen as default
    const defaultCanteen = await Canteen.findOne();
    
    if (!defaultCanteen) {
      console.log('❌ No canteen found. Please create a canteen first.');
      process.exit(1);
    }

    console.log(`📍 Using default canteen: ${defaultCanteen.name} (${defaultCanteen._id})`);

    // Find items without canteen
    const itemsWithoutCanteen = await MenuItem.find({ 
      $or: [
        { canteen: { $exists: false } },
        { canteen: null }
      ]
    });

    console.log(`\n📊 Found ${itemsWithoutCanteen.length} items without canteen`);

    if (itemsWithoutCanteen.length === 0) {
      console.log('✅ All items already have canteen assigned!');
      process.exit(0);
    }

    // Option 1: Assign to default canteen
    console.log('\n🔧 Assigning all items to default canteen...');
    const result = await MenuItem.updateMany(
      { 
        $or: [
          { canteen: { $exists: false } },
          { canteen: null }
        ]
      },
      { $set: { canteen: defaultCanteen._id } }
    );

    console.log(`✅ Updated ${result.modifiedCount} items`);

    // Verify
    const remainingItems = await MenuItem.countDocuments({ 
      $or: [
        { canteen: { $exists: false } },
        { canteen: null }
      ]
    });

    console.log(`\n📊 Remaining items without canteen: ${remainingItems}`);
    
    if (remainingItems === 0) {
      console.log('✅ Migration completed successfully!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Alternative: Delete old items
const deleteOldItems = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbite');
    console.log('✅ MongoDB connected');

    const result = await MenuItem.deleteMany({ 
      $or: [
        { canteen: { $exists: false } },
        { canteen: null }
      ]
    });

    console.log(`🗑️  Deleted ${result.deletedCount} old items`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run based on command line argument
const action = process.argv[2];

if (action === 'delete') {
  console.log('⚠️  WARNING: This will DELETE all items without canteen!');
  deleteOldItems();
} else {
  console.log('🔧 Fixing menu items by assigning to default canteen...');
  fixMenuItems();
}
