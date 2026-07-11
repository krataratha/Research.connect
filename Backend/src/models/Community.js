import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Community name is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Community name must be at least 3 characters'],
      maxlength: [50, 'Community name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      required: [true, 'Community description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Community must have a creator'],
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isPrivate: {
      type: Boolean,
      default: false,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Community = mongoose.model('Community', communitySchema);
export default Community;
