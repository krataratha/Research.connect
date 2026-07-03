const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      index: true
    },
    description: {
      type: String
    },
    researchArea: {
      type: String
    },
    keywords: [
      {
        type: String
      }
    ],
    logo: {
      type: String
    },
    banner: {
      type: String
    },
    visibility: {
      type: String,
      enum: ['Public', 'Private', 'Invite Only', 'Institution'],
      default: 'Public'
    },
    category: {
      type: String
    },
    institution: {
      type: String
    },
    country: {
      type: String
    },
    website: {
      type: String
    },
    email: {
      type: String
    },
    rules: [
      {
        type: String
      }
    ],
    tags: [
      {
        type: String
      }
    ],
    maxMembers: {
      type: Number
    },
    joinApproval: {
      type: Boolean,
      default: false
    },
    allowPublicationSharing: {
      type: Boolean,
      default: true
    },
    allowDatasetSharing: {
      type: Boolean,
      default: true
    },
    allowEvents: {
      type: Boolean,
      default: true
    },
    allowJobs: {
      type: Boolean,
      default: true
    },
    allowDiscussions: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to generate slug
communitySchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

module.exports = mongoose.model('Community', communitySchema);
