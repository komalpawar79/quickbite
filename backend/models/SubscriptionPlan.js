import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema(
  {
    canteen: { type: mongoose.Schema.Types.ObjectId, ref: 'Canteen', required: true },
    name: { type: String, required: true },
    description: String,
    duration: { 
      type: String, 
      enum: ['weekly', 'monthly'], 
      required: true 
    },
    price: { type: Number, required: true },
    mealsPerWeek: { type: Number, required: true },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
    discountPercentage: { type: Number, default: 10 },
    image: String,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
