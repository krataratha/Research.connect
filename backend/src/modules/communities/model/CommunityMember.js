const mongoose = require('mongoose');

const communityMemberSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: ['Owner', 'Administrator', 'Moderator', 'Researcher', 'Student', 'Guest'],
      default: 'Researcher'
    },
    status: {
      type: String,
      enum: ['Active', 'PendingApproval', 'Banned'],
      default: 'Active',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Enforce unique member per community
communityMemberSchema.index({ communityId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('CommunityMember', communityMemberSchema);
