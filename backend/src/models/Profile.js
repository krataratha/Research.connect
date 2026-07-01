const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: ''
    },
    country: {
      type: String,
      trim: true,
      default: ''
    },
    institution: {
      type: String,
      trim: true,
      default: ''
    },
    department: {
      type: String,
      trim: true,
      default: ''
    },
    designation: {
      type: String,
      trim: true,
      default: ''
    },
    company: {
      type: String,
      trim: true,
      default: ''
    },
    division: {
      type: String,
      trim: true,
      default: ''
    },
    position: {
      type: String,
      trim: true,
      default: ''
    },
    socialLinks: {
      orcid: { type: String, default: '', trim: true },
      googleScholar: { type: String, default: '', trim: true },
      researchGate: { type: String, default: '', trim: true },
      linkedin: { type: String, default: '', trim: true },
      website: { type: String, default: '', trim: true }
    },
    profileCompletion: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for searching specialists/universities
ProfileSchema.index({ institution: 1 });
ProfileSchema.index({ company: 1 });
ProfileSchema.index({ isDeleted: 1 });

const Profile = mongoose.model('Profile', ProfileSchema);

module.exports = Profile;
