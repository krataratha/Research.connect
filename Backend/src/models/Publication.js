import mongoose from 'mongoose';
import './PublicationAuthor.js';
import './PublicationKeyword.js';
import './PublicationResearchArea.js';
import fieldMetadataSchema from './fieldMetadataSchema.js';

const publicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Publication must be created by a user'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Publication must have a title'],
      trim: true,
      unique: true, // Duplicate prevention on titles
      index: true,
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
    },
    abstract: {
      type: String,
      required: [true, 'Publication must have an abstract'],
      trim: true,
    },
    doi: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple nulls/undefineds
      trim: true,
      index: true,
    },
    publisher: {
      type: String,
      trim: true,
      default: '',
    },
    journal: {
      type: String,
      trim: true,
      default: '',
    },
    publicationDate: {
      type: Date,
      default: Date.now,
    },
    fileUrl: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    conference: {
      type: String,
      trim: true,
      default: '',
    },
    publicationYear: {
      type: Number,
      required: [true, 'Publication year is required'],
      index: true,
    },
    publicationType: {
      type: String,
      required: [true, 'Publication type is required'],
      index: true,
    },
    language: {
      type: String,
      trim: true,
      default: 'English',
    },
    country: {
      type: String,
      trim: true,
      default: '',
    },
    fundingInfo: {
      type: String,
      trim: true,
      default: '',
    },
    grantNumber: {
      type: String,
      trim: true,
      default: '',
    },
    license: {
      type: String,
      trim: true,
      default: 'CC-BY-4.0',
    },
    version: {
      type: Number,
      default: 1,
    },
    commentsEnabled: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
      index: true,
    },
    specificFields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    relatedPublications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Publication',
      },
    ],
    references: {
      type: [String],
      default: [],
    },
    citationCount: {
      type: Number,
      default: 0,
      min: [0, 'Citation count cannot be negative'],
      index: true,
    },
    pdfUrl: {
      type: String,
      trim: true,
      default: '',
    },
    thumbnail: {
      type: String,
      trim: true,
      default: '',
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'restricted'],
      default: 'public',
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    volume: {
      type: String,
      default: '',
    },
    issue: {
      type: String,
      default: '',
    },
    pages: {
      type: String,
      default: '',
    },
    publicationUrl: {
      type: String,
      default: '',
    },
    fieldMetadata: {
      type: Map,
      of: fieldMetadataSchema,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
// Compound index for user publication years (for rapid retrieval of author CV timelines)
publicationSchema.index({ user: 1, publicationYear: -1 });
// Compound index for status and deletion
publicationSchema.index({ status: 1, isDeleted: 1 });
// Text index for global search
publicationSchema.index({ title: 'text', abstract: 'text' });

// Virtual populates
publicationSchema.virtual('authors', {
  ref: 'PublicationAuthor',
  foreignField: 'publication',
  localField: '_id',
});

publicationSchema.virtual('keywords', {
  ref: 'PublicationKeyword',
  foreignField: 'publication',
  localField: '_id',
});

publicationSchema.virtual('researchAreas', {
  ref: 'PublicationResearchArea',
  foreignField: 'publication',
  localField: '_id',
});

// Soft delete query middleware
publicationSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// Helper function to trigger metrics recalculation for all registered authors
const triggerAuthorsMetricsUpdate = async function (pubId) {
  try {
    const PublicationAuthor = mongoose.model('PublicationAuthor');
    const Profile = mongoose.model('Profile');

    const authors = await PublicationAuthor.find({ publication: pubId, user: { $exists: true, $ne: null } }).select('user');
    for (const author of authors) {
      await Profile.recalculateMetrics(author.user);
    }
  } catch (err) {
    console.error(`Failed to update author metrics for publication ${pubId}: ${err.message}`);
  }
};

// Post-save hook to update author profiles when publications/citations change
publicationSchema.post('save', async function (doc) {
  await triggerAuthorsMetricsUpdate(doc._id);
});

// Post-remove/delete hook
publicationSchema.post('remove', async function (doc) {
  await triggerAuthorsMetricsUpdate(doc._id);
});

const Publication = mongoose.model('Publication', publicationSchema);
export default Publication;
