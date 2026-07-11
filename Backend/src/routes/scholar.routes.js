import express from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All scholar routes require authentication
router.use(protect);

router.post('/connect', profileController.connectGoogleScholar);
router.post('/sync', profileController.syncGoogleScholar);
router.get('/profile', profileController.getGoogleScholarProfileData);
router.get('/publications', profileController.getGoogleScholarPublicationsData);
router.get('/compare', profileController.compareGoogleScholar);
router.post('/disconnect', profileController.disconnectGoogleScholar);
router.post('/validate', profileController.validateScholarId);

export default router;
