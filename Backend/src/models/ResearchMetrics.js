import mongoose from 'mongoose';

const researchMetricsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Metrics must belong to a user'],
      unique: true,
      index: true,
    },
    totalPublications: {
      type: Number,
      default: 0,
    },
    totalCitations: {
      type: Number,
      default: 0,
    },
    citationsSinceLastYear: {
      type: Number,
      default: 0,
    },
    hIndex: {
      type: Number,
      default: 0,
    },
    hIndexSinceLastYear: {
      type: Number,
      default: 0,
    },
    i10Index: {
      type: Number,
      default: 0,
    },
    i10IndexSinceLastYear: {
      type: Number,
      default: 0,
    },
    totalCoAuthors: {
      type: Number,
      default: 0,
    },
    reads: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    followers: {
      type: Number,
      default: 0,
    },
    following: {
      type: Number,
      default: 0,
    },
    profileViews: {
      type: Number,
      default: 0,
    },
    recommendationScore: {
      type: Number,
      default: 0,
    },
    collaborationScore: {
      type: Number,
      default: 0,
    },
    averageCitations: {
      type: Number,
      default: 0,
    },
    publicationsPerYear: [
      {
        year: { type: Number, required: true },
        count: { type: Number, required: true },
      },
    ],
    citationTrend: [
      {
        year: { type: Number, required: true },
        citations: { type: Number, required: true },
      },
    ],
    monthlyGrowth: {
      type: Number,
      default: 0, // Percentage growth in citations/reads month-over-month
    },
    citationsByYear: [
      {
        year: { type: Number, required: true },
        citations: { type: Number, required: true },
      },
    ],
    readsByMonth: [
      {
        month: { type: String, required: true }, // e.g., '2026-06'
        count: { type: Number, required: true },
      }
    ]
  },
  {
    timestamps: true,
    collection: 'research_metrics',
  }
);

const ResearchMetrics = mongoose.model('ResearchMetrics', researchMetricsSchema);
export default ResearchMetrics;
