const { body } = require('express-validator');
const validationMiddleware = require('../../../common/middlewares/validation.middleware');

const updateProfileValidator = [
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio description cannot exceed 500 characters'),
  body('country')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Country cannot be empty'),
  body('phone')
    .optional()
    .trim()
    .isString(),
  body('profileImage')
    .optional()
    .trim()
    .isString(),
  body('institution')
    .optional()
    .trim()
    .isString(),
  body('department')
    .optional()
    .trim()
    .isString(),
  body('designation')
    .optional()
    .trim()
    .isString(),
  body('company')
    .optional()
    .trim()
    .isString(),
  body('division')
    .optional()
    .trim()
    .isString(),
  body('position')
    .optional()
    .trim()
    .isString(),
  body('socialLinks')
    .optional()
    .isObject()
    .withMessage('socialLinks must be an object'),
  body('socialLinks.orcid')
    .optional()
    .trim()
    .isString(),
  body('socialLinks.googleScholar')
    .optional()
    .trim()
    .isString(),
  body('socialLinks.researchGate')
    .optional()
    .trim()
    .isString(),
  body('socialLinks.linkedin')
    .optional()
    .trim()
    .isString(),
  body('socialLinks.website')
    .optional()
    .trim()
    .isString(),
  body('socialLinks.github')
    .optional()
    .trim()
    .isString(),
  body('socialLinks.scopus')
    .optional()
    .trim()
    .isString(),
  body('dateOfBirth')
    .optional()
    .trim()
    .isString(),
  body('nationality')
    .optional()
    .trim()
    .isString(),
  body('coverImage')
    .optional()
    .trim()
    .isString(),
  body('profileImage')
    .optional()
    .trim()
    .isString(),
  body('researchSummary')
    .optional()
    .trim()
    .isString(),
  body('currentResearch')
    .optional()
    .trim()
    .isString(),
  body('researchVision')
    .optional()
    .trim()
    .isString(),

  // Arrays validations
  body('education')
    .optional()
    .isArray()
    .withMessage('Education must be an array'),
  body('education.*.degree')
    .notEmpty()
    .withMessage('Degree is required in education'),
  body('education.*.university')
    .notEmpty()
    .withMessage('University is required in education'),
  body('education.*.duration')
    .notEmpty()
    .withMessage('Duration is required in education'),

  body('experience')
    .optional()
    .isArray()
    .withMessage('Experience must be an array'),
  body('experience.*.designation')
    .notEmpty()
    .withMessage('Designation is required in experience'),
  body('experience.*.institution')
    .notEmpty()
    .withMessage('Institution is required in experience'),
  body('experience.*.duration')
    .notEmpty()
    .withMessage('Duration is required in experience'),

  body('projects')
    .optional()
    .isArray()
    .withMessage('Projects must be an array'),
  body('projects.*.title')
    .notEmpty()
    .withMessage('Project title is required'),

  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('skills.*.name')
    .notEmpty()
    .withMessage('Skill name is required'),
  body('skills.*.category')
    .optional()
    .isIn(['Programming', 'AI', 'ML', 'Cloud', 'Research', 'Writing', 'Statistics', 'Other'])
    .withMessage('Invalid skill category'),

  body('achievements')
    .optional()
    .isArray()
    .withMessage('Achievements must be an array'),
  body('achievements.*.title')
    .notEmpty()
    .withMessage('Achievement title is required'),
  body('achievements.*.type')
    .isIn(['Award', 'Patent', 'Honor', 'Recognition'])
    .withMessage('Invalid achievement type'),
  body('achievements.*.organization')
    .notEmpty()
    .withMessage('Achievement organization is required'),
  body('achievements.*.year')
    .isInt({ min: 1900, max: 2100 })
    .withMessage('Achievement year must be a valid integer'),

  body('certifications')
    .optional()
    .isArray()
    .withMessage('Certifications must be an array'),
  body('certifications.*.name')
    .notEmpty()
    .withMessage('Certification name is required'),
  body('certifications.*.organization')
    .notEmpty()
    .withMessage('Certification organization is required'),

  body('metrics')
    .optional()
    .isObject()
    .withMessage('Metrics must be an object'),
  
  validationMiddleware
];

module.exports = {
  updateProfileValidator
};
