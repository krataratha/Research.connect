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
    publicationCode: {
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

PublicationSchema.pre('save', async function (next) {
  if (this.doi === '' || this.doi === null) {
    this.doi = undefined;
  }
  if (this.googleScholarPublicationId === '' || this.googleScholarPublicationId === null) {
    this.googleScholarPublicationId = undefined;
  }

  // 1. Auto-generate slug if not present
  if (!this.slug && this.title) {
    const { generateSlug } = require('../modules/publication/helper/slug.helper');
    this.slug = generateSlug(this.title);
  }

  // 2. Auto-generate publicationCode (RC-YYYY-XXXXXXX) if not present
  if (!this.publicationCode) {
    const currentYear = new Date().getFullYear();
    try {
      const count = await mongoose.model('Publication').countDocuments({
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
        }
      });
      const seq = String(count + 1).padStart(7, '0');
      let code = `RC-${currentYear}-${seq}`;

      // Check if it already exists to prevent duplicate key errors in high concurrency
      const existing = await mongoose.model('Publication').findOne({ publicationCode: code });
      if (existing) {
        const randomSuffix = Math.floor(100 + Math.random() * 900);
        code = `RC-${currentYear}-${seq}-${randomSuffix}`;
      }
      this.publicationCode = code;
    } catch (err) {
      const randomId = Math.floor(1000000 + Math.random() * 9000000);
      this.publicationCode = `RC-${currentYear}-${randomId}`;
    }
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
