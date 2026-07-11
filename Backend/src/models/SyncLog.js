import mongoose from 'mongoose';

const syncLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sync log must belong to a user'],
      index: true,
    },
    provider: {
      type: String,
      required: true,
      enum: ['google-scholar', 'orcid', 'scopus', 'semantic-scholar'],
    },
    status: {
      type: String,
      required: true,
      enum: ['success', 'failed'],
      index: true,
    },
    recordsSynced: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      trim: true,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'sync_history',
  }
);

const SyncLog = mongoose.model('SyncLog', syncLogSchema);
export default SyncLog;
