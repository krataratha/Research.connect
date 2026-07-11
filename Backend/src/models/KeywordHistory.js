import mongoose from 'mongoose';

const keywordHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Keyword history must belong to a user'],
      index: true,
    },
    keyword: {
      type: String,
      required: [true, 'Keyword is required'],
      trim: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['added', 'removed', 'imported'],
      default: 'added',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'keyword_history',
  }
);

const KeywordHistory = mongoose.model('KeywordHistory', keywordHistorySchema);
export default KeywordHistory;
