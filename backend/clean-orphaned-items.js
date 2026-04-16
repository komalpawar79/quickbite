import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from './models/MenuItem.js';
import Canteen from './models/Canteen.js';

dotenv.config();

const cleanOrphanedItems = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbite');
    console.log('✅ Connected to MongoDB\n');

    // Get all real canteens
    const realCanteens = await Canteen.find({}, '_id name');
    console.log('✅ Real canteens in database:');
    realCanteens.forEach(c => console.log('  -', c.name));
    
    const realCanteenIds = realCanteens.map(c => c._id.toString());
    
    // Find menu items not belonging to real canteens
    const orphanedItems = await MenuItem.find({
      canteen: { $nin: realCanteenIds }
    });
    
    console.log('\n🗑️ Found', orphanedItems.length, 'orphaned menu items');
    
    if (orphanedItems.length > 0) {
      const result = await MenuItem.deleteMany({
        canteen: { $nin: realCanteenIds }
      });
      console.log('✅ Deleted', result.deletedCount, 'orphaned items\n');
    }
    
    // Show current menu items summary
    const totalItems = await MenuItem.countDocuments();
    console.log('📊 Total menu items remaining:', totalItems);
    
    const itemsByCanteen = await MenuItem.aggregate([
      { $group: { _id: '$canteen', count: { $sum: 1 } } },
      { $lookup: { from: 'canteens', localField: '_id', foreignField: '_id', as: 'canteen' } },
      { $unwind: '$canteen' }
    ]);
    
    console.log('\n📈 Items by canteen:');
    itemsByCanteen.forEach(item => {
      console.log('  -', item.canteen.name + ':', item.count);
    });
    
    console.log('\n✅ Cleanup completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

cleanOrphanedItems();
