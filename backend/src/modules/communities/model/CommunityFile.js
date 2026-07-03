const mongoose = require('mongoose');

const communityFileSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
      index: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileType: {
      type: String
    },
    url: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('CommunityFile', communityFileSchema);
