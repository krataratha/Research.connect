import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deviceId: {
      type: String,
      required: true,
      index: true,
    },
    deviceName: {
      type: String,
      required: true,
      default: 'Unknown Device',
    },
    browser: {
      type: String,
      required: true,
      default: 'Unknown Browser',
    },
    operatingSystem: {
      type: String,
      required: true,
      default: 'Unknown OS',
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
    isTrusted: {
      type: Boolean,
      default: false,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'user_sessions',
  }
);

// Compound index to quickly find user device sessions
sessionSchema.index({ userId: 1, deviceId: 1 });

const Session = mongoose.model('Session', sessionSchema);
export default Session;
