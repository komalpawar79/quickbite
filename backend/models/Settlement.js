import mongoose from 'mongoose';

const settlementSchema = new mongoose.Schema({
  canteen: { type: mongoose.Schema.Types.ObjectId, ref: 'Canteen', required: true },
  amount: { type: Number, required: true },
  period: { start: Date, end: Date },
  status: { type: String, enum: ['pending', 'approved', 'paid'], default: 'pending' },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paidAt: Date,
  paymentReference: String
}, { timestamps: true });

export default mongoose.model('Settlement', settlementSchema);
