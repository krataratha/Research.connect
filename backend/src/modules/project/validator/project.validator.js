const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('../../../common/errors/AppError');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const details = errors.array().reduce((result, error) => {
    result[error.path || error.param] = error.msg;
    return result;
  }, {});
  throw new ValidationError('Validation failed. Please correct the fields.', details);
};

const projectFields = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.').isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters.'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty.'),
  body('status').optional().isIn(['Ongoing', 'Completed', 'Proposed', 'Archived']).withMessage('Status must be Ongoing, Completed, Proposed, or Archived.'),
  body('researchAreas').optional().isArray().withMessage('Research areas must be an array.'),
  body('researchAreas.*').optional().isString().trim().notEmpty().withMessage('Each research area must be a non-empty string.'),
  body('collaborators').optional().isArray().withMessage('Collaborators must be an array.'),
  body('collaborators.*').optional().isMongoId().withMessage('Each collaborator must be a valid user ID.'),
  body('imageUrl').optional().isString().trim().isLength({ max: 2048 }).withMessage('Image URL is invalid.'),
  body('deadline').optional({ nullable: true }).isISO8601().withMessage('Deadline must be a valid date.'),
  body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100.'),
  body('visibility').optional().isIn(['Public', 'Private']).withMessage('Visibility must be Public or Private.'),
  body('openToCollaboration').optional().isBoolean().withMessage('Open to collaboration must be true or false.')
];

const createProjectValidator = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters.'),
  body('description').trim().notEmpty().withMessage('Description is required.'),
  ...projectFields.slice(2),
  handleValidationErrors
];

const updateProjectValidator = [...projectFields, handleValidationErrors];
const projectIdValidator = [param('id').isMongoId().withMessage('Project ID is invalid.'), handleValidationErrors];
const listProjectsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),
  query('status').optional().isIn(['Ongoing', 'Completed', 'Proposed', 'Archived']).withMessage('Status is invalid.'),
  query('scope').optional().isIn(['all', 'owned', 'collaborating']).withMessage('Scope must be all, owned, or collaborating.'),
  handleValidationErrors
];

const applyToProjectValidator = [
  param('id').isMongoId().withMessage('Project ID is invalid.'),
  body('message').trim().notEmpty().isLength({ max: 2000 }).withMessage('Application message is required and must not exceed 2000 characters.'),
  handleValidationErrors
];
const reviewApplicationValidator = [
  param('id').isMongoId().withMessage('Project ID is invalid.'),
  param('applicationId').isMongoId().withMessage('Application ID is invalid.'),
  body('action').isIn(['accept', 'decline']).withMessage('Action must be accept or decline.'),
  handleValidationErrors
];

module.exports = { createProjectValidator, updateProjectValidator, projectIdValidator, listProjectsValidator, applyToProjectValidator, reviewApplicationValidator };
