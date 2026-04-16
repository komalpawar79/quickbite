import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    canteen: { type: mongoose.Schema.Types.ObjectId, ref: 'Canteen', required: true },
    items: [
      {
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
        quantity: Number,
        price: Number,
        specialInstructions: String
      }
    ],
    orderMode: {
      type: String,
      enum: ['dine-in', 'takeaway', 'delivery'],
      required: true
    },
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentMethod: { 
      type: String, 
      enum: ['card', 'upi', 'wallet', 'cash', 'razorpay'],
      required: true 
    },
    estimatedTime: Number,
    actualTime: Number,
    tableNumber: String,
    userPhone: String,
    deliveryAddress: String,
    feedback: {
      rating: Number,
      comment: String,
      submittedAt: Date
    },
    deliveryAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    specialRequests: String,
    qrCode: String
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
