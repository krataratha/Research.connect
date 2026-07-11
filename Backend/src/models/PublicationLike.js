import mongoose from 'mongoose';

const publicationLikeSchema = new mongoose.Schema(
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

// Compound index to ensure a user can only like a publication once
publicationLikeSchema.index({ user: 1, publication: 1 }, { unique: true });

const PublicationLike = mongoose.model('PublicationLike', publicationLikeSchema);
export default PublicationLike;
