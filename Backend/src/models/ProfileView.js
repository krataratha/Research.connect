import mongoose from 'mongoose';

const profileViewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Profile owner is required'],
      index: true,
    },
    viewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    browser: {
      type: String,
      default: '',
    },
    device: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'profileViews',
  }
);

// Index to track monthly/daily profile views quickly
profileViewSchema.index({ user: 1, timestamp: -1 });

const ProfileView = mongoose.model('ProfileView', profileViewSchema);
export default ProfileView;
