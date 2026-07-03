const followRepository = require('../repository/follow.repository');
const Follow = require('../model/Follow');
const User = require('../../../models/User');
const Profile = require('../../../models/Profile');
const CoAuthor = require('../../../models/CoAuthor');
const { ProfileCache } = require('../../../cache/cache.service');
const { NotFoundError, ValidationError, ConflictError } = require('../../../common/errors/AppError');
const logger = require('../../../common/logger/winston');
const mongoose = require('mongoose');

class FollowService {
  /**
   * Follow a researcher
   */
  async follow(followerId, targetUserId) {
    if (followerId.toString() === targetUserId.toString()) {
      throw new ValidationError('You cannot follow yourself.');
    }

    // Verify target researcher exists
    const targetUser = await User.findOne({ _id: targetUserId, isDeleted: { $ne: true } });
    if (!targetUser) {
      throw new NotFoundError('Target researcher not found.');
    }

    // Check if already following
    const isFollowing = await followRepository.isFollowing(followerId, targetUserId);
    if (isFollowing) {
      throw new ConflictError('You are already following this researcher.');
    }

    // Create follow relationship
    const followDoc = await followRepository.create({
      followerId,
      followingId: targetUserId
    });

    // Atomically increment counts in Profile collections
    await Promise.all([
      Profile.findOneAndUpdate({ userId: followerId }, { $inc: { followingCount: 1 } }, { upsert: true, new: true }),
      Profile.findOneAndUpdate({ userId: targetUserId }, { $inc: { followersCount: 1 } }, { upsert: true, new: true })
    ]);

    // Invalidate profile cache
    await Promise.all([
      ProfileCache.del(followerId.toString()),
      ProfileCache.del(targetUserId.toString())
    ]);

    // Send Real-Time Notification
    const notificationService = require('../../notifications/service/notification.service');
    const followerName = targetUser.firstName ? `${targetUser.firstName} ${targetUser.lastName}` : 'Someone'; // Wait! targetUser is the one being followed, we need followerUser details!
    
    // Let's query the follower details first
    const followerUser = await User.findById(followerId).select('firstName lastName username').lean();
    if (followerUser) {
      const fName = `${followerUser.firstName} ${followerUser.lastName}`;
      await notificationService.createNotification({
        recipientId: targetUserId,
        actorId: followerId,
        type: 'follow',
        title: 'New Follower',
        message: `${fName} started following you.`,
        targetType: 'User',
        targetId: followerId,
        targetUrl: `/profile/${followerUser.username}`
      }).catch(err => logger.error(`Failed to create follow notification: ${err.message}`));
    }

    return followDoc;
  }

  /**
   * Unfollow a researcher
   */
  async unfollow(followerId, targetUserId) {
    // Check if follow exists
    const followDoc = await Follow.findOne({ followerId, followingId: targetUserId });
    if (!followDoc) {
      throw new NotFoundError('You are not following this researcher.');
    }

    // Remove relationship
    await Follow.deleteOne({ _id: followDoc._id });

    // Atomically decrement counts
    await Promise.all([
      Profile.findOneAndUpdate(
        { userId: followerId, followingCount: { $gt: 0 } }, 
        { $inc: { followingCount: -1 } }, 
        { new: true }
      ),
      Profile.findOneAndUpdate(
        { userId: targetUserId, followersCount: { $gt: 0 } }, 
        { $inc: { followersCount: -1 } }, 
        { new: true }
      )
    ]);

    // Invalidate profile cache
    await Promise.all([
      ProfileCache.del(followerId.toString()),
      ProfileCache.del(targetUserId.toString())
    ]);

    return { success: true };
  }

  /**
   * Resolve a user by username OR profileSlug (handles both profile URL types)
   */
  async _resolveUser(usernameOrSlug) {
    const user = await User.findOne({
      $or: [
        { username: usernameOrSlug },
        { profileSlug: usernameOrSlug }
      ],
      isDeleted: { $ne: true }
    }).lean();
    if (!user) throw new NotFoundError('Researcher not found.');
    return user;
  }

  /**
   * Get followers of a researcher by username or profileSlug
   */
  async getFollowers(usernameOrSlug, queryOptions) {
    const user = await this._resolveUser(usernameOrSlug);
    return await followRepository.findFollowers(user._id, queryOptions);
  }

  /**
   * Get following list of a researcher by username or profileSlug
   */
  async getFollowing(usernameOrSlug, queryOptions) {
    const user = await this._resolveUser(usernameOrSlug);
    return await followRepository.findFollowing(user._id, queryOptions);
  }

  /**
   * Get mutual followers list between current user and target user
   */
  async getMutualFollowers(currentUserId, targetUsernameOrSlug, queryOptions) {
    const targetUser = await this._resolveUser(targetUsernameOrSlug);
    return await followRepository.getMutualFollowers(currentUserId, targetUser._id, queryOptions);
  }

  /**
   * Check follow status and return mutual followers metadata
   */
  async getFollowStatus(currentUserId, targetUserId) {
    const targetUser = await User.findOne({ _id: targetUserId, isDeleted: { $ne: true } }).lean();
    if (!targetUser) {
      throw new NotFoundError('Target researcher not found.');
    }

    const [isFollowing, mutualCount, mutualList, targetProfile, myProfile] = await Promise.all([
      followRepository.isFollowing(currentUserId, targetUserId),
      followRepository.countMutualFollowers(currentUserId, targetUserId),
      followRepository.getMutualFollowers(currentUserId, targetUserId, { limit: 3 }),
      Profile.findOne({ userId: targetUserId }).lean(),
      Profile.findOne({ userId: currentUserId }).lean()
    ]);

    return {
      isFollowing,
      followersCount: targetProfile?.followersCount || 0,
      followingCount: targetProfile?.followingCount || 0,
      mutualCount,
      mutualPreview: mutualList.docs.map(doc => ({
        userId: doc.user._id,
        fullName: doc.user.fullName,
        profileImage: doc.user.profileImage
      }))
    };
  }

  /**
   * Follow suggestions algorithm (dynamic ranking)
   */
  async getSuggestions(userId, { limit = 10, page = 1 } = {}) {
    const myProfile = await Profile.findOne({ userId }).lean();
    const myCoAuthors = await CoAuthor.find({ userId }).lean();
    const myFollows = await Follow.find({ followerId: userId }).lean();
    
    const followingIds = myFollows.map(f => f.followingId.toString());
    const excludedIds = [userId.toString(), ...followingIds];

    // Fetch candidate users
    const candidates = await User.find({
      _id: { $nin: excludedIds },
      isDeleted: { $ne: true },
      status: 'active'
    }).lean();

    const candidateIds = candidates.map(c => c._id);
    const candidateProfiles = await Profile.find({
      userId: { $in: candidateIds }
    }).lean();

    // Map profiles to userId for easy lookup
    const profileMap = new Map();
    candidateProfiles.forEach(p => profileMap.set(p.userId.toString(), p));

    // Calculate scoring for each candidate
    const suggestions = [];

    for (const cand of candidates) {
      const candIdStr = cand._id.toString();
      const candProfile = profileMap.get(candIdStr) || {};

      let score = 0;
      const reasons = [];

      // 1. Institution Match
      if (myProfile?.institution && candProfile.institution && 
          myProfile.institution.toLowerCase() === candProfile.institution.toLowerCase()) {
        score += 5;
        reasons.push('Same institution');
      }

      // 2. Country Match
      if (myProfile?.country && candProfile.country && 
          myProfile.country.toLowerCase() === candProfile.country.toLowerCase()) {
        score += 3;
        reasons.push('Same country');
      }

      // 3. Common Research Areas
      const myAreas = (myProfile?.researchAreas || []).map(a => a.name?.toLowerCase()).filter(Boolean);
      const candAreas = (candProfile.researchAreas || []).map(a => a.name?.toLowerCase()).filter(Boolean);
      const commonAreas = myAreas.filter(a => candAreas.includes(a));
      if (commonAreas.length > 0) {
        score += commonAreas.length * 4;
        reasons.push(`${commonAreas.length} shared research area(s)`);
      }

      // 4. Common Keywords
      const myKeywords = (myProfile?.keywords || []).map(k => k.name?.toLowerCase()).filter(Boolean);
      const candKeywords = (candProfile.keywords || []).map(k => k.name?.toLowerCase()).filter(Boolean);
      const commonKeywords = myKeywords.filter(k => candKeywords.includes(k));
      if (commonKeywords.length > 0) {
        score += commonKeywords.length * 2;
        reasons.push(`${commonKeywords.length} shared keyword(s)`);
      }

      // 5. Common Co-Authors
      const candCoAuthors = await CoAuthor.find({ userId: cand._id }).lean();
      const myCoNames = myCoAuthors.map(c => c.name.toLowerCase());
      const candCoNames = candCoAuthors.map(c => c.name.toLowerCase());
      const commonCoAuthors = myCoNames.filter(n => candCoNames.includes(n));
      if (commonCoAuthors.length > 0) {
        score += commonCoAuthors.length * 5;
        reasons.push(`${commonCoAuthors.length} mutual co-author(s)`);
      }

      // Check if candidate is co-author of current user
      if (myCoNames.includes(cand.fullName?.toLowerCase())) {
        score += 8;
        reasons.push('Indexed as co-author');
      }

      // 6. Mutual Followers (Calculate dynamic mutual count)
      const mutualCount = await followRepository.countMutualFollowers(userId, cand._id);
      if (mutualCount > 0) {
        score += mutualCount * 3;
        reasons.push(`${mutualCount} mutual follower(s)`);
      }

      // 7. Recent Activity (updated recently)
      const candUpdatedAt = candProfile.updatedAt || cand.updatedAt;
      if (candUpdatedAt && (Date.now() - new Date(candUpdatedAt).getTime() < 7 * 24 * 60 * 60 * 1000)) {
        score += 2;
      }

      // Retrieve dynamic mutual followers preview
      const mutualFollowersPreview = mutualCount > 0 
        ? await followRepository.getMutualFollowers(userId, cand._id, { limit: 3 })
        : { docs: [] };

      suggestions.push({
        user: {
          _id: cand._id,
          firstName: cand.firstName,
          lastName: cand.lastName,
          fullName: cand.fullName,
          username: cand.username,
          profileImage: cand.profileImage || candProfile.profileImage
        },
        profile: {
          headline: candProfile.headline || '',
          institution: candProfile.institution || '',
          country: candProfile.country || cand.country || '',
          researchAreas: candProfile.researchAreas || []
        },
        mutualFollowers: mutualFollowersPreview.docs.map(doc => ({
          _id: doc.user._id,
          fullName: doc.user.fullName,
          profileImage: doc.user.profileImage
        })),
        score,
        reason: reasons.slice(0, 2).join(', ') || 'Similar profile'
      });
    }

    // Sort by score descending
    suggestions.sort((a, b) => b.score - a.score);

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedSuggestions = suggestions.slice(startIndex, startIndex + limit);

    return {
      docs: paginatedSuggestions,
      total: suggestions.length,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(suggestions.length / limit)
    };
  }
}

module.exports = new FollowService();
