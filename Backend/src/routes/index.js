import express from 'express';
import healthRouter from './health.routes.js';
import authRouter from './auth.routes.js';
import profileRouter from './profile.routes.js';
import feedRouter from './feed.routes.js';
import publicationRouter from './publication.routes.js';
import dashboardRouter from './dashboard.routes.js';
import recommendationRouter from './recommendation.routes.js';

const router = express.Router();

// Mount API Sub-routers
router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/profile', profileRouter);
router.use('/feed', feedRouter);
router.use('/publications', publicationRouter);
router.use('/dashboard', dashboardRouter);
router.use('/recommendations', recommendationRouter);

export default router;
