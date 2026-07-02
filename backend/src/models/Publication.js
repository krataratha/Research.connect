const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PublicationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    subtitle: {
      type: String,
      default: ''
    },
    authors: {
      type: String,
      default: ''
    },
    researchType: {
      type: String,
      default: ''
    },
    correspondingAuthor: {
      type: String,
      default: ''
    },
    institution: {
      type: String,
      default: ''
    },
    department: {
      type: String,
      default: ''
    },
    publicationDate: {
      type: Date
    },
    isbn: {
      type: String,
      default: ''
    },
    issn: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: ''
    },
    researchAreas: [
      {
        type: String,
        trim: true
      }
    ],
    visibility: {
      type: String,
      enum: ['Draft', 'Private', 'Institution Only', 'Public'],
      default: 'Public'
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published'
    },
    cloudinaryFileUrl: {
      type: String,
      default: ''
    },
    fileDetails: {
      secure_url: { type: String, default: '' },
      public_id: { type: String, default: '' },
      resource_type: { type: String, default: '' },
      bytes: { type: Number, default: 0 },
      format: { type: String, default: '' }
    },
    thumbnail: {
      type: String,
      default: ''
    },
    publication: {
      type: String,
      default: ''
    },
    journal: {
      type: String,
      default: ''
    },
    conference: {
      type: String,
      default: ''
    },
    publisher: {
      type: String,
      default: ''
    },
    year: {
      type: Number
    },
    citations: {
      type: Number,
      default: 0
    },
    citationId: {
      type: String,
      default: '',
      index: true
    },
    googleScholarPublicationId: {
      type: String,
      trim: true
    },
    paperURL: {
      type: String,
      default: ''
    },
    pdfURL: {
      type: String,
      default: ''
    },
    doi: {
      type: String,
      trim: true
    },
    volume: {
      type: String,
      default: ''
    },
    issue: {
      type: String,
      default: ''
    },
    pages: {
      type: String,
      default: ''
    },
    abstract: {
      type: String,
      default: ''
    },
    keywords: [
      {
        type: String,
        trim: true
      }
    ],
    publicationType: {
      type: String,
      default: 'Article'
    },
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    readingTime: {
      type: Number,
      default: 5
    },
    researchScore: {
      type: Number,
      default: 20
    },
    aiAnalysis: {
      summary: { type: String, default: '' },
      researchGap: { type: String, default: '' },
      futureWork: { type: String, default: '' },
      methodology: { type: String, default: '' },
      keyFindings: { type: String, default: '' },
      noveltyScore: { type: Number, default: 5 },
      difficultyLevel: { type: String, default: 'Intermediate' }
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

PublicationSchema.pre('save', function (next) {
  if (this.doi === '' || this.doi === null) {
    this.doi = undefined;
  }
  if (this.googleScholarPublicationId === '' || this.googleScholarPublicationId === null) {
    this.googleScholarPublicationId = undefined;
  }
  next();
});

PublicationSchema.index({ doi: 1 }, { unique: true, sparse: true });
PublicationSchema.index({ googleScholarPublicationId: 1 }, { unique: true, sparse: true });
PublicationSchema.index({ publicationType: 1 });
PublicationSchema.index({ createdAt: -1 });
PublicationSchema.index({ isDeleted: 1 });

const Publication = mongoose.model('Publication', PublicationSchema);

module.exports = Publication;
