import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Canteen from './models/Canteen.js';

dotenv.config();

const canteens = [
  {
    name: 'Tuck-Shop Canteen',
    location: {
      building: 'Campus Main',
      floor: 'Ground Floor'
    },
    description: 'Classic tuck shop with variety of snacks and meals',
    operatingHours: {
      open: '07:00',
      close: '22:00',
      daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    cuisines: ['Indian', 'Snacks', 'Beverages'],
    isActive: true,
    serviceTypes: {
      dineIn: true,
      takeaway: true,
      delivery: true
    }
  },
  {
    name: 'Tirupati Canteen',
    location: {
      building: 'South Wing',
      floor: '1st Floor'
    },
    description: 'Traditional South Indian cuisine and specialties',
    operatingHours: {
      open: '08:00',
      close: '23:00',
      daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    cuisines: ['South Indian', 'Dosa', 'Idli', 'Sambar'],
    isActive: true,
    serviceTypes: {
      dineIn: true,
      takeaway: true,
      delivery: false
    }
  },
  {
    name: 'Asifa Sandwich Center',
    location: {
      building: 'East Building',
      floor: 'Ground Floor'
    },
    description: 'Fresh sandwiches and fast food specialties',
    operatingHours: {
      open: '09:00',
      close: '20:00',
      daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    cuisines: ['Sandwiches', 'Fast Food', 'Wraps'],
    isActive: true,
    serviceTypes: {
      dineIn: false,
      takeaway: true,
      delivery: false
    }
  },
  {
    name: 'Indian Fresh Juice Center',
    location: {
      building: 'Student Center',
      floor: '2nd Floor'
    },
    description: 'Fresh juices and healthy beverages',
    operatingHours: {
      open: '08:00',
      close: '21:00',
      daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    cuisines: ['Fresh Juice', 'Smoothies', 'Health Drinks'],
    isActive: true,
    serviceTypes: {
      dineIn: true,
      takeaway: true,
      delivery: false
    }
  },
  {
    name: 'Meeting Point',
    location: {
      building: 'Central Hub',
      floor: '1st Floor'
    },
    description: 'All-in-one dining destination with diverse menu options',
    operatingHours: {
      open: '07:30',
      close: '22:30',
      daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    cuisines: ['Indian', 'Chinese', 'Continental', 'Fast Food'],
    isActive: true,
    serviceTypes: {
      dineIn: true,
      takeaway: true,
      delivery: true
    }
  }
];

const seedCanteens = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbite');
    console.log('✅ MongoDB connected');

    // Clear existing canteens
    await Canteen.deleteMany({});
    console.log('🗑️  Cleared existing canteens');

    // Insert new canteens
    const created = await Canteen.insertMany(canteens);
    console.log(`✅ Created ${created.length} canteens:`);
    
    created.forEach((canteen, i) => {
      console.log(`   ${i + 1}. ${canteen.name} (ID: ${canteen._id})`);
    });

    console.log('\n✅ Canteen seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedCanteens();
