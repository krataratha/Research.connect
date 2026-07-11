import mongoose from 'mongoose';

const publicationCommentSchema = new mongoose.Schema(
  {
    publication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Publication',
      required: [true, 'Comment must belong to a publication'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment must belong to a user'],
    },
    commentText: {
      type: String,
      required: [true, 'Comment text cannot be empty'],
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PublicationComment',
      default: null, // Null means it's a top-level comment
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const PublicationComment = mongoose.model('PublicationComment', publicationCommentSchema);
export default PublicationComment;
