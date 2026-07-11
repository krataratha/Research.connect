import express from 'express';
import * as discoveryController from '../controllers/discovery.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all discovery endpoints
router.use(protect);

router.get('/researchers', discoveryController.getDiscoveryResearchers);
router.get('/trending', discoveryController.getDiscoveryTrending);
router.get('/recent', discoveryController.getDiscoveryRecent);
router.get('/top-researchers', discoveryController.getDiscoveryTopResearchers);
router.get('/publications', discoveryController.getDiscoveryPublications);
router.get('/collaborations', discoveryController.getDiscoveryCollaborations);

export default router;
