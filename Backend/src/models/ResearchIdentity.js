import mongoose from 'mongoose';

const researchIdentitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Research identities must belong to a user'],
      unique: true,
      index: true,
    },
    googleScholar: {
      type: String,
      trim: true,
      default: '',
    },
    orcid: {
      type: String,
      trim: true,
      default: '',
    },
    scopus: {
      type: String,
      trim: true,
      default: '',
    },
    semanticScholar: {
      type: String,
      trim: true,
      default: '',
    },
    crossref: {
      type: String,
      trim: true,
      default: '',
    },
    researchGate: {
      type: String,
      trim: true,
      default: '',
    },
    dblp: {
      type: String,
      trim: true,
      default: '',
    },
    linkedin: {
      type: String,
      trim: true,
      default: '',
    },
    github: {
      type: String,
      trim: true,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'profile_links',
  }
);

const ResearchIdentity = mongoose.model('ResearchIdentity', researchIdentitySchema);
export default ResearchIdentity;
