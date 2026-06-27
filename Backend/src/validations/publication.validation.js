import { body, query, param } from 'express-validator';

export const createPublicationValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 300 }).withMessage('Title cannot exceed 300 characters'),

  body('abstract')
    .trim()
    .notEmpty().withMessage('Abstract is required')
    .isLength({ max: 5000 }).withMessage('Abstract cannot exceed 5000 characters'),

  body('authors')
    .isArray({ min: 1 }).withMessage('At least one author is required'),

  body('authors.*.displayName')
    .trim()
    .notEmpty().withMessage('Each author must have a displayName'),

  body('authors.*.institution')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Institution name too long'),

  body('journal')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Journal name too long'),

  body('publicationDate')
    .optional()
    .isISO8601().withMessage('publicationDate must be a valid date (ISO 8601)'),

  body('tags')
    .optional()
    .isArray().withMessage('tags must be an array'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Each tag cannot exceed 50 characters'),

  body('citationCount')
    .optional()
    .isInt({ min: 0 }).withMessage('citationCount must be a non-negative integer'),

  body('fileUrl')
    .optional()
    .trim()
    .isURL().withMessage('fileUrl must be a valid URL'),
];

export const updatePublicationValidator = [
  param('id')
    .isMongoId().withMessage('Invalid publication ID'),

  body('title')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Title cannot exceed 300 characters'),

  body('abstract')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Abstract cannot exceed 5000 characters'),

  body('authors')
    .optional()
    .isArray({ min: 1 }).withMessage('authors must have at least one entry'),

  body('authors.*.displayName')
    .optional()
    .trim()
    .notEmpty().withMessage('Each author must have a displayName'),

  body('authors.*.institution')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Institution name too long'),

  body('journal')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Journal name too long'),

  body('publicationDate')
    .optional()
    .isISO8601().withMessage('publicationDate must be a valid date (ISO 8601)'),

  body('tags')
    .optional()
    .isArray().withMessage('tags must be an array'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Each tag cannot exceed 50 characters'),

  body('citationCount')
    .optional()
    .isInt({ min: 0 }).withMessage('citationCount must be a non-negative integer'),

  body('fileUrl')
    .optional()
    .trim()
    .isURL().withMessage('fileUrl must be a valid URL'),
];

export const getPublicationsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),

  query('sortBy')
    .optional()
    .isIn(['publicationDate', 'citationCount', 'title', 'createdAt'])
    .withMessage('sortBy must be one of: publicationDate, citationCount, title, createdAt'),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('order must be asc or desc'),

  query('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('year must be a valid 4-digit year'),

  query('tag')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('tag filter too long'),

  query('journal')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('journal filter too long'),
];

export const mongoIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid publication ID'),
];
