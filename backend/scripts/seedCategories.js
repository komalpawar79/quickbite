import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';

dotenv.config();

const categories = [
  { name: 'Breakfast', description: 'Morning meals', icon: '🌅', sortOrder: 1 },
  { name: 'Lunch', description: 'Afternoon meals', icon: '🍽️', sortOrder: 2 },
  { name: 'Snacks', description: 'Light bites', icon: '🍿', sortOrder: 3 },
  { name: 'Beverages', description: 'Drinks and refreshments', icon: '☕', sortOrder: 4 },
  { name: 'Desserts', description: 'Sweet treats', icon: '🍰', sortOrder: 5 },
  { name: 'Special', description: 'Chef specials', icon: '⭐', sortOrder: 6 }
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbite');
    console.log('✅ MongoDB connected');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('🗑️  Cleared existing categories');

    // Insert new categories
    const created = await Category.insertMany(categories);
    console.log(`✅ Created ${created.length} categories:`);
    
    created.forEach((cat, i) => {
      console.log(`   ${i + 1}. ${cat.icon} ${cat.name} (ID: ${cat._id})`);
    });

    console.log('\n✅ Category seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedCategories();
