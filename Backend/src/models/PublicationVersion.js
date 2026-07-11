import mongoose from 'mongoose';

const publicationVersionSchema = new mongoose.Schema(
  {
    publication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Publication',
      required: [true, 'Version must belong to a publication'],
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    changeSummary: {
      type: String,
      trim: true,
      default: '',
    },
    metadataSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of version number per publication
publicationVersionSchema.index({ publication: 1, versionNumber: 1 }, { unique: true });

const PublicationVersion = mongoose.model('PublicationVersion', publicationVersionSchema);
export default PublicationVersion;
