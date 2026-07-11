import mongoose from 'mongoose';

/**
 * TrustedDevice — minimal placeholder model.
 * NOTE: Trusted device functionality is handled via the Session model.
 * This model is retained for backwards compatibility with any imports.
 */
const trustedDeviceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deviceId: { type: String, required: true, trim: true },
    deviceName: { type: String, trim: true, default: 'Unknown Device' },
    browser: { type: String, trim: true },
    operatingSystem: { type: String, trim: true },
    ipAddress: { type: String, trim: true },
    trustedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'trusted_devices' }
);

trustedDeviceSchema.index({ user: 1, deviceId: 1 }, { unique: true });

const TrustedDevice = mongoose.model('TrustedDevice', trustedDeviceSchema);
export default TrustedDevice;
