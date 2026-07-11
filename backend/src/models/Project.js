const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Project title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['Ongoing', 'Completed', 'Proposed', 'Archived'],
      default: 'Ongoing'
    },
    collaborators: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    researchAreas: [
      {
        type: String,
        trim: true
      }
    ],
    imageUrl: {
      type: String,
      trim: true,
      default: ''
    },
    deadline: { type: Date, default: null },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    visibility: { type: String, enum: ['Public', 'Private'], default: 'Public' },
    openToCollaboration: { type: Boolean, default: false },
    deletedAt: {
      type: Date,
      default: null
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
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

ProjectSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });
ProjectSchema.index({ collaborators: 1, isDeleted: 1 });
ProjectSchema.index({ status: 1, isDeleted: 1 });

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;
