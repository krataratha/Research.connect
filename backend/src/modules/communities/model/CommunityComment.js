const mongoose = require('mongoose');

const communityCommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityPost',
      required: true,
      index: true
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    content: {
      type: String,
      required: true
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityComment',
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('CommunityComment', communityCommentSchema);
