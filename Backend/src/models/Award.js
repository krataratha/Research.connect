import mongoose from 'mongoose';

const awardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Award must belong to a user'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Award title is required'],
      trim: true,
    },
    issuer: {
      type: String,
      required: [true, 'Award issuer is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Award date is required'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'achievements',
  }
);

// Soft delete query middleware
awardSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

const Award = mongoose.model('Award', awardSchema);
export default Award;
