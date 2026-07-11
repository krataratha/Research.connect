import mongoose from 'mongoose';

const publicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Publication must belong to a user'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Publication title is required'],
      trim: true,
      index: true,
    },
    authors: [
      {
        name: { type: String, required: true },
        authorName: { type: String, default: '' },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        authorOrder: { type: Number, default: 1 },
      }
    ],
    abstract: {
      type: String,
      required: [true, 'Publication abstract is required'],
      trim: true,
    },
    keywords: {
      type: [String],
      default: [],
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
    doi: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    googleScholarLink: {
      type: String,
      trim: true,
      default: '',
    },
    pdfLink: {
      type: String,
      trim: true,
      default: '',
    },
    researchArea: {
      type: String,
      trim: true,
      default: '',
    },
    volume: {
      type: String,
      trim: true,
      default: '',
    },
    issue: {
      type: String,
      trim: true,
      default: '',
    },
    pages: {
      type: String,
      trim: true,
      default: '',
    },
    publicationDate: {
      type: Date,
      default: Date.now,
    },
    publicationType: {
      type: String,
      required: [true, 'Publication type is required'], // Article, Conference Paper, Book, Thesis, etc.
      index: true,
    },
    citationCount: {
      type: Number,
      default: 0,
      index: true,
    },
    visibility: {
      type: String,
      enum: ['Public', 'Private', 'Restricted'],
      default: 'Public',
      index: true,
    },
    license: {
      type: String,
      trim: true,
      default: 'CC-BY-4.0',
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived', 'Private', 'Public'],
      default: 'Published',
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    }
  },
  {
    timestamps: true,
    collection: 'publications',
  }
);

// Pre-save hook to synchronize name and authorName
publicationSchema.pre('save', function (next) {
  if (this.authors && this.authors.length > 0) {
    this.authors.forEach(author => {
      if (author.name && !author.authorName) {
        author.authorName = author.name;
      } else if (author.authorName && !author.name) {
        author.name = author.authorName;
      }
    });
  }
  next();
});

// Soft delete query middleware
publicationSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

const Publication = mongoose.model('Publication', publicationSchema);
export default Publication;
