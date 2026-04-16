import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Canteen from './models/Canteen.js';

dotenv.config();

const testCanteen = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbite');
    console.log('✅ MongoDB connected\n');

    // Test: Create a canteen
    console.log('📝 Creating test canteen...');
    const testData = {
      name: 'Test Canteen',
      location: {
        building: 'Test Building',
        floor: 'Ground Floor'
      },
      description: 'Test canteen for verification',
      operatingHours: {
        open: '08:00',
        close: '20:00',
        daysOpen: ['Monday', 'Tuesday', 'Wednesday']
      },
      isActive: true
    };

    const canteen = new Canteen(testData);
    await canteen.save();
    console.log('✅ Canteen created:', canteen._id);
    console.log('   Name:', canteen.name);
    console.log('   Location:', canteen.location.building);

    // Test: Fetch all canteens
    console.log('\n📋 Fetching all canteens...');
    const allCanteens = await Canteen.find();
    console.log(`✅ Found ${allCanteens.length} canteen(s):`);
    allCanteens.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.name} (${c._id})`);
    });

    // Cleanup
    console.log('\n🗑️  Deleting test canteen...');
    await Canteen.findByIdAndDelete(canteen._id);
    console.log('✅ Test canteen deleted');

    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testCanteen();
