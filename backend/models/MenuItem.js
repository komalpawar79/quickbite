import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    canteen: { type: mongoose.Schema.Types.ObjectId, ref: 'Canteen', required: true },
    name: { type: String, required: true },
    description: String,
    image: String,
    price: { type: Number, required: true },
    cuisine: String,
    category: { 
      type: String, 
      enum: ['breakfast', 'lunch', 'snacks', 'beverages', 'desserts', 'special'],
      required: true 
    },
    isAvailable: { type: Boolean, default: true },
    preparationTime: Number, // in minutes
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    ordersCount: { type: Number, default: 0 },
    spiceLevel: { type: String, enum: ['mild', 'medium', 'spicy'], default: 'medium' },
    ingredients: [String],
    tags: [String], // e.g., ['popular', 'trending', 'new']
    discount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('MenuItem', menuItemSchema);
