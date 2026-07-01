const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RefreshTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    token: {
      type: String,
      required: true,
      unique: true
    },
    device: {
      type: String,
      default: 'Unknown'
    },
    browser: {
      type: String,
      default: 'Unknown'
    },
    expiresAt: {
      type: Date,
      required: true
    },
    expiry: {
      type: Date
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

RefreshTokenSchema.pre('save', function (next) {
  if (this.userId && !this.user) {
    this.user = this.userId;
  } else if (this.user && !this.userId) {
    this.userId = this.user;
  }
  if (this.expiresAt && !this.expiry) {
    this.expiry = this.expiresAt;
  } else if (this.expiry && !this.expiresAt) {
    this.expiresAt = this.expiry;
  }
  next();
});

// TTL index to automatically remove expired refresh tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
RefreshTokenSchema.index({ isDeleted: 1 });

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);

module.exports = RefreshToken;
