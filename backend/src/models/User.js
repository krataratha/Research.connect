const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    fullName: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    role: {
      type: String,
      enum: ['researcher', 'admin'],
      default: 'researcher'
    },
    researcherType: {
      type: String,
      enum: ['academic', 'corporate', 'medical', 'non_researcher'],
      default: 'non_researcher'
    },
    organizationType: {
      type: String,
      enum: ['institution', 'company', 'hospital', 'organization'],
      default: 'organization'
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended'],
      default: 'pending'
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: false
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lastLogin: {
      type: Date
    },
    lastLoginIP: {
      type: String,
      default: ''
    },
    lastLoginDevice: {
      type: String,
      default: ''
    },
    profileImage: {
      type: String,
      default: ''
    },
    country: {
      type: String,
      trim: true,
      default: ''
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to populate fullName and sync verified fields
UserSchema.pre('save', function (next) {
  if (this.isModified('firstName') || this.isModified('lastName')) {
    this.fullName = `${this.firstName} ${this.lastName}`.trim();
  }
  if (this.isModified('emailVerified')) {
    this.isVerified = this.emailVerified;
  } else if (this.isModified('isVerified')) {
    this.emailVerified = this.isVerified;
  }
  next();
});

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ status: 1 });
UserSchema.index({ isDeleted: 1 });
UserSchema.index({ createdAt: -1 });

const User = mongoose.model('User', UserSchema);

module.exports = User;
