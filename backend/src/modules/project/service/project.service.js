const projectRepository = require('../repository/project.repository');
const { ConflictError, ForbiddenError, NotFoundError, ValidationError } = require('../../../common/errors/AppError');

class ProjectService {
  async createProject(userId, data) {
    const collaborators = this._normalizeCollaborators(data.collaborators, userId);
    const project = await projectRepository.create({
      userId,
      title: data.title.trim(),
      description: data.description.trim(),
      status: data.status || 'Ongoing',
      researchAreas: this._normalizeStrings(data.researchAreas),
      collaborators,
      imageUrl: data.imageUrl?.trim() || '',
      deadline: data.deadline || null,
      progress: data.progress ?? 0,
      visibility: data.visibility || 'Public',
      openToCollaboration: data.openToCollaboration ?? false
    });
    return project.populate([
      { path: 'userId', select: 'firstName lastName fullName profileImage profileSlug' },
      { path: 'collaborators', select: 'firstName lastName fullName profileImage profileSlug' }
    ]);
  }

  async getProjects(userId, query) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const filter = {};

    if (query.scope === 'owned') filter.userId = userId;
    else if (query.scope === 'collaborating') filter.collaborators = userId;
    else filter.$or = [{ userId }, { collaborators: userId }];

    if (query.status) filter.status = query.status;
    return projectRepository.findProjects(filter, { page, limit, sort: query.sort || '-createdAt', search: query.search?.trim() || '' });
  }

  async getProject(userId, projectId) {
    const project = await projectRepository.findAccessibleById(projectId, userId);
    if (!project) throw new NotFoundError('Project not found.');
    return project;
  }

  async updateProject(userId, projectId, data) {
    const project = await this._findOwnedProject(userId, projectId);
    const update = {};
    ['title', 'description', 'status', 'imageUrl', 'deadline', 'progress', 'visibility', 'openToCollaboration'].forEach((field) => {
      if (data[field] !== undefined) update[field] = typeof data[field] === 'string' ? data[field].trim() : data[field];
    });
    if (data.researchAreas !== undefined) update.researchAreas = this._normalizeStrings(data.researchAreas);
    if (data.collaborators !== undefined) update.collaborators = this._normalizeCollaborators(data.collaborators, userId);

    if (!Object.keys(update).length) throw new ValidationError('Provide at least one project field to update.');
    return projectRepository.update(project._id, update);
  }

  async deleteProject(userId, projectId) {
    const project = await this._findOwnedProject(userId, projectId);
    return projectRepository.softDelete(project._id, userId);
  }

  async restoreProject(userId, projectId) {
    const project = await projectRepository.model.findOne({ _id: projectId, userId, isDeleted: true });
    if (!project) throw new NotFoundError('Deleted project not found.');
    return projectRepository.restore(project._id);
  }

  async applyToProject(userId, projectId, message) {
    const project = await projectRepository.model.findOne({ _id: projectId, isDeleted: { $ne: true } });
    if (!project) throw new NotFoundError('Project not found.');
    if (!project.openToCollaboration) throw new ValidationError('This project is not accepting collaboration applications.');
    if (project.userId.toString() === userId.toString()) throw new ValidationError('Project owners cannot apply to their own project.');
    if (project.collaborators.some((id) => id.toString() === userId.toString())) throw new ConflictError('You are already a collaborator on this project.');
    if (await projectRepository.findApplication(projectId, userId)) throw new ConflictError('You have already applied to this project.');
    return projectRepository.createApplication({ projectId, applicantId: userId, message: message.trim() });
  }

  async getApplications(userId, projectId) {
    await this._findOwnedProject(userId, projectId);
    return projectRepository.findApplications(projectId);
  }

  async reviewApplication(userId, projectId, applicationId, action) {
    const project = await this._findOwnedProject(userId, projectId);
    const application = await projectRepository.updateApplication(projectId, applicationId, { status: action === 'accept' ? 'accepted' : 'declined' });
    if (!application) throw new NotFoundError('Application not found.');
    if (action === 'accept' && !project.collaborators.some((id) => id.toString() === application.applicantId._id.toString())) {
      project.collaborators.push(application.applicantId._id);
      await project.save();
    }
    return application;
  }

  async _findOwnedProject(userId, projectId) {
    const project = await projectRepository.model.findOne({ _id: projectId, isDeleted: { $ne: true } });
    if (!project) throw new NotFoundError('Project not found.');
    if (project.userId.toString() !== userId.toString()) throw new ForbiddenError('Only the project owner can change this project.');
    return project;
  }

  _normalizeStrings(values = []) {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
  }

  _normalizeCollaborators(collaborators = [], ownerId) {
    const ownerIdString = ownerId.toString();
    return [...new Set(collaborators.map((id) => id.toString()).filter((id) => id !== ownerIdString))];
  }
}

module.exports = new ProjectService();
