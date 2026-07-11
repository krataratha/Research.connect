import mongoose from 'mongoose';

const scholarPublicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Scholar publication must belong to a user'],
      index: true,
    },
    scholarId: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    authors: {
      type: [String],
      default: [],
    },
    year: {
      type: Number,
    },
    journal: {
      type: String,
      trim: true,
      default: '',
    },
    conference: {
      type: String,
      trim: true,
      default: '',
    },
    publisher: {
      type: String,
      trim: true,
      default: '',
    },
    citationCount: {
      type: Number,
      default: 0,
    },
    doi: {
      type: String,
      trim: true,
      default: '',
    },
    pdfUrl: {
      type: String,
      trim: true,
      default: '',
    },
    researchArea: {
      type: String,
      trim: true,
      default: '',
    },
    keywords: {
      type: [String],
      default: [],
    },
    abstract: {
      type: String,
      trim: true,
      default: '',
    },
    thumbnail: {
      type: String,
      trim: true,
      default: '',
    },
    scholarUrl: {
      type: String,
      trim: true,
      default: '',
    },
    hashSignature: {
      type: String,
      required: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'googleScholarPublications',
  }
);

// Compound index to ensure uniqueness of a publication signature per user
scholarPublicationSchema.index({ user: 1, hashSignature: 1 }, { unique: true });

// Soft delete query middleware
scholarPublicationSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

const ScholarPublication = mongoose.model('ScholarPublication', scholarPublicationSchema);
export default ScholarPublication;
