const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectApplicationSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  applicantId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

ProjectApplicationSchema.index({ projectId: 1, applicantId: 1 }, { unique: true });
module.exports = mongoose.model('ProjectApplication', ProjectApplicationSchema);
