const { param, body, validationResult } = require('express-validator');
const { ValidationError } = require('../../../common/errors/AppError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ValidationError('Validation Error', errors.array()));
  }
  next();
};

const validateNotificationId = [
  param('notificationId')
    .isMongoId()
    .withMessage('Notification ID must be a valid MongoDB ObjectId'),
  validate
];

const validateSettingsUpdate = [
  body('follow')
    .optional()
    .isBoolean()
    .withMessage('follow must be a boolean value'),
  body('connection')
    .optional()
    .isBoolean()
    .withMessage('connection must be a boolean value'),
  body('publication')
    .optional()
    .isBoolean()
    .withMessage('publication must be a boolean value'),
  body('comment')
    .optional()
    .isBoolean()
    .withMessage('comment must be a boolean value'),
  body('mention')
    .optional()
    .isBoolean()
    .withMessage('mention must be a boolean value'),
  body('system')
    .optional()
    .isBoolean()
    .withMessage('system must be a boolean value'),
  validate
];

module.exports = {
  validateNotificationId,
  validateSettingsUpdate
};
