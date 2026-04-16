import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAdded: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    transactions: [
      {
        type: {  // Field name: type of transaction
          type: String,  // Mongoose type declaration
          enum: ['credit', 'debit'],
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        description: String,
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Order',
        },
        transactionId: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Wallet', walletSchema);
