const mongoose = require('mongoose');

const communityInvitationSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
      index: true
    },
    invitedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    invitedEmail: {
      type: String,
      trim: true,
      lowercase: true,
      index: true
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate pending invites
communityInvitationSchema.index(
  { communityId: 1, invitedEmail: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'Pending' } }
);

module.exports = mongoose.model('CommunityInvitation', communityInvitationSchema);
