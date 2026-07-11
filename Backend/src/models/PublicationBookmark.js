import mongoose from 'mongoose';

const publicationBookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    publication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Publication',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user can only bookmark a publication once
publicationBookmarkSchema.index({ user: 1, publication: 1 }, { unique: true });

const PublicationBookmark = mongoose.model('PublicationBookmark', publicationBookmarkSchema);
export default PublicationBookmark;
