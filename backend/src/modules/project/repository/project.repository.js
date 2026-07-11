const BaseRepository = require('../../../common/repository/base.repository');
const Project = require('../../../models/Project');
const ProjectApplication = require('../../../models/ProjectApplication');

class ProjectRepository extends BaseRepository {
  constructor() {
    super(Project);
  }

  async findAccessibleById(projectId, userId) {
    return this.model.findOne({
      _id: projectId,
      isDeleted: { $ne: true },
      $or: [{ userId }, { collaborators: userId }]
    }).populate('userId', 'firstName lastName fullName profileImage profileSlug')
      .populate('collaborators', 'firstName lastName fullName profileImage profileSlug');
  }

  async findProjects(filter, { page, limit, sort, search }) {
    const queryFilter = { ...filter, isDeleted: { $ne: true } };

    if (search) {
      queryFilter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { researchAreas: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const query = this.model.find(queryFilter)
      .populate('userId', 'firstName lastName fullName profileImage profileSlug')
      .populate('collaborators', 'firstName lastName fullName profileImage profileSlug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const [docs, total] = await Promise.all([query, this.model.countDocuments(queryFilter)]);
    return { docs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createApplication(data) { return ProjectApplication.create(data); }

  async findApplication(projectId, applicantId) {
    return ProjectApplication.findOne({ projectId, applicantId, isDeleted: { $ne: true } });
  }

  async findApplications(projectId) {
    return ProjectApplication.find({ projectId, isDeleted: { $ne: true } })
      .populate('applicantId', 'firstName lastName fullName profileImage profileSlug').sort('-createdAt').lean();
  }

  async updateApplication(projectId, applicationId, update) {
    return ProjectApplication.findOneAndUpdate({ _id: applicationId, projectId, isDeleted: { $ne: true } }, update, { new: true })
      .populate('applicantId', 'firstName lastName fullName profileImage profileSlug');
  }
}

module.exports = new ProjectRepository();
