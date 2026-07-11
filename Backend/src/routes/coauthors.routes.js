import express from 'express';
import { getCoAuthors } from '../controllers/profile.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All coauthors routes require authentication
router.use(protect);

router.get('/', getCoAuthors);

export default router;
