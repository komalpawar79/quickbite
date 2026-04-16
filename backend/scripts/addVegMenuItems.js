import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Canteen from '../models/Canteen.js';
import MenuItem from '../models/MenuItem.js';

dotenv.config();

const vegMenuItems = [
  {
    name: 'Paneer Tikka',
    description: 'Marinated paneer cubes grilled to perfection with spices',
    price: 150,
    category: 'snacks',
    rating: 4.6,
    ordersCount: 320,
    ingredients: ['paneer', 'yogurt', 'spices', 'bell peppers'],
    tags: ['popular', 'protein-rich', 'grilled'],
    discount: 10,
    isAvailable: true
  },
  {
    name: 'Vegetable Biryani',
    description: 'Fragrant basmati rice cooked with mixed vegetables and aromatic spices',
    price: 200,
    category: 'lunch',
    rating: 4.5,
    ordersCount: 450,
    ingredients: ['basmati rice', 'vegetables', 'cardamom', 'bay leaves'],
    tags: ['rice-based', 'aromatic', 'filling'],
    discount: 8,
    isAvailable: true
  },
  {
    name: 'Chana Masala',
    description: 'Chickpeas cooked in rich tomato-based curry with traditional spices',
    price: 120,
    category: 'lunch',
    rating: 4.4,
    ordersCount: 380,
    ingredients: ['chickpeas', 'tomatoes', 'onions', 'spices'],
    tags: ['protein-rich', 'economical', 'traditional'],
    discount: 5,
    isAvailable: true
  },
  {
    name: 'Palak Paneer',
    description: 'Creamy spinach gravy with soft paneer cubes',
    price: 180,
    category: 'special',
    rating: 4.7,
    ordersCount: 520,
    ingredients: ['spinach', 'paneer', 'cream', 'spices'],
    tags: ['creamy', 'healthy', 'iron-rich'],
    discount: 12,
    isAvailable: true
  },
  {
    name: 'Aloo Gobi',
    description: 'Dry curry of potatoes and cauliflower with aromatic spices',
    price: 100,
    category: 'lunch',
    rating: 4.3,
    ordersCount: 290,
    ingredients: ['potatoes', 'cauliflower', 'turmeric', 'cumin'],
    tags: ['dry-curry', 'budget-friendly', 'comfort-food'],
    discount: 0,
    isAvailable: true
  },
  {
    name: 'Vegetable Samosa',
    description: 'Crispy triangular pastry filled with spiced potatoes and peas',
    price: 40,
    category: 'snacks',
    rating: 4.5,
    ordersCount: 680,
    ingredients: ['refined flour', 'potatoes', 'peas', 'spices'],
    tags: ['snack', 'crispy', 'tea-time'],
    discount: 0,
    isAvailable: true
  },
  {
    name: 'Vegetable Fried Rice',
    description: 'Fragrant rice stir-fried with assorted vegetables and soy sauce',
    price: 130,
    category: 'lunch',
    rating: 4.4,
    ordersCount: 410,
    ingredients: ['rice', 'mixed vegetables', 'soy sauce', 'garlic'],
    tags: ['fried-rice', 'quick', 'indo-chinese'],
    discount: 7,
    isAvailable: true
  }
];

const addMenuItemsToCanteens = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbite');
    console.log('MongoDB connected...');

    // Get all canteens
    const canteens = await Canteen.find({});
    console.log(`Found ${canteens.length} canteens\n`);

    if (canteens.length === 0) {
      console.log('❌ No canteens found. Run seedDatabase.js first.');
      process.exit(1);
    }

    let totalItemsAdded = 0;

    // Add menu items to each canteen
    for (const canteen of canteens) {
      console.log(`📍 Adding items to: ${canteen.name}`);
      
      const itemsToAdd = vegMenuItems.map(item => ({
        ...item,
        canteen: canteen._id
      }));

      const createdItems = await MenuItem.insertMany(itemsToAdd);
      console.log(`   ✅ Added ${createdItems.length} veg items\n`);
      totalItemsAdded += createdItems.length;
    }

    console.log(`\n✨ Successfully added ${totalItemsAdded} total menu items!`);
    console.log(`📊 Each canteen now has ${vegMenuItems.length} veg items`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

addMenuItemsToCanteens();
