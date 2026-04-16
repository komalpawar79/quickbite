import mongoose from 'mongoose';
import Canteen from './models/Canteen.js';
import MenuItem from './models/MenuItem.js';
import dotenv from 'dotenv';

dotenv.config();

const findDuplicates = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('🔍 Finding duplicate canteens...\n');
    
    // Get all canteens grouped by name
    const canteens = await Canteen.find().lean();
    
    // Group by name
    const grouped = {};
    canteens.forEach(c => {
      if (!grouped[c.name]) {
        grouped[c.name] = [];
      }
      grouped[c.name].push(c);
    });
    
    // Find duplicates
    let hasDuplicates = false;
    for (const [name, items] of Object.entries(grouped)) {
      if (items.length > 1) {
        hasDuplicates = true;
        console.log(`\n⚠️  Found ${items.length} instances of "${name}":`);
        
        for (let i = 0; i < items.length; i++) {
          const canteen = items[i];
          const menuCount = await MenuItem.countDocuments({ canteen: canteen._id });
          console.log(`\n  ${i + 1}. ID: ${canteen._id}`);
          console.log(`     Name: ${canteen.name}`);
          console.log(`     Active: ${canteen.isActive}`);
          console.log(`     Menu Items: ${menuCount}`);
          console.log(`     Manager: ${canteen.manager || 'None'}`);
        }
        
        // Mark the one to delete (usually the one with 0 items or not active)
        const toDelete = items.find(c => c.isActive === false) || 
                        (await Promise.resolve().then(async () => {
                          for (const c of items) {
                            const count = await MenuItem.countDocuments({ canteen: c._id });
                            if (count === 0) return c;
                          }
                          return null;
                        }));
        
        if (toDelete) {
          console.log(`\n  ❌ RECOMMEND DELETING: ${toDelete._id}`);
        }
      }
    }
    
    if (!hasDuplicates) {
      console.log('✅ No duplicate canteens found!');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

findDuplicates();
