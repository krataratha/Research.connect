const express = require('express');
const router = express.Router();
const multer = require('multer');
const publicationController = require('../controller/publication.controller');
const { authMiddleware, optionalAuth } = require('../../../common/middlewares/auth.middleware');
const { savePublicationValidator } = require('../validator/publication.validator');
const { ValidationError } = require('../../../common/errors/AppError');
const citationRoutes = require('./citation.routes');
const analyticsRoutes = require('./analytics.routes');
const analyticsController = require('../controller/analytics.controller');
const responseCache = require('../../../cache/response-cache.middleware');

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

  const allowedExtensions = ['.pdf', '.docx', '.doc', '.rtf', '.txt'];
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/rtf',
    'text/plain'
  ];

  const originalName = req.file.originalname || '';
  const extension = originalName.substring(originalName.lastIndexOf('.')).toLowerCase();

  const isExtensionValid = allowedExtensions.includes(extension);
  const isMimeValid = allowedMimeTypes.includes(req.file.mimetype);

  if (!isExtensionValid || !isMimeValid) {
    throw new ValidationError(
      'Unsupported file format. Supported formats: PDF, DOCX, DOC, RTF, TXT.'
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

// Get all publication types
router.get('/types', publicationController.getTypes);

// Get all publication formats
router.get('/formats', publicationController.getFormats);

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
router.post('/create', authMiddleware, savePublicationValidator, publicationController.createPublication);

// 5. Save Draft
router.post('/save-draft', authMiddleware, savePublicationValidator, publicationController.saveDraft);

// 6. Publish from draft / Publish endpoint
router.post('/publish', authMiddleware, savePublicationValidator, publicationController.createPublication);

// 7. Get all publications
router.get('/', responseCache(30), publicationController.getPublications);

// 8. Get publication for reader
router.get('/read/:slug', optionalAuth, responseCache(30), publicationController.getPublicationForReader);

// 8.5 Get publications by researcher profile slug
router.get('/profile/:profileSlug', optionalAuth, responseCache(30), publicationController.getPublicationsByProfileSlug);

// 9. Get single publication by slug
router.get('/:slug', optionalAuth, responseCache(30), publicationController.getPublicationBySlug);

// 10. Update publication
router.patch('/:id', authMiddleware, publicationController.updatePublication);
router.put('/:id', authMiddleware, publicationController.updatePublication);

// 11. Delete publication
router.delete('/:id', authMiddleware, publicationController.deletePublication);

// 12. Restore soft-deleted publication
router.post('/:id/restore', authMiddleware, publicationController.restorePublication);

// 13. Track downloads
router.post('/:id/download', publicationController.trackDownload);

// 14. Bulk Actions
router.post('/bulk-action', authMiddleware, publicationController.bulkAction);

// 15. Duplicate Publication
router.post('/:id/duplicate', authMiddleware, publicationController.duplicatePublication);

// 16. Bookmark Publication
router.post('/:id/bookmark', authMiddleware, publicationController.toggleBookmark);

// 16.5 Unique View Tracking
router.post('/:id/view', optionalAuth, publicationController.trackViewPost);

// 16.6 Recommendations Toggling
router.post('/:id/recommend', authMiddleware, publicationController.toggleRecommendation);

// 16.7 Track Shares
router.post('/:id/share', authMiddleware, publicationController.trackShare);

// 16.8 Related publications & researchers
router.get('/:id/related', optionalAuth, responseCache(30), publicationController.getRelatedPublications);
router.get('/:id/related-researchers', optionalAuth, responseCache(30), publicationController.getRelatedResearchers);

// 16.9 Threaded Comments APIs
router.get('/:id/comments', optionalAuth, responseCache(15), publicationController.getComments);
router.post('/:id/comment', authMiddleware, publicationController.addComment);
router.put('/comments/:commentId', authMiddleware, publicationController.editComment);
router.delete('/comments/:commentId', authMiddleware, publicationController.deleteComment);
router.post('/comments/:commentId/like', authMiddleware, publicationController.toggleLikeComment);

// 17. Get publications by username
router.get('/profile/:username/publications', optionalAuth, responseCache(30), publicationController.getPublicationsByUsername);

// 18. Citation sub-router — GET/POST /:id/citation/*
router.use('/:id/citation', citationRoutes);

// 19. Analytics sub-router — GET /:id/analytics/*
router.use('/:id/analytics', analyticsRoutes);

// 20. Profile publication analytics
router.get('/profile-analytics/:profileSlug', authMiddleware, analyticsController.getProfileAnalytics);

module.exports = router;
