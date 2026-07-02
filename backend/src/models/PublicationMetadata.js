const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PublicationMetadataSchema = new Schema(
  {
    publicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Publication',
      index: true
    },
    rawText: {
      type: String,
      default: ''
    },
    extractedMetadata: {
      type: Schema.Types.Mixed,
      default: {}
    },
    confidenceScores: {
      type: Schema.Types.Mixed,
      default: {}
    },
    extractionVersion: {
      type: String,
      default: '1.5.0'
    },
    extractionDate: {
      type: Date,
      default: Date.now
    },
    abstract: {
      type: String,
      default: ''
    },
    references: [
      {
        type: String,
        trim: true
      }
    ],
    publisher: {
      type: String,
      default: ''
    },
    customFields: {
      type: Map,
      of: String
    }
  },
  {
    timestamps: true
  }
);

const PublicationMetadata = mongoose.model('PublicationMetadata', PublicationMetadataSchema);

module.exports = PublicationMetadata;
