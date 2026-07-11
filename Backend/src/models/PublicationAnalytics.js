import mongoose from 'mongoose';

const publicationAnalyticsSchema = new mongoose.Schema(
  {
    publication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Publication',
      required: [true, 'Analytics must belong to a publication'],
      unique: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    bookmarks: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    citations: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const PublicationAnalytics = mongoose.model('PublicationAnalytics', publicationAnalyticsSchema);
export default PublicationAnalytics;
