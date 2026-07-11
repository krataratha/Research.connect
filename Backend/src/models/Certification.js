import mongoose from 'mongoose';

const certificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Certification must belong to a user'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Certification name is required'],
      trim: true,
    },
    issuer: {
      type: String,
      required: [true, 'Issuer is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Issue date is required'],
    },
    expirationDate: {
      type: Date,
      default: null, // Null means it does not expire
    },
    credentialId: {
      type: String,
      trim: true,
      default: '',
    },
    credentialUrl: {
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
    collection: 'certifications',
  }
);

// Soft delete query middleware
certificationSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

const Certification = mongoose.model('Certification', certificationSchema);
export default Certification;
