import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Canteen from '../models/Canteen.js';
import MenuItem from '../models/MenuItem.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbite');
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await Canteen.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('Cleared existing canteens and menu items');

    // Sample Canteens
    const canteens = await Canteen.create([
      {
        name: 'Main Canteen',
        location: {
          building: 'Building A',
          floor: 'Ground Floor',
          coordinates: { latitude: 12.8435, longitude: 77.6741 }
        },
        description: 'The main campus canteen with diverse food options',
        image: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400',
        operatingHours: {
          open: '8:00 AM',
          close: '9:00 PM',
          daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        cuisines: ['Indian', 'North Indian', 'South Indian'],
        avgRating: 4.5,
        totalRatings: 250,
        isActive: true,
        serviceTypes: {
          dineIn: true,
          takeaway: true,
          delivery: true
        },
        specialOffers: [
          {
            title: 'Student Discount',
            description: '20% off on all meals with valid ID',
            discount: 20,
            validUntil: new Date('2025-12-31')
          }
        ]
      },
      {
        name: 'North Campus Cafe',
        location: {
          building: 'Building B',
          floor: '1st Floor',
          coordinates: { latitude: 12.8440, longitude: 77.6750 }
        },
        description: 'Specialty North Indian and Continental cuisine',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
        operatingHours: {
          open: '9:00 AM',
          close: '8:00 PM',
          daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        cuisines: ['North Indian', 'Continental'],
        avgRating: 4.7,
        totalRatings: 180,
        isActive: true,
        serviceTypes: {
          dineIn: true,
          takeaway: true,
          delivery: true
        }
      },
      {
        name: 'South Campus Thali',
        location: {
          building: 'Building C',
          floor: 'Ground Floor',
          coordinates: { latitude: 12.8430, longitude: 77.6735 }
        },
        description: 'Authentic South Indian thali and authentic cuisine',
        image: 'https://images.unsplash.com/photo-1601050690597-df0288c3b9c6?w=400',
        operatingHours: {
          open: '8:30 AM',
          close: '7:30 PM',
          daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        cuisines: ['South Indian', 'Tamil', 'Telugu'],
        avgRating: 4.6,
        totalRatings: 320,
        isActive: true,
        serviceTypes: {
          dineIn: true,
          takeaway: true,
          delivery: false
        }
      },
      {
        name: 'Quick Bites Kiosk',
        location: {
          building: 'Central Plaza',
          floor: 'Outdoor',
          coordinates: { latitude: 12.8425, longitude: 77.6745 }
        },
        description: 'Fast food and snacks, perfect for quick meals',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
        operatingHours: {
          open: '7:00 AM',
          close: '10:00 PM',
          daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        cuisines: ['Fast Food', 'Snacks', 'Beverages'],
        avgRating: 4.3,
        totalRatings: 150,
        isActive: true,
        serviceTypes: {
          dineIn: false,
          takeaway: true,
          delivery: true
        }
      }
    ]);

    console.log(`✅ Created ${canteens.length} canteens`);

    // Sample Menu Items
    const menuItems = await MenuItem.create([
      // Main Canteen Items
      {
        canteen: canteens[0]._id,
        name: 'Butter Chicken Thali',
        description: 'Rich and creamy butter chicken with basmati rice, dal, and naan',
        image: 'https://images.unsplash.com/photo-1585937421612-70a19fb6930e?w=400',
        price: 250,
        cuisine: 'North Indian',
        category: 'lunch',
        isAvailable: true,
        preparationTime: 20,
        rating: 4.7,
        reviewCount: 45,
        ordersCount: 156,
        spiceLevel: 'medium',
        ingredients: ['Chicken', 'Cream', 'Tomato', 'Butter', 'Spices'],
        tags: ['popular', 'bestseller'],
        discount: 10
      },
      {
        canteen: canteens[0]._id,
        name: 'Masala Dosa',
        description: 'Crispy dosa filled with spiced potatoes and served with sambar',
        image: 'https://images.unsplash.com/photo-1630383249896-424e7b2ea6d3?w=400',
        price: 120,
        cuisine: 'South Indian',
        category: 'breakfast',
        isAvailable: true,
        preparationTime: 15,
        rating: 4.5,
        reviewCount: 78,
        ordersCount: 234,
        spiceLevel: 'medium',
        ingredients: ['Rice', 'Dal', 'Potatoes', 'Onion'],
        tags: ['popular', 'trending'],
        discount: 0
      },
      {
        canteen: canteens[0]._id,
        name: 'Paneer Tikka Masala',
        description: 'Soft paneer pieces in aromatic tomato-cream sauce with rice',
        image: 'https://images.unsplash.com/photo-1618449767886-2d8a6e8d9b83?w=400',
        price: 200,
        cuisine: 'North Indian',
        category: 'lunch',
        isAvailable: true,
        preparationTime: 18,
        rating: 4.6,
        reviewCount: 52,
        ordersCount: 189,
        spiceLevel: 'medium',
        ingredients: ['Paneer', 'Tomato', 'Cream', 'Spices'],
        tags: ['new'],
        discount: 5
      },
      {
        canteen: canteens[0]._id,
        name: 'Sambar Rice',
        description: 'Warm basmati rice mixed with traditional sambar and vegetables',
        image: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=400',
        price: 100,
        cuisine: 'South Indian',
        category: 'lunch',
        isAvailable: true,
        preparationTime: 12,
        rating: 4.4,
        reviewCount: 65,
        ordersCount: 201,
        spiceLevel: 'spicy',
        ingredients: ['Rice', 'Dal', 'Vegetables', 'Spices'],
        tags: [],
        discount: 0
      },

      // North Campus Items
      {
        canteen: canteens[1]._id,
        name: 'Chole Bhature',
        description: 'Fluffy bhature with spiced chickpeas curry and mango pickle',
        image: 'https://images.unsplash.com/photo-1585937421612-70a19fb6930e?w=400',
        price: 150,
        cuisine: 'North Indian',
        category: 'lunch',
        isAvailable: true,
        preparationTime: 20,
        rating: 4.6,
        reviewCount: 89,
        ordersCount: 267,
        spiceLevel: 'medium',
        ingredients: ['Flour', 'Chickpeas', 'Yogurt', 'Spices'],
        tags: ['popular'],
        discount: 15
      },
      {
        canteen: canteens[1]._id,
        name: 'Garlic Naan Pizza',
        description: 'Crispy naan topped with mozzarella, vegetables, and herbs',
        image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400',
        price: 180,
        cuisine: 'Continental',
        category: 'lunch',
        isAvailable: true,
        preparationTime: 15,
        rating: 4.5,
        reviewCount: 42,
        ordersCount: 128,
        spiceLevel: 'mild',
        ingredients: ['Naan', 'Cheese', 'Vegetables', 'Garlic'],
        tags: ['trending'],
        discount: 0
      },

      // South Campus Items
      {
        canteen: canteens[2]._id,
        name: 'Idli Sambar',
        description: 'Fluffy steamed idlis with sambar and coconut chutney',
        image: 'https://images.unsplash.com/photo-1630383249896-424e7b2ea6d3?w=400',
        price: 80,
        cuisine: 'South Indian',
        category: 'breakfast',
        isAvailable: true,
        preparationTime: 10,
        rating: 4.7,
        reviewCount: 134,
        ordersCount: 456,
        spiceLevel: 'medium',
        ingredients: ['Rice', 'Dal', 'Vegetables'],
        tags: ['bestseller', 'popular'],
        discount: 0
      },
      {
        canteen: canteens[2]._id,
        name: 'Biryani Rice',
        description: 'Fragrant basmati rice cooked with spices and tender meat',
        image: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=400',
        price: 220,
        cuisine: 'South Indian',
        category: 'lunch',
        isAvailable: true,
        preparationTime: 25,
        rating: 4.8,
        reviewCount: 98,
        ordersCount: 289,
        spiceLevel: 'medium',
        ingredients: ['Basmati Rice', 'Meat', 'Yogurt', 'Spices'],
        tags: ['popular', 'bestseller'],
        discount: 10
      },

      // Quick Bites Items
      {
        canteen: canteens[3]._id,
        name: 'Veg Sandwich',
        description: 'Fresh vegetables with cheese and mayo on whole wheat bread',
        image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400',
        price: 80,
        cuisine: 'Fast Food',
        category: 'snacks',
        isAvailable: true,
        preparationTime: 8,
        rating: 4.3,
        reviewCount: 34,
        ordersCount: 178,
        spiceLevel: 'mild',
        ingredients: ['Bread', 'Vegetables', 'Cheese'],
        tags: [],
        discount: 0
      },
      {
        canteen: canteens[3]._id,
        name: 'Iced Tea',
        description: 'Refreshing chilled tea with lemon and mint',
        image: 'https://images.unsplash.com/photo-1599599810694-200c7a9ac8c2?w=400',
        price: 40,
        cuisine: 'Beverages',
        category: 'beverages',
        isAvailable: true,
        preparationTime: 5,
        rating: 4.4,
        reviewCount: 67,
        ordersCount: 312,
        spiceLevel: 'mild',
        ingredients: ['Tea', 'Lemon', 'Mint', 'Sugar'],
        tags: [],
        discount: 0
      },
      {
        canteen: canteens[3]._id,
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with whipped cream topping',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
        price: 100,
        cuisine: 'Desserts',
        category: 'desserts',
        isAvailable: true,
        preparationTime: 3,
        rating: 4.6,
        reviewCount: 89,
        ordersCount: 245,
        spiceLevel: 'mild',
        ingredients: ['Flour', 'Cocoa', 'Sugar', 'Eggs', 'Cream'],
        tags: ['popular'],
        discount: 5
      }
    ]);

    console.log(`✅ Created ${menuItems.length} menu items`);

    console.log('\n✅ Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - Canteens: ${canteens.length}`);
    console.log(`   - Menu Items: ${menuItems.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
