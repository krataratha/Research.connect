const mongoose = require('mongoose');

const communityEventSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
      index: true
    },
    createdBy: {
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
      type: String
    },
    eventType: {
      type: String,
      enum: ['Conference', 'Workshop', 'Seminar', 'Meeting', 'Webinar', 'Deadline'],
      default: 'Webinar'
    },
    eventDate: {
      type: Date,
      index: true
    },
    eventTime: {
      type: String
    },
    location: {
      type: String
    },
    eventLink: {
      type: String
    },
    participants: [
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

module.exports = mongoose.model('CommunityEvent', communityEventSchema);
