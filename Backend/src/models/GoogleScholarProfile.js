import mongoose from 'mongoose';

const googleScholarProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Scholar profile must belong to a user'],
      unique: true,
      index: true,
    },
    scholarId: {
      type: String,
      required: [true, 'Scholar ID is required'],
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    affiliation: {
      type: String,
      trim: true,
    },
    verifiedEmail: {
      type: String,
      trim: true,
    },
    interests: {
      type: [String],
      default: [],
    },
    photo: {
      type: String,
      default: '',
    },
    totalCitations: {
      type: Number,
      default: 0,
    },
    citationsSinceRecentYears: {
      type: Number,
      default: 0,
    },
    hIndex: {
      type: Number,
      default: 0,
    },
    hIndexSinceRecentYears: {
      type: Number,
      default: 0,
    },
    i10Index: {
      type: Number,
      default: 0,
    },
    i10IndexSinceRecentYears: {
      type: Number,
      default: 0,
    },
    publicationsCount: {
      type: Number,
      default: 0,
    },
    scholarProfileUrl: {
      type: String,
      trim: true,
      default: '',
    },
    lastSync: {
      type: Date,
      default: Date.now,
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    selectedFields: {
      type: [String],
      default: ['displayName', 'institution', 'department', 'profilePhoto', 'bio', 'website'],
    },
  },
  {
    timestamps: true,
    collection: 'googleScholarProfiles',
  }
);

const GoogleScholarProfile = mongoose.model('GoogleScholarProfile', googleScholarProfileSchema);
export default GoogleScholarProfile;
