const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../../common/middlewares/auth.middleware');
const communityController = require('../controller/community.controller');

// Public routes
router.get('/', communityController.getCommunities);
router.get('/:slug', communityController.getCommunityBySlug);

// Protected routes
router.use(authMiddleware);

router.post('/', communityController.createCommunity);
router.post('/:id/join', communityController.joinCommunity);
router.post('/:id/posts', communityController.createPost);
router.get('/:id/posts', communityController.getCommunityPosts);
router.post('/posts/:postId/comments', communityController.createComment);
router.post('/:id/events', communityController.createEvent);
router.post('/:id/jobs', communityController.createJob);
router.post('/:id/announcements', communityController.createAnnouncement);

module.exports = router;
