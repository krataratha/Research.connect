const communityService = require('../service/community.service');
const asyncHandler = require('../../../common/middlewares/asyncHandler.middleware');

const createCommunity = asyncHandler(async (req, res) => {
  const community = await communityService.createCommunity(req.user.id, req.body);
  res.status(201).json({ success: true, message: 'Community created successfully.', data: community, error: null });
});

const getCommunities = asyncHandler(async (req, res) => {
  const communities = await communityService.getCommunities(req.query);
  res.status(200).json({ success: true, message: 'Communities retrieved.', data: communities, error: null });
});

const getCommunityBySlug = asyncHandler(async (req, res) => {
  const data = await communityService.getCommunityBySlug(req.user?.id, req.params.slug);
  res.status(200).json({ success: true, message: 'Community details retrieved.', data, error: null });
});

const joinCommunity = asyncHandler(async (req, res) => {
  const data = await communityService.joinCommunity(req.user.id, req.params.id);
  res.status(200).json({ success: true, message: 'Joined community successfully.', data, error: null });
});

const createPost = asyncHandler(async (req, res) => {
  const post = await communityService.createPost(req.user.id, req.params.id, req.body);
  res.status(201).json({ success: true, message: 'Post created successfully.', data: post, error: null });
});

const getCommunityPosts = asyncHandler(async (req, res) => {
  const posts = await communityService.getCommunityPosts(req.user.id, req.params.id, req.query);
  res.status(200).json({ success: true, message: 'Posts retrieved.', data: posts, error: null });
});

const createComment = asyncHandler(async (req, res) => {
  const { content, parentId } = req.body;
  const comment = await communityService.createComment(req.user.id, req.params.postId, content, parentId);
  res.status(201).json({ success: true, message: 'Comment added.', data: comment, error: null });
});

const createEvent = asyncHandler(async (req, res) => {
  const event = await communityService.createEvent(req.user.id, req.params.id, req.body);
  res.status(201).json({ success: true, message: 'Event created.', data: event, error: null });
});

const createJob = asyncHandler(async (req, res) => {
  const job = await communityService.createJob(req.user.id, req.params.id, req.body);
  res.status(201).json({ success: true, message: 'Job posted.', data: job, error: null });
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await communityService.createAnnouncement(req.user.id, req.params.id, req.body);
  res.status(201).json({ success: true, message: 'Announcement created.', data: announcement, error: null });
});

module.exports = {
  createCommunity,
  getCommunities,
  getCommunityBySlug,
  joinCommunity,
  createPost,
  getCommunityPosts,
  createComment,
  createEvent,
  createJob,
  createAnnouncement
};
