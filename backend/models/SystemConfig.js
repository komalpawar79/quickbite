import mongoose from 'mongoose';

const systemConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed,
  category: { type: String, enum: ['payment', 'email', 'sms', 'redis', 'cdn', 'security', 'general'] },
  description: String,
  isEncrypted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('SystemConfig', systemConfigSchema);
