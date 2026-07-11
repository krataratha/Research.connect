import mongoose from 'mongoose';

const publicationDownloadSchema = new mongoose.Schema(
  {
    publication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Publication',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null means guest download
      index: true,
    },
    ip: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: 'Unknown',
      index: true,
    },
    institution: {
      type: String,
      default: 'Unknown',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const PublicationDownload = mongoose.model('PublicationDownload', publicationDownloadSchema);
export default PublicationDownload;
