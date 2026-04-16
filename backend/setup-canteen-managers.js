#!/usr/bin/env node

/**
 * Setup Canteens and Assign Managers
 * This script seeds canteens and assigns managers correctly
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Canteen from './models/Canteen.js';

dotenv.config();

const canteensData = [
  {
    name: 'Tuck-Shop Canteen',
    location: { building: 'Campus Main', floor: 'Ground Floor' },
    description: 'Classic tuck shop with variety of snacks and meals',
    cuisines: ['Indian', 'Snacks', 'Beverages'],
    managerEmail: 'rushi@gmail.com'
  },
  {
    name: 'Tirupati Canteen',
    location: { building: 'South Wing', floor: '1st Floor' },
    description: 'Traditional South Indian cuisine and specialties',
    cuisines: ['South Indian', 'Dosa', 'Idli', 'Sambar'],
    managerEmail: 'saniya@gmail.com'
  },
  {
    name: 'Asifa Sandwich Center',
    location: { building: 'East Building', floor: 'Ground Floor' },
    description: 'Fresh sandwiches and fast food specialties',
    cuisines: ['Sandwiches', 'Fast Food', 'Wraps'],
    managerEmail: 'raj@gmail.com'
  },
  {
    name: 'Indian Fresh Juice Center',
    location: { building: 'Student Center', floor: '2nd Floor' },
    description: 'Fresh juices and healthy beverages',
    cuisines: ['Fresh Juice', 'Smoothies', 'Health Drinks'],
    managerEmail: 'naushad@gmail.com'
  },
  {
    name: 'Meeting Point',
    location: { building: 'Central Hub', floor: '1st Floor' },
    description: 'All-in-one dining destination with diverse menu options',
    cuisines: ['Indian', 'Chinese', 'Continental', 'Fast Food'],
    managerEmail: 'kdpawar@gmail.com'
  }
];

const setupCanteensAndManagers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbite');
    console.log('✅ Connected to MongoDB\n');

    console.log('🔧 Setting up Canteens and Managers...\n');

    for (const canteenData of canteensData) {
      const { name, managerEmail, ...canteenInfo } = canteenData;

      // Find or create canteen
      let canteen = await Canteen.findOne({ name });
      
      if (!canteen) {
        canteen = await Canteen.create({
          name,
          ...canteenInfo,
          operatingHours: {
            open: '07:00',
            close: '22:00',
            daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
          },
          isActive: true,
          serviceTypes: {
            dineIn: true,
            takeaway: true,
            delivery: true
          }
        });
        console.log(`✅ Created Canteen: ${name}`);
      } else {
        console.log(`✅ Found Canteen: ${name}`);
      }

      // Find manager and assign canteen
      const manager = await User.findOne({ email: managerEmail });
      
      if (manager) {
        if (!manager.canteenAssigned || manager.canteenAssigned.toString() !== canteen._id.toString()) {
          manager.canteenAssigned = canteen._id;
          await manager.save();
          console.log(`   ✅ Assigned to: ${manager.name} (${managerEmail})`);
        } else {
          console.log(`   ✅ Already assigned to: ${manager.name}`);
        }

        // Also update canteen's manager field
        canteen.manager = manager._id;
        await canteen.save();
      } else {
        console.log(`   ⚠️  Manager not found: ${managerEmail}`);
      }

      console.log('');
    }

    console.log('\n✅ Setup completed! Summary:\n');
    console.log('Canteen Managers:');
    
    const canteens = await Canteen.find().populate('manager', 'name email');
    canteens.forEach((canteen) => {
      console.log(`  • ${canteen.name}`);
      console.log(`    Manager: ${canteen.manager?.name || 'UNASSIGNED'} (${canteen.manager?.email || 'N/A'})`);
      console.log(`    Canteen ID: ${canteen._id}\n`);
    });

    console.log('✅ All canteens and managers are properly configured!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

setupCanteensAndManagers();
