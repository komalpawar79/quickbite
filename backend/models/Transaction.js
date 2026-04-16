import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  type: { type: String, enum: ['order', 'wallet_recharge', 'refund', 'withdrawal'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paymentMethod: { type: String, enum: ['card', 'upi', 'wallet', 'cash', 'razorpay', 'stripe'] },
  paymentGatewayId: String,
  paymentGatewayResponse: mongoose.Schema.Types.Mixed,
  description: String,
  canteen: { type: mongoose.Schema.Types.ObjectId, ref: 'Canteen' }
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
