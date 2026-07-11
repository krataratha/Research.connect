import express from 'express';
import * as feedController from '../controllers/feed.controller.js';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all dashboard endpoints
router.use(protect);

router.get('/home', feedController.getDashboardHome);
router.get('/feed', feedController.getHomeFeed);
router.get('/trending', feedController.getTrendingPublications);
router.get('/researchers', feedController.getRecommendedResearchers);
router.get('/publications', feedController.getHomeFeed);
router.get('/conferences', feedController.getRecommendedConferences);
router.get('/jobs', feedController.getDashboardJobs);

// New Analytics and Metrics endpoints
router.get('/metrics', dashboardController.getDashboardMetrics);
router.get('/analytics', dashboardController.getDashboardAnalytics);
router.get('/recommendations', dashboardController.getDashboardRecommendations);

export default router;
