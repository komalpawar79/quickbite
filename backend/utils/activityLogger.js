/**
 * Activity Logger Service
 * Logs all important user actions to database
 */

import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', etc.
    entity: { type: String, required: true }, // 'Order', 'Menu', 'User', 'Payment', etc.
    entityId: mongoose.Schema.Types.ObjectId,
    details: mongoose.Schema.Types.Mixed, // Specific data about the action
    ipAddress: String,
    userAgent: String,
    status: { type: String, enum: ['success', 'failure', 'warning'], default: 'success' },
    errorMessage: String,
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: false }
);

// Create indexes for better query performance
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ entity: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

/**
 * Log Activity Function
 */
export const logActivity = async (activityData) => {
  try {
    const activity = new ActivityLog(activityData);
    await activity.save();
    return activity;
  } catch (error) {
    console.error('[ActivityLog Error]', error);
    // Don't throw - logging failure shouldn't break main operation
  }
};

/**
 * Get Activity Logs
 */
export const getActivityLogs = async (filters = {}, pagination = {}) => {
  try {
    const { skip = 0, limit = 20 } = pagination;
    
    const logs = await ActivityLog
      .find(filters)
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ActivityLog.countDocuments(filters);

    return { logs, total };
  } catch (error) {
    throw new Error(`Failed to retrieve activity logs: ${error.message}`);
  }
};

/**
 * Export Activity Logs
 */
export const exportActivityLogs = async (filters = {}) => {
  try {
    const logs = await ActivityLog
      .find(filters)
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 })
      .lean();

    return logs;
  } catch (error) {
    throw new Error(`Failed to export activity logs: ${error.message}`);
  }
};
