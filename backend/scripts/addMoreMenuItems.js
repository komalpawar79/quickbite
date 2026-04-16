import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Canteen from '../models/Canteen.js';
import MenuItem from '../models/MenuItem.js';

dotenv.config();

const vegItemsWithImages = [
  {
    name: 'Masala Dosa',
    description: 'Crispy rice crepe filled with spiced potato and served with sambar and chutney',
    price: 120,
    category: 'breakfast',
    rating: 4.6,
    ordersCount: 520,
    ingredients: ['rice', 'lentils', 'potato', 'spices'],
    tags: ['popular', 'breakfast', 'crispy'],
    discount: 10,
    image: 'https://images.unsplash.com/https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D-1585238341710-4913dfb1d08b?w=500&h=400&fit=crop',
    isAvailable: true
  },
  {
    name: 'Idli Sambar',
    description: 'Fluffy steamed rice cakes with lentil stew and coconut chutney',
    price: 80,
    category: 'breakfast',
    rating: 4.5,
    ordersCount: 480,
    ingredients: ['rice', 'lentils', 'vegetables', 'spices'],
    tags: ['healthy', 'light', 'breakfast'],
    discount: 0,
    image: 'https://images.unsplash.com/photo-1568124476456-bc4df5518237?w=500&h=400&fit=crop',
    isAvailable: true
  },
  {
    name: 'Chole Bhature',
    description: 'Fluffy fried bread served with spiced chickpea curry',
    price: 140,
    category: 'lunch',
    rating: 4.4,
    ordersCount: 380,
    ingredients: ['flour', 'chickpeas', 'yogurt', 'spices'],
    tags: ['north-indian', 'filling', 'popular'],
    discount: 5,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc687?w=500&h=400&fit=crop',
    isAvailable: true
  },
  {
    name: 'Paneer Butter Masala',
    description: 'Soft paneer cubes in creamy tomato-based gravy with aromatic spices',
    price: 200,
    category: 'special',
    rating: 4.7,
    ordersCount: 620,
    ingredients: ['paneer', 'tomato', 'cream', 'butter', 'spices'],
    tags: ['creamy', 'restaurant-style', 'premium'],
    discount: 12,
    image: 'https://images.unsplash.com/photo-1601050690597-df0288c3b9c6?w=500&h=400&fit=crop',
    isAvailable: true
  },
  {
    name: 'Vegetable Biryani',
    description: 'Fragrant basmati rice layered with mixed vegetables and spices',
    price: 180,
    category: 'lunch',
    rating: 4.6,
    ordersCount: 510,
    ingredients: ['basmati rice', 'vegetables', 'cardamom', 'bay leaves'],
    tags: ['rice-based', 'aromatic', 'complete-meal'],
    discount: 8,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a104?w=500&h=400&fit=crop',
    isAvailable: true
  },
  {
    name: 'Aloo Paratha',
    description: 'Soft Indian flatbread stuffed with spiced mashed potatoes',
    price: 100,
    category: 'breakfast',
    rating: 4.5,
    ordersCount: 440,
    ingredients: ['wheat flour', 'potato', 'onion', 'spices'],
    tags: ['indian-bread', 'filling', 'comfort-food'],
    discount: 0,
    image: 'https://images.unsplash.com/photo-1601050690597-df0288c3b9c6?w=500&h=400&fit=crop',
    isAvailable: true
  },
  {
    name: 'Vegetable Momos',
    description: 'Steamed dumplings filled with finely chopped vegetables and spices',
    price: 90,
    category: 'snacks',
    rating: 4.4,
    ordersCount: 350,
    ingredients: ['flour', 'cabbage', 'carrot', 'spices'],
    tags: ['steamed', 'tibetan', 'healthy'],
    discount: 5,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc687?w=500&h=400&fit=crop',
    isAvailable: true
  },
  {
    name: 'Vegetable Spring Roll',
    description: 'Crispy fried rolls filled with mixed vegetables and served with sweet chili sauce',
    price: 70,
    category: 'snacks',
    rating: 4.3,
    ordersCount: 290,
    ingredients: ['rice paper', 'vegetables', 'tofu'],
    tags: ['crispy', 'indo-chinese', 'snack'],
    discount: 0,
    image: 'https://images.unsplash.com/photo-1585238341710-4913dfb1d08b?w=500&h=400&fit=crop',
    isAvailable: true
  }
];

const addMoreMenuItems = async () => {
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
      console.log(`📍 Adding ${vegItemsWithImages.length} items to: ${canteen.name}`);
      
      const itemsToAdd = vegItemsWithImages.map(item => ({
        ...item,
        canteen: canteen._id
      }));

      const createdItems = await MenuItem.insertMany(itemsToAdd);
      console.log(`   ✅ Added ${createdItems.length} items with images\n`);
      totalItemsAdded += createdItems.length;
    }

    console.log(`\n✨ Successfully added ${totalItemsAdded} total menu items!`);
    console.log(`📊 Each canteen now has ${vegItemsWithImages.length} new items with images`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

addMoreMenuItems();
