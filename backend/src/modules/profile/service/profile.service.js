const profileRepository = require('../repository/profile.repository');
const User = require('../../../models/User');
const { NotFoundError, AppError } = require('../../../common/errors/AppError');

class ProfileService {
  // Calculate profile completion percentage based on filled fields
  _calculateCompletion(profile, user) {
    let score = 20; // 20% baseline for registering and activating email

    if (user.firstName && user.lastName) score += 10;
    if (user.phone) score += 5;
    if (user.profileImage) score += 10;

    if (profile.bio) score += 10;
    if (profile.country) score += 5;

    // Academic or corporate workplace
    const org = profile.institution || profile.company;
    const dept = profile.department || profile.division;
    const pos = profile.designation || profile.position;

    if (org) score += 15;
    if (dept) score += 10;
    if (pos) score += 10;

    // Social Links
    let socialScore = 0;
    if (profile.socialLinks) {
      if (profile.socialLinks.orcid) socialScore += 1;
      if (profile.socialLinks.googleScholar) socialScore += 1;
      if (profile.socialLinks.researchGate) socialScore += 1;
      if (profile.socialLinks.linkedin) socialScore += 1;
      if (profile.socialLinks.website) socialScore += 1;
    }
    score += socialScore * 1; // max 5%

    return Math.min(100, score);
  }

  // Get user profile
  async getProfile(userId) {
    const profile = await profileRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Profile not found.');
    }
    return profile;
  }

  // Update user profile & sync matching fields to User model
  async updateProfile(userId, updateData) {
    const profile = await profileRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Profile not found.');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User account not found.');
    }

    // Update Profile Fields
    const fields = [
      'bio', 'country', 'institution', 'department', 'designation',
      'company', 'division', 'position'
    ];

    fields.forEach(field => {
      if (updateData[field] !== undefined) {
        profile[field] = updateData[field];
      }
    });

    // Update Social Links if provided
    if (updateData.socialLinks) {
      profile.socialLinks = {
        orcid: updateData.socialLinks.orcid !== undefined ? updateData.socialLinks.orcid : profile.socialLinks.orcid,
        googleScholar: updateData.socialLinks.googleScholar !== undefined ? updateData.socialLinks.googleScholar : profile.socialLinks.googleScholar,
        researchGate: updateData.socialLinks.researchGate !== undefined ? updateData.socialLinks.researchGate : profile.socialLinks.researchGate,
        linkedin: updateData.socialLinks.linkedin !== undefined ? updateData.socialLinks.linkedin : profile.socialLinks.linkedin,
        website: updateData.socialLinks.website !== undefined ? updateData.socialLinks.website : profile.socialLinks.website
      };
    }

    // Sync basic details back to User collection if applicable
    if (updateData.country) {
      user.country = updateData.country;
    }
    if (updateData.firstName) {
      user.firstName = updateData.firstName;
    }
    if (updateData.lastName) {
      user.lastName = updateData.lastName;
    }
    if (updateData.phone !== undefined) {
      user.phone = updateData.phone;
    }
    if (updateData.profileImage !== undefined) {
      user.profileImage = updateData.profileImage;
    }

    await user.save();

    // Recalculate profile completion percentage
    profile.profileCompletion = this._calculateCompletion(profile, user);
    await profile.save();

    return profile;
  }

  // Soft delete user profile and account
  async deleteProfile(userId, deletedBy = null) {
    const profile = await profileRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Profile not found.');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User account not found.');
    }

    // Soft delete both records
    await profileRepository.softDelete(profile._id, deletedBy || userId);
    
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.deletedBy = deletedBy || userId;
    user.status = 'suspended';
    user.isActive = false;
    await user.save();

    return { success: true };
  }
}

module.exports = new ProfileService();
