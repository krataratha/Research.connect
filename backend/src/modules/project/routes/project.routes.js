const express = require('express');
const router = express.Router();
const projectController = require('../controller/project.controller');
const { authMiddleware } = require('../../../common/middlewares/auth.middleware');
const { upload, validateUpload } = require('../../upload/middleware/upload.middleware');
const { uploadLimiter } = require('../../../config/rateLimiter');
const {
  createProjectValidator,
  updateProjectValidator,
  projectIdValidator,
  listProjectsValidator,
  applyToProjectValidator,
  reviewApplicationValidator
} = require('../validator/project.validator');

router.use(authMiddleware);

router.post('/', createProjectValidator, projectController.createProject);
router.get('/', listProjectsValidator, projectController.getProjects);
router.get('/:id', projectIdValidator, projectController.getProject);
router.patch('/:id', projectIdValidator, updateProjectValidator, projectController.updateProject);
router.put('/:id', projectIdValidator, updateProjectValidator, projectController.updateProject);
router.delete('/:id', projectIdValidator, projectController.deleteProject);
router.post('/:id/restore', projectIdValidator, projectController.restoreProject);
router.post('/:id/applications', applyToProjectValidator, projectController.applyToProject);
router.get('/:id/applications', projectIdValidator, projectController.getApplications);
router.patch('/:id/applications/:applicationId', reviewApplicationValidator, projectController.reviewApplication);

// POST /api/v1/projects/upload
router.post(
  '/upload',
  uploadLimiter,
  upload.single('file'),
  validateUpload,
  projectController.uploadFile
);

module.exports = router;
