import mongoose from 'mongoose';

const rawScholarResponseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Raw response must belong to a user'],
      index: true,
    },
    scholarId: {
      type: String,
      required: true,
      trim: true,
    },
    responsePayload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const RawScholarResponse = mongoose.model('RawScholarResponse', rawScholarResponseSchema);
export default RawScholarResponse;
