import mongoose from 'mongoose';

const googleScholarCoAuthorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Co-author record must belong to a user'],
      index: true,
    },
    scholarId: {
      type: String,
      required: [true, 'Co-author Scholar ID is required'],
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Co-author name is required'],
      trim: true,
    },
    affiliation: {
      type: String,
      trim: true,
      default: '',
    },
    thumbnail: {
      type: String,
      trim: true,
      default: '',
    },
    link: {
      type: String,
      trim: true,
      default: '',
    },
    collaborationCount: {
      type: Number,
      default: 1,
    },
    sharedPublications: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'co_authors',
  }
);

// Compound index to ensure uniqueness of a co-author per user
googleScholarCoAuthorSchema.index({ user: 1, scholarId: 1 }, { unique: true });

const GoogleScholarCoAuthor = mongoose.model('GoogleScholarCoAuthor', googleScholarCoAuthorSchema);
export default GoogleScholarCoAuthor;
