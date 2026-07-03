const mongoose = require('mongoose');

const communityJobSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
      index: true
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    jobType: {
      type: String,
      enum: ['PhD', 'Postdoc', 'Internship', 'Faculty', 'Research Assistant', 'Other'],
      default: 'Research Assistant'
    },
    institution: {
      type: String
    },
    location: {
      type: String
    },
    applicationDeadline: {
      type: Date
    },
    applyUrl: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('CommunityJob', communityJobSchema);
