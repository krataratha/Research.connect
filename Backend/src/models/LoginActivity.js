import mongoose from 'mongoose';

const loginActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    browser: {
      type: String,
      required: true,
      default: 'Unknown Browser',
    },
    os: {
      type: String,
      required: true,
      default: 'Unknown OS',
    },
    ipAddress: {
      type: String,
      required: true,
      default: '127.0.0.1',
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'login_activities',
  }
);

const LoginActivity = mongoose.model('LoginActivity', loginActivitySchema);
export default LoginActivity;
