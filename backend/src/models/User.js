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
      enum: ['pending', 'verified', 'active', 'suspended'],
      default: 'pending'
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    otpVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: {
      type: Date
    },
    refreshToken: {
      type: String
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'Session'
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
    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      index: true
    },
    publicProfileId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true
    },
    profileSlug: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true
    },
    profileUrl: {
      type: String,
      trim: true
    },
    publicProfileUrl: {
      type: String,
      trim: true
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

// Pre-save hook to populate fullName, sync verified fields, and auto-generate username/profile URL
UserSchema.pre('save', async function (next) {
  if (this.isModified('firstName') || this.isModified('lastName')) {
    this.fullName = `${this.firstName} ${this.lastName}`.trim();
  }

  // Generate username and public profile URL details if not present
  if (!this.username || !this.profileSlug) {
    try {
      const UserModel = mongoose.model('User');

      if (this.username && !this.profileSlug) {
        if (!this.publicProfileId) {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let randomId = '';
          for (let i = 0; i < 6; i++) {
            randomId += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          this.publicProfileId = `rc_${randomId}`;
        }
        this.profileSlug = `${this.username}-${this.publicProfileId}`;
        this.profileUrl = `/profile/${this.profileSlug}`;
        this.publicProfileUrl = `https://researchconnect.com${this.profileUrl}`;
      } else if (!this.username) {
        const cleanFirst = (this.firstName || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '-');
        const cleanLast = (this.lastName || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '-');
        let baseUsername = `${cleanFirst}-${cleanLast}`
          .replace(/-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');

        if (!baseUsername) {
          baseUsername = 'researcher';
        }

        // Generate random suffix for uniqueness
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomId = '';
        for (let i = 0; i < 6; i++) {
          randomId += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const publicProfileId = `rc_${randomId}`;

        // Check if base username is already taken
        const exists = await UserModel.findOne({ username: baseUsername, isDeleted: { $ne: true } });

        if (!exists) {
          this.username = baseUsername;
          this.profileSlug = `${baseUsername}-${publicProfileId}`;
        } else {
          this.username = `${baseUsername}-${publicProfileId}`;
          this.profileSlug = this.username;
        }

        this.publicProfileId = publicProfileId;
        this.profileUrl = `/profile/${this.profileSlug}`;
        this.publicProfileUrl = `https://researchconnect.com${this.profileUrl}`;
      }
    } catch (err) {
      console.error('Error generating username and slug in pre-save: ', err);
    }
  }
  next();
});


// Indexes
UserSchema.index({ status: 1 });
UserSchema.index({ isDeleted: 1 });
UserSchema.index({ createdAt: -1 });

const User = mongoose.model('User', UserSchema);

module.exports = User;
