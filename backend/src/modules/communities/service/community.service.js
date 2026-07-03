const {
  communityRepository,
  communityMemberRepository,
  communityInvitationRepository,
  communityPostRepository,
  communityCommentRepository,
  communityEventRepository,
  communityJobRepository,
  communityAnnouncementRepository,
  communityMessageRepository
} = require('../repository/community.repository');
const User = require('../../../models/User');
const Notification = require('../../../models/Notification');
const { ValidationError, UnauthorizedError, NotFoundError } = require('../../../common/errors/AppError');
const socketGateway = require('../../../socket');

class CommunityService {
  /**
   * Verify membership and optionally role permissions
   */
  async checkPermission(userId, communityId, allowedRoles = []) {
    const member = await communityMemberRepository.findOne({ communityId, userId });
    if (!member || member.status !== 'Active') {
      throw new UnauthorizedError('Access denied: You are not an active member of this community.');
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(member.role)) {
      throw new UnauthorizedError('Access denied: Insufficient community permissions.');
    }
    return member;
  }

  /**
   * Create new community
   */
  async createCommunity(userId, data) {
    // Check slug uniqueness
    const existing = await communityRepository.findOne({ slug: data.slug });
    if (existing) {
      throw new ValidationError('A community with this slug already exists.');
    }

    const community = await communityRepository.create(data);

    // Add creator as Owner
    await communityMemberRepository.create({
      communityId: community._id,
      userId,
      role: 'Owner',
      status: 'Active'
    });

    return community;
  }

  /**
   * Get all public communities with optional search
   */
  async getCommunities({ search = '', page = 1, limit = 20 } = {}) {
    const filter = {
      visibility: 'Public',
      ...(search ? { name: { $regex: search, $options: 'i' } } : {})
    };

    const communities = await communityRepository.model
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return communities;
  }

  /**
   * Get community details by slug
   */
  async getCommunityBySlug(userId, slug) {
    const community = await communityRepository.findOne({ slug });
    if (!community) throw new NotFoundError('Community not found.');

    const memberCount = await communityMemberRepository.model
      .countDocuments({ communityId: community._id, status: 'Active' });

    let myMembership = null;
    if (userId) {
      myMembership = await communityMemberRepository.findOne({
        communityId: community._id,
        userId
      });
    }

    return { community, memberCount, myMembership };
  }

  /**
   * Join community (public = instant; private = pending approval)
   */
  async joinCommunity(userId, communityId) {
    const community = await communityRepository.findById(communityId);
    if (!community) throw new NotFoundError('Community not found.');

    const existing = await communityMemberRepository.findOne({ communityId, userId });
    if (existing) throw new ValidationError('You are already a member or pending approval.');

    const status = community.joinApproval ? 'PendingApproval' : 'Active';

    const member = await communityMemberRepository.create({
      communityId,
      userId,
      role: 'Researcher',
      status
    });

    if (status === 'Active') {
      socketGateway.emitToRoom(`community:${communityId}`, 'community:member_joined', { userId });
    }

    return { member, status };
  }

  /**
   * Create a post inside community
   */
  async createPost(userId, communityId, postData) {
    await this.checkPermission(userId, communityId);

    const post = await communityPostRepository.create({
      ...postData,
      communityId,
      authorId: userId
    });

    // Broadcast to community room
    socketGateway.emitToRoom(`community:${communityId}`, 'community:post', post);

    return post;
  }

  /**
   * Get paginated posts for a community
   */
  async getCommunityPosts(userId, communityId, { cursor, limit = 20 } = {}) {
    await this.checkPermission(userId, communityId);

    const filter = { communityId };
    if (cursor) filter._id = { $lt: cursor };

    const posts = await communityPostRepository.model
      .find(filter)
      .populate('authorId', 'firstName lastName avatar profileSlug')
      .sort({ _id: -1 })
      .limit(limit)
      .lean();

    return posts;
  }

  /**
   * Comment on a post
   */
  async createComment(userId, postId, content, parentId = null) {
    // Verify post exists
    const post = await communityPostRepository.findById(postId);
    if (!post) throw new NotFoundError('Post not found.');

    await this.checkPermission(userId, post.communityId);

    const comment = await communityCommentRepository.create({
      postId,
      authorId: userId,
      content,
      parentId: parentId || null
    });

    socketGateway.emitToRoom(`community:${post.communityId}`, 'community:comment', comment);

    return comment;
  }

  /**
   * Create event
   */
  async createEvent(userId, communityId, eventData) {
    await this.checkPermission(userId, communityId, ['Owner', 'Administrator', 'Moderator']);

    const event = await communityEventRepository.create({
      ...eventData,
      communityId,
      createdBy: userId
    });

    socketGateway.emitToRoom(`community:${communityId}`, 'community:event', event);

    return event;
  }

  /**
   * Create academic job posting
   */
  async createJob(userId, communityId, jobData) {
    await this.checkPermission(userId, communityId, ['Owner', 'Administrator', 'Moderator', 'Researcher']);

    const job = await communityJobRepository.create({
      ...jobData,
      communityId,
      postedBy: userId
    });

    return job;
  }

  /**
   * Create pinned announcement
   */
  async createAnnouncement(userId, communityId, announcementData) {
    await this.checkPermission(userId, communityId, ['Owner', 'Administrator', 'Moderator']);

    const announcement = await communityAnnouncementRepository.create({
      ...announcementData,
      communityId,
      authorId: userId
    });

    socketGateway.emitToRoom(`community:${communityId}`, 'community:announcement', announcement);

    return announcement;
  }
}

module.exports = new CommunityService();
