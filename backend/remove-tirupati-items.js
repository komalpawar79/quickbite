import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from './models/MenuItem.js';
import Canteen from './models/Canteen.js';

dotenv.config();

const removeTirupatiItems = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbite');
    console.log('✅ Connected to MongoDB\n');

    // Find Tirupati Canteen
    const tirupati = await Canteen.findOne({ name: 'Tirupati Canteen' });
    
    if (!tirupati) {
      console.log('❌ Tirupati Canteen not found');
      process.exit(1);
    }

    console.log('🏪 Tirupati Canteen ID:', tirupati._id);
    
    // Count items before deletion
    const itemsBefore = await MenuItem.countDocuments({ canteen: tirupati._id });
    console.log('📊 Items before deletion:', itemsBefore);
    
    // Delete all menu items for Tirupati Canteen
    const result = await MenuItem.deleteMany({ canteen: tirupati._id });
    console.log('🗑️ Deleted:', result.deletedCount, 'items\n');
    
    // Show updated counts
    const totalItems = await MenuItem.countDocuments();
    console.log('📊 Total menu items remaining:', totalItems);
    
    const itemsByCanteen = await MenuItem.aggregate([
      { $group: { _id: '$canteen', count: { $sum: 1 } } },
      { $lookup: { from: 'canteens', localField: '_id', foreignField: '_id', as: 'canteen' } },
      { $unwind: '$canteen' }
    ]);
    
    if (itemsByCanteen.length === 0) {
      console.log('\n✅ No menu items in any canteen');
    } else {
      console.log('\n📈 Items by canteen:');
      itemsByCanteen.forEach(item => {
        console.log('  -', item.canteen.name + ':', item.count);
      });
    }
    
    console.log('\n✅ All Tirupati Canteen items removed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

removeTirupatiItems();
