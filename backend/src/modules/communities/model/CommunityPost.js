const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
      index: true
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    postType: {
      type: String,
      enum: [
        'Text',
        'Publication',
        'Dataset',
        'Research Question',
        'Announcement',
        'Conference',
        'Funding Opportunity',
        'Job',
        'Image',
        'Video',
        'File',
        'Poll',
        'Event',
        'Patent',
        'Project'
      ],
      default: 'Text'
    },
    title: {
      type: String,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    attachments: [
      {
        type: String
      }
    ],
    sharedPublicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Publication',
      index: true
    },
    sharedDatasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dataset',
      index: true
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('CommunityPost', communityPostSchema);
