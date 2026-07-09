import mongoose from 'mongoose';

/**
 * Research — minimal placeholder model.
 * Retained for future expansion and import compatibility.
 */
const researchSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'archived'],
      default: 'draft',
    },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, collection: 'research' }
);

researchSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

const Research = mongoose.model('Research', researchSchema);
export default Research;
