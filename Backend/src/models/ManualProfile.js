import mongoose from 'mongoose';

const manualProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Manual profile must belong to a user'],
      unique: true,
      index: true,
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    displayName: {
      type: String,
      trim: true,
      default: '',
    },
    headline: {
      type: String,
      trim: true,
      default: '',
    },
    designation: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    institution: {
      type: String,
      trim: true,
      default: '',
    },
    country: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    coverPhoto: {
      type: String,
      default: '',
    },
    socialLinks: {
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      github: { type: String, default: '' },
      researchgate: { type: String, default: '' },
      orcid: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
    collection: 'manualProfile',
  }
);

const ManualProfile = mongoose.model('ManualProfile', manualProfileSchema);
export default ManualProfile;
