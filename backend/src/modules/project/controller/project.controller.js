const uploadService = require('../../upload/service/upload.service');
const projectService = require('../service/project.service');
const projectDTO = require('../dto/project.dto');
const asyncHandler = require('../../../common/middlewares/asyncHandler.middleware');
const { ValidationError } = require('../../../common/errors/AppError');

class ProjectController {
  createProject = asyncHandler(async (req, res) => {
    const project = await projectService.createProject(req.user._id, req.body);
    return res.success('Project created successfully.', projectDTO.formatProject(project), 201);
  });

  getProjects = asyncHandler(async (req, res) => {
    const result = await projectService.getProjects(req.user._id, req.query);
    return res.success('Projects retrieved successfully.', {
      docs: projectDTO.formatProjectList(result.docs, req.user._id),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    });
  });

  getProject = asyncHandler(async (req, res) => {
    const project = await projectService.getProject(req.user._id, req.params.id);
    return res.success('Project retrieved successfully.', projectDTO.formatProject(project, req.user._id));
  });

  updateProject = asyncHandler(async (req, res) => {
    const project = await projectService.updateProject(req.user._id, req.params.id, req.body);
    return res.success('Project updated successfully.', projectDTO.formatProject(project, req.user._id));
  });

  deleteProject = asyncHandler(async (req, res) => {
    await projectService.deleteProject(req.user._id, req.params.id);
    return res.success('Project deleted successfully.', null);
  });

  restoreProject = asyncHandler(async (req, res) => {
    const project = await projectService.restoreProject(req.user._id, req.params.id);
    return res.success('Project restored successfully.', projectDTO.formatProject(project));
  });

  applyToProject = asyncHandler(async (req, res) => {
    const application = await projectService.applyToProject(req.user._id, req.params.id, req.body.message);
    return res.success('Collaboration application submitted successfully.', projectDTO.formatApplication(application), 201);
  });

  getApplications = asyncHandler(async (req, res) => {
    const applications = await projectService.getApplications(req.user._id, req.params.id);
    return res.success('Project applications retrieved successfully.', projectDTO.formatApplicationList(applications));
  });

  reviewApplication = asyncHandler(async (req, res) => {
    const application = await projectService.reviewApplication(req.user._id, req.params.id, req.params.applicationId, req.body.action);
    return res.success('Project application updated successfully.', projectDTO.formatApplication(application));
  });

  /**
   * Upload project image/file
   */
  uploadFile = asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ValidationError('No file was uploaded.');
    }

    const { projectId } = req.body;

    const result = await uploadService.uploadFile({
      file: req.file,
      userId: req.user._id,
      purpose: 'project-image',
      resourceId: projectId
    });

    return res.success('Project file uploaded successfully.', {
      projectId: result.resourceId,
      secure_url: result.secure_url,
      public_id: result.public_id,
      asset_id: result.asset_id,
      resource_type: result.resource_type,
      bytes: result.bytes,
      format: result.format
    }, 201);
  });
}

module.exports = new ProjectController();
