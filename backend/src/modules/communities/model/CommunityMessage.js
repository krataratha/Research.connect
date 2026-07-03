const mongoose = require('mongoose');

const communityMessageSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    text: {
      type: String,
      required: true
    },
    attachments: [
      {
        type: String
      }
    ],
    pinned: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

communityMessageSchema.index({ communityId: 1, createdAt: -1 });

module.exports = mongoose.model('CommunityMessage', communityMessageSchema);
