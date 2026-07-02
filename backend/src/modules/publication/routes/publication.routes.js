const express = require('express');
const router = express.Router();
const multer = require('multer');
const publicationController = require('../controller/publication.controller');
const { authMiddleware, optionalAuth } = require('../../../common/middlewares/auth.middleware');
const { savePublicationValidator } = require('../validator/publication.validator');
const { ValidationError } = require('../../../common/errors/AppError');

// Configure Multer for memory storage with a 100MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB limit
  }
});

// Middleware to validate file type and size before sending to Cloudinary
const validateFile = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const allowedExtensions = ['.pdf', '.docx', '.pptx', '.zip', '.csv', '.txt'];
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-zip-compressed',
    'text/csv',
    'text/plain'
  ];

  const originalName = req.file.originalname || '';
  const extension = originalName.substring(originalName.lastIndexOf('.')).toLowerCase();

  const isExtensionValid = allowedExtensions.includes(extension);
  const isMimeValid = allowedMimeTypes.includes(req.file.mimetype);

  if (!isExtensionValid && !isMimeValid) {
    throw new ValidationError(
      'Unsupported file format. Supported files are: PDF, DOCX, PPTX, ZIP, CSV, TXT.'
    );
  }

  next();
};

// 1. Get My Publications (Drafts, Trash portfolio)
router.get('/my', authMiddleware, publicationController.getMyPublications);

// 2. Extract Metadata from file buffer
router.post(
  '/extract-metadata',
  authMiddleware,
  upload.single('file'),
  validateFile,
  publicationController.extractMetadata
);

// Alias /extract for Phase 1.5 spec
router.post(
  '/extract',
  authMiddleware,
  upload.single('file'),
  validateFile,
  publicationController.extractMetadata
);

// Get cached metadata by ID
router.get(
  '/metadata/:id',
  authMiddleware,
  publicationController.getMetadataCache
);

// 3. Upload file (Cloudinary)
router.post(
  '/upload',
  authMiddleware,
  upload.single('file'),
  validateFile,
  publicationController.uploadFile
);

// 4. Create/Publish Publication
router.post('/', authMiddleware, savePublicationValidator, publicationController.createPublication);

// 5. Save Draft
router.post('/save-draft', authMiddleware, savePublicationValidator, publicationController.saveDraft);

// 6. Publish from draft / Publish endpoint
router.post('/publish', authMiddleware, savePublicationValidator, publicationController.createPublication);

// 7. Get all publications
router.get('/', publicationController.getPublications);

// 8. Get publication for reader
router.get('/read/:slug', optionalAuth, publicationController.getPublicationForReader);

// 8.5 Get publications by researcher profile slug
router.get('/profile/:profileSlug', optionalAuth, publicationController.getPublicationsByProfileSlug);

// 9. Get single publication by slug
router.get('/:slug', optionalAuth, publicationController.getPublicationBySlug);

// 10. Update publication
router.patch('/:id', authMiddleware, publicationController.updatePublication);

// 11. Delete publication
router.delete('/:id', authMiddleware, publicationController.deletePublication);

// 12. Restore soft-deleted publication
router.post('/:id/restore', authMiddleware, publicationController.restorePublication);

// 13. Track downloads
router.post('/:id/download', publicationController.trackDownload);

module.exports = router;
