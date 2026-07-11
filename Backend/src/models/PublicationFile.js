import mongoose from 'mongoose';

const publicationFileSchema = new mongoose.Schema(
  {
    publication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Publication',
      required: [true, 'File must belong to a publication'],
      index: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: ['PDF', 'Cover Image', 'Dataset', 'Presentation', 'Code ZIP', 'Supplementary Files'],
    },
    url: {
      type: String,
      required: [true, 'File URL is required'],
    },
    publicId: {
      type: String,
      default: '', // Cloudinary public ID
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number, // in bytes
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PublicationFile = mongoose.model('PublicationFile', publicationFileSchema);
export default PublicationFile;
