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
  
  validationMiddleware
];

module.exports = {
  updateProfileValidator
};
