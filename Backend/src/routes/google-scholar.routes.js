import express from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All google-scholar routes require authentication
router.use(protect);

router.post('/link', profileController.linkGoogleScholar);
router.post('/import', profileController.importGoogleScholar);
router.post('/sync', profileController.syncGoogleScholar);

export default router;
