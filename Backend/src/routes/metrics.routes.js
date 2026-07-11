import express from 'express';
import { getResearchMetrics } from '../controllers/profile.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All metrics routes require authentication
router.use(protect);

router.get('/', getResearchMetrics);

export default router;
