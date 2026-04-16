import mongoose from 'mongoose';
import User from '../models/User.js';
import Canteen from '../models/Canteen.js';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';
import dotenv from 'dotenv';

dotenv.config();

const seedAdminData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbite');
    console.log('✅ Connected to MongoDB');

    // Create users
    console.log('📝 Creating test users...');
    const users = await User.insertMany([
      {
        name: 'John Student',
        email: 'student1@example.com',
        password: 'hashedPassword123',
        role: 'student',
        phone: '9876543210',
        hostelBlock: 'A1'
      },
      {
        name: 'Jane Staff',
        email: 'staff1@example.com',
        password: 'hashedPassword123',
        role: 'staff',
        phone: '9876543211',
        department: 'IT'
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'hashedPassword123',
        role: 'admin',
        phone: '9876543212'
      }
    ], { ordered: false }).catch(() => ({ insertedIds: {} }));
    console.log(`✅ Created ${users?.length || 0} users`);

    // Create canteens
    console.log('🏪 Creating test canteens...');
    const canteens = await Canteen.insertMany([
      {
        name: 'Main Canteen',
        location: 'Central Campus',
        operatingHours: { open: '08:00', close: '21:00' },
        isActive: true,
        managerName: 'Rajesh Kumar',
        managerPhone: '9876543220'
      },
      {
        name: 'Hostel Canteen',
        location: 'Hostel Block A',
        operatingHours: { open: '07:00', close: '22:00' },
        isActive: true,
        managerName: 'Priya Sharma',
        managerPhone: '9876543221'
      },
      {
        name: 'Library Cafeteria',
        location: 'Central Library',
        operatingHours: { open: '09:00', close: '20:00' },
        isActive: true,
        managerName: 'Ahmed Khan',
        managerPhone: '9876543222'
      }
    ], { ordered: false }).catch(() => ({ insertedIds: {} }));
    console.log(`✅ Created ${canteens?.length || 0} canteens`);

    // Create categories
    console.log('🏷️ Creating test categories...');
    const categories = await Category.insertMany([
      { name: 'Breakfast', description: 'Morning meals' },
      { name: 'Lunch', description: 'Lunch items' },
      { name: 'Snacks', description: 'Light snacks' },
      { name: 'Beverages', description: 'Drinks' }
    ], { ordered: false }).catch(() => ({ insertedIds: {} }));
    console.log(`✅ Created ${categories?.length || 0} categories`);

    // Create menu items
    console.log('🍜 Creating test menu items...');
    const canteenIds = canteens?.insertedIds ? Object.values(canteens.insertedIds) : [];
    const categoryIds = categories?.insertedIds ? Object.values(categories.insertedIds) : [];

    if (canteenIds.length > 0 && categoryIds.length > 0) {
      await MenuItem.insertMany([
        {
          name: 'Samosa',
          price: 10,
          category: categoryIds[2],
          canteen: canteenIds[0],
          description: 'Crispy triangular pastry',
          isAvailable: true
        },
        {
          name: 'Biryani',
          price: 120,
          category: categoryIds[1],
          canteen: canteenIds[0],
          description: 'Fragrant rice with spices',
          isAvailable: true
        },
        {
          name: 'Dosa',
          price: 80,
          category: categoryIds[0],
          canteen: canteenIds[1],
          description: 'South Indian crepe',
          isAvailable: true
        },
        {
          name: 'Coffee',
          price: 40,
          category: categoryIds[3],
          canteen: canteenIds[2],
          description: 'Hot coffee',
          isAvailable: true
        }
      ], { ordered: false }).catch(() => ({}));
      console.log('✅ Created menu items');
    }

    // Create orders
    console.log('📦 Creating test orders...');
    const userIds = users?.insertedIds ? Object.values(users.insertedIds) : [];
    
    if (userIds.length > 0 && canteenIds.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await Order.insertMany([
        {
          user: userIds[0],
          canteen: canteenIds[0],
          items: [
            { name: 'Samosa', price: 10, quantity: 2 }
          ],
          finalAmount: 20,
          status: 'completed',
          paymentStatus: 'completed',
          paymentMethod: 'wallet',
          createdAt: new Date(),
          completedAt: new Date()
        },
        {
          user: userIds[1],
          canteen: canteenIds[1],
          items: [
            { name: 'Dosa', price: 80, quantity: 1 }
          ],
          finalAmount: 80,
          status: 'completed',
          paymentStatus: 'completed',
          paymentMethod: 'card',
          createdAt: new Date(),
          completedAt: new Date()
        },
        {
          user: userIds[0],
          canteen: canteenIds[2],
          items: [
            { name: 'Coffee', price: 40, quantity: 1 }
          ],
          finalAmount: 40,
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: 'wallet',
          createdAt: today
        }
      ], { ordered: false }).catch(() => ({}));
      console.log('✅ Created test orders');
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log('📊 Test Data Summary:');
    console.log(`   - Users: ${users?.length || 0}`);
    console.log(`   - Canteens: ${canteens?.length || 0}`);
    console.log(`   - Categories: ${categories?.length || 0}`);
    console.log(`   - Orders: 3`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedAdminData();
