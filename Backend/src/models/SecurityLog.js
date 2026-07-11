import mongoose from 'mongoose';

const securityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      required: true,
      default: 'Unknown',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'security_logs',
  }
);

const SecurityLog = mongoose.model('SecurityLog', securityLogSchema);
export default SecurityLog;
