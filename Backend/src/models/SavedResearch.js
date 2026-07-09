import mongoose from 'mongoose';

/**
 * SavedResearch — minimal placeholder model.
 * Allows users to bookmark/save research items for later access.
 */
const savedResearchSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    research: { type: mongoose.Schema.Types.ObjectId, ref: 'Research', required: true },
    savedAt: { type: Date, default: Date.now },
    notes: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true, collection: 'saved_research' }
);

// Ensure a user can only save a research item once
savedResearchSchema.index({ user: 1, research: 1 }, { unique: true });

const SavedResearch = mongoose.model('SavedResearch', savedResearchSchema);
export default SavedResearch;
