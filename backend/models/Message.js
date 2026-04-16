import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: String,
    subject: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied'],
      default: 'new'
    },
    isStarred: {
      type: Boolean,
      default: false
    },
    reply: String,
    repliedAt: Date,
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);
