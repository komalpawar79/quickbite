import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Notification type: order, payment, cancel, alert
  type: { 
    type: String, 
    enum: ['order', 'payment', 'cancel', 'alert'], 
    required: true,
    index: true
  },
  
  // Notification message
  message: { 
    type: String, 
    required: true 
  },
  
  // Related document ID (Order, Transaction, etc.)
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'refModel'
  },
  
  // Reference model name
  refModel: {
    type: String,
    enum: ['Order', 'Transaction', 'User'],
    default: 'Order'
  },
  
  // Read status
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Legacy fields for email/SMS (kept for backward compatibility)
  recipients: [String],
  subject: String,
  template: String,
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'failed'], 
    default: 'pending' 
  },
  sentBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  sentAt: Date,
  errorMessage: String
}, { timestamps: true });

// Indexes for efficient queries
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
