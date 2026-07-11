import * as profileService from '../services/profile.service.js';
import * as scholarService from '../services/scholar.service.js';
import * as uploadService from '../services/upload.service.js';
import * as followService from '../services/follow.service.js';
import ManualProfile from '../models/ManualProfile.js';
import GoogleScholarProfile from '../models/GoogleScholarProfile.js';
import GoogleScholarCoAuthor from '../models/GoogleScholarCoAuthor.js';
import ScholarPublication from '../models/ScholarPublication.js';
import ResearchMetrics from '../models/ResearchMetrics.js';
import SyncLog from '../models/SyncLog.js';
import Education from '../models/Education.js';
import Experience from '../models/Experience.js';
import Award from '../models/Award.js';
import Certification from '../models/Certification.js';
import ResearchIdentity from '../models/ResearchIdentity.js';
import AcademicProfile from '../models/AcademicProfile.js';
import ProfileView from '../models/ProfileView.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Publication from '../models/Publication.js';
import ResearchArea from '../models/ResearchArea.js';
import Keyword from '../models/Keyword.js';
import UserResearchArea from '../models/UserResearchArea.js';
import UserKeyword from '../models/UserKeyword.js';
import KeywordHistory from '../models/KeywordHistory.js';
import ActivityLog from '../models/ActivityLog.js';
import AppError from '../utils/AppError.js';

/**
 * Get logged-in user's profile, education, experience, and metrics
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profileDetails = await profileService.getFullProfileDetails(userId);
    
    // Fetch research identities
    let identities = await ResearchIdentity.findOne({ user: userId });
    if (!identities) {
      identities = await ResearchIdentity.create({ user: userId });
    }

    res.status(200).json({
      status: 'success',
      data: {
        ...profileDetails,
        identities,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get public profile of another researcher
 */
export const getProfileByUserId = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const profileDetails = await profileService.getFullProfileDetails(targetUserId);

    let identities = await ResearchIdentity.findOne({ user: targetUserId });

    // Check if the requesting user follows this target researcher
    const Follow = (await import('../models/Follow.js')).default;
    const followRecord = await Follow.findOne({
      followerId: req.user._id,
      followingId: targetUserId
    });

    res.status(200).json({
      status: 'success',
      data: {
        ...profileDetails,
        identities,
        isFollowing: !!followRecord
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update researcher's basic profile details (manual overrides)
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const updateFields = req.body;

    let manual = await ManualProfile.findOne({ user: userId });
    if (!manual) {
      manual = new ManualProfile({ user: userId });
    }

    // Assign fields
    const allowedFields = [
      'bio', 'displayName', 'headline', 'designation',
      'department', 'institution', 'country', 'city', 'phone', 'website'
    ];

    allowedFields.forEach(field => {
      if (updateFields[field] !== undefined) {
        manual[field] = updateFields[field];
      }
    });

    // Handle social links map
    if (updateFields.socialLinks) {
      manual.socialLinks = {
        ...manual.socialLinks,
        ...updateFields.socialLinks,
      };

      // Also sync to ResearchIdentity if socialLinks are updated
      await ResearchIdentity.findOneAndUpdate(
        { user: userId },
        {
          linkedin: updateFields.socialLinks.linkedin,
          orcid: updateFields.socialLinks.orcid,
          researchGate: updateFields.socialLinks.researchgate,
          github: updateFields.socialLinks.github,
        },
        { upsert: true }
      );
    }

    await manual.save();

    // Recompile merged profile
    const merged = await profileService.compileAndSaveMergedProfile(userId);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: merged,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload profile photo
 */
export const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    const userId = req.user._id;
    const uploadType = req.path.includes('cover') ? 'cover-image' : 'profile-image';

    const uploadedFile = await uploadService.uploadFileToCloudinary(
      req.file,
      uploadType,
      { profileId: userId },
      userId
    );

    let manual = await ManualProfile.findOne({ user: userId });
    if (!manual) {
      manual = new ManualProfile({ user: userId });
    }

    if (uploadType === 'cover-image') {
      manual.coverPhoto = uploadedFile.secureUrl;
    } else {
      manual.profilePhoto = uploadedFile.secureUrl;
    }

    await manual.save();

    // Compile merged profile
    const merged = await profileService.compileAndSaveMergedProfile(userId);

    res.status(200).json({
      status: 'success',
      message: `${uploadType === 'cover-image' ? 'Cover' : 'Profile'} photo updated successfully`,
      data: merged,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Education CRUD
 */
export const addEducation = async (req, res, next) => {
  try {
    const education = await Education.create({
      user: req.user._id,
      ...req.body,
    });

    await profileService.compileAndSaveMergedProfile(req.user._id);

    res.status(201).json({
      status: 'success',
      data: education,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEducation = async (req, res, next) => {
  try {
    const education = await Education.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!education) {
      return next(new AppError('Education record not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: education,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEducation = async (req, res, next) => {
  try {
    const education = await Education.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isDeleted: true },
      { new: true }
    );

    if (!education) {
      return next(new AppError('Education record not found', 404));
    }

    await profileService.compileAndSaveMergedProfile(req.user._id);

    res.status(200).json({
      status: 'success',
      message: 'Education record deleted',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Experience CRUD
 */
export const addExperience = async (req, res, next) => {
  try {
    const experience = await Experience.create({
      user: req.user._id,
      ...req.body,
    });

    await profileService.compileAndSaveMergedProfile(req.user._id);

    res.status(201).json({
      status: 'success',
      data: experience,
    });
  } catch (error) {
    next(error);
  }
};

export const updateExperience = async (req, res, next) => {
  try {
    const experience = await Experience.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!experience) {
      return next(new AppError('Experience record not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: experience,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteExperience = async (req, res, next) => {
  try {
    const experience = await Experience.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isDeleted: true },
      { new: true }
    );

    if (!experience) {
      return next(new AppError('Experience record not found', 404));
    }

    await profileService.compileAndSaveMergedProfile(req.user._id);

    res.status(200).json({
      status: 'success',
      message: 'Experience record deleted',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Awards CRUD
 */
export const addAward = async (req, res, next) => {
  try {
    const award = await Award.create({
      user: req.user._id,
      ...req.body,
    });
    res.status(201).json({ status: 'success', data: award });
  } catch (error) {
    next(error);
  }
};

export const updateAward = async (req, res, next) => {
  try {
    const award = await Award.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!award) return next(new AppError('Award record not found', 404));
    res.status(200).json({ status: 'success', data: award });
  } catch (error) {
    next(error);
  }
};

export const deleteAward = async (req, res, next) => {
  try {
    const award = await Award.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isDeleted: true },
      { new: true }
    );
    if (!award) return next(new AppError('Award record not found', 404));
    res.status(200).json({ status: 'success', message: 'Award deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * Certifications CRUD
 */
export const addCertification = async (req, res, next) => {
  try {
    const cert = await Certification.create({
      user: req.user._id,
      ...req.body,
    });
    res.status(201).json({ status: 'success', data: cert });
  } catch (error) {
    next(error);
  }
};

export const updateCertification = async (req, res, next) => {
  try {
    const cert = await Certification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!cert) return next(new AppError('Certification not found', 404));
    res.status(200).json({ status: 'success', data: cert });
  } catch (error) {
    next(error);
  }
};

export const deleteCertification = async (req, res, next) => {
  try {
    const cert = await Certification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isDeleted: true },
      { new: true }
    );
    if (!cert) return next(new AppError('Certification not found', 404));
    res.status(200).json({ status: 'success', message: 'Certification deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * Google Scholar Link & Sync
 */
export const connectGoogleScholar = async (req, res, next) => {
  try {
    const { scholarId: inputId } = req.body;
    if (!inputId) {
      return next(new AppError('Google Scholar ID or URL is required', 400));
    }

    const scholarId = scholarService.extractScholarId(inputId) || inputId;
    const userId = req.user._id;

    // Link in ResearchIdentity
    await ResearchIdentity.findOneAndUpdate(
      { user: userId },
      { googleScholar: scholarId },
      { upsert: true }
    );

    // Link in AcademicProfile
    await AcademicProfile.findOneAndUpdate(
      { user: userId },
      { googleScholar: scholarId },
      { upsert: true }
    );

    // Trigger sync
    const syncResults = await scholarService.syncGoogleScholarData(userId, scholarId);

    res.status(200).json({
      status: 'success',
      message: 'Google Scholar connected and synced successfully',
      data: syncResults,
    });
  } catch (error) {
    next(error);
  }
};

export const linkGoogleScholar = async (req, res, next) => {
  try {
    const { url, scholarId, scholarUrl, input } = req.body;
    const inputId = scholarId || url || scholarUrl || input;
    if (!inputId) {
      return next(new AppError('Google Scholar ID or URL is required', 400));
    }

    const extractedId = scholarService.extractScholarId(inputId) || inputId;
    const userId = req.user._id;

    // Link in ResearchIdentity
    await ResearchIdentity.findOneAndUpdate(
      { user: userId },
      { googleScholar: extractedId },
      { upsert: true }
    );

    // Link in AcademicProfile
    await AcademicProfile.findOneAndUpdate(
      { user: userId },
      { googleScholar: extractedId },
      { upsert: true }
    );

    // Trigger sync
    const syncResults = await scholarService.syncGoogleScholarData(userId, extractedId);

    res.status(200).json({
      status: 'success',
      message: 'Google Scholar linked and synced successfully',
      data: syncResults,
    });
  } catch (error) {
    next(error);
  }
};

export const syncGoogleScholar = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const identity = await ResearchIdentity.findOne({ user: userId });

    if (!identity || !identity.googleScholar) {
      return next(new AppError('No Google Scholar ID linked to this account', 400));
    }

    // Ensure AcademicProfile also has it
    await AcademicProfile.findOneAndUpdate(
      { user: userId },
      { googleScholar: identity.googleScholar },
      { upsert: true }
    );

    const syncResults = await scholarService.syncGoogleScholarData(userId, identity.googleScholar);

    res.status(200).json({
      status: 'success',
      message: 'Google Scholar synced successfully',
      data: syncResults,
    });
  } catch (error) {
    next(error);
  }
};

export const getGoogleScholarStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const scholarProfile = await GoogleScholarProfile.findOne({ user: userId });
    const lastSyncLog = await SyncLog.findOne({ user: userId, provider: 'google-scholar' }).sort({ timestamp: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        isConnected: !!scholarProfile,
        connected: !!scholarProfile,
        scholarId: scholarProfile?.scholarId || '',
        providerUserId: scholarProfile?.scholarId || '',
        lastSync: scholarProfile?.lastSync || null,
        lastSyncedAt: scholarProfile?.lastSync || null,
        lastSyncStatus: lastSyncLog?.status || 'never',
        syncStatus: lastSyncLog?.status || 'never',
        lastSyncRecords: lastSyncLog?.recordsSynced || 0,
        lastSyncError: lastSyncLog?.errorMessage || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get profile completion status
 */
export const getProfileCompletion = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const merged = await profileService.compileAndSaveMergedProfile(userId);
    const completionInfo = await profileService.calculateProfileCompletion(merged, userId);

    res.status(200).json({
      status: 'success',
      data: completionInfo,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Preview Google Scholar profile data before import
 */
export const previewGoogleScholar = async (req, res, next) => {
  try {
    const { input } = req.query;
    if (!input) {
      return next(new AppError('Input query or URL or ID is required', 400));
    }

    const scholarId = scholarService.extractScholarId(input);

    if (!scholarId) {
      // It's a name or query, perform search
      const profiles = await scholarService.searchScholarAuthors(input);
      return res.status(200).json({
        status: 'success',
        data: {
          type: 'search_results',
          profiles
        }
      });
    }

    // It's a valid Scholar ID, fetch details for preview
    const payload = await scholarService.fetchScholarProfilePayload(scholarId);
    const authorData = payload.author || {};
    const articles = payload.articles || [];
    const coAuthors = payload.co_authors || [];
    const citationTable = authorData.cited_by?.table || [];

    const profile = {
      fullName: authorData.name || '',
      affiliation: authorData.affiliations || '',
      institution: authorData.affiliations || '',
      department: '',
      profilePhoto: authorData.thumbnail || '',
      interests: authorData.interests ? authorData.interests.map(i => i.title) : [],
      website: authorData.website || '',
      homepage: authorData.website || ''
    };

    const metrics = {
      totalPublications: articles.length,
      totalCitations: citationTable[0]?.citations?.all || 0,
      hIndex: citationTable[1]?.h_index?.all || 0,
      i10Index: citationTable[2]?.i10_index?.all || 0
    };

    const publications = articles.map(art => ({
      title: art.title || '',
      authors: art.authors || '',
      journal: art.publication || '',
      publicationYear: art.year || null,
      citationCount: art.cited_by?.value || 0,
      link: art.link || ''
    }));

    const formattedCoAuthors = coAuthors.map(ca => ({
      name: ca.name,
      scholarId: ca.author_id,
      thumbnail: ca.thumbnail,
      link: ca.link
    }));

    res.status(200).json({
      status: 'success',
      data: {
        type: 'profile_preview',
        authorId: scholarId,
        profile,
        metrics,
        publications,
        coAuthors: formattedCoAuthors
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Import Google Scholar data selectively from the wizard
 */
export const importGoogleScholar = async (req, res, next) => {
  try {
    const { authorId, selectedPubTitles, selectedFields } = req.body;
    if (!authorId) {
      return next(new AppError('Google Scholar ID is required', 400));
    }

    const userId = req.user._id;

    // Link in ResearchIdentity
    await ResearchIdentity.findOneAndUpdate(
      { user: userId },
      { googleScholar: authorId },
      { upsert: true }
    );

    const syncResults = await scholarService.importGoogleScholarData(userId, {
      authorId,
      selectedPubTitles,
      selectedFields
    });

    res.status(200).json({
      status: 'success',
      message: 'Google Scholar profile imported successfully',
      data: syncResults
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Google Scholar Profile document from MongoDB
 */
export const getGoogleScholarProfileData = async (req, res, next) => {
  try {
    const profile = await GoogleScholarProfile.findOne({ user: req.user._id });
    res.status(200).json({
      status: 'success',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Google Scholar Publications from MongoDB
 */
export const getGoogleScholarPublicationsData = async (req, res, next) => {
  try {
    const publications = await ScholarPublication.find({ user: req.user._id, isDeleted: false });
    res.status(200).json({
      status: 'success',
      data: publications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Research Metrics from MongoDB
 */
export const getResearchMetrics = async (req, res, next) => {
  try {
    const metrics = await ResearchMetrics.findOne({ user: req.user._id });
    res.status(200).json({
      status: 'success',
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Connect ORCID iD
 */
export const connectOrcid = async (req, res, next) => {
  try {
    const { orcid } = req.body;
    const userId = req.user._id;

    // Link in ResearchIdentity
    await ResearchIdentity.findOneAndUpdate(
      { user: userId },
      { orcid: orcid || '' },
      { upsert: true }
    );

    // Link in AcademicProfile
    await AcademicProfile.findOneAndUpdate(
      { user: userId },
      { orcid: orcid || '' },
      { upsert: true }
    );

    // Recalculate merged profile
    const merged = await profileService.compileAndSaveMergedProfile(userId);

    res.status(200).json({
      status: 'success',
      message: orcid ? 'ORCID connected successfully' : 'ORCID disconnected successfully',
      data: merged
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Connect Scopus Author ID
 */
export const connectScopus = async (req, res, next) => {
  try {
    const { scopusId } = req.body;
    const userId = req.user._id;

    // Link in ResearchIdentity
    await ResearchIdentity.findOneAndUpdate(
      { user: userId },
      { scopus: scopusId || '' },
      { upsert: true }
    );

    // Link in AcademicProfile
    await AcademicProfile.findOneAndUpdate(
      { user: userId },
      { scopusId: scopusId || '' },
      { upsert: true }
    );

    const merged = await profileService.compileAndSaveMergedProfile(userId);

    res.status(200).json({
      status: 'success',
      message: scopusId ? 'Scopus ID connected successfully' : 'Scopus ID disconnected successfully',
      data: merged
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Connect ResearchGate Profile
 */
export const connectResearchGate = async (req, res, next) => {
  try {
    const { researchGateUrl } = req.body;
    const userId = req.user._id;

    // Link in ResearchIdentity
    await ResearchIdentity.findOneAndUpdate(
      { user: userId },
      { researchGate: researchGateUrl || '' },
      { upsert: true }
    );

    // Link in AcademicProfile
    await AcademicProfile.findOneAndUpdate(
      { user: userId },
      { researchGate: researchGateUrl || '' },
      { upsert: true }
    );

    const merged = await profileService.compileAndSaveMergedProfile(userId);

    res.status(200).json({
      status: 'success',
      message: researchGateUrl ? 'ResearchGate connected successfully' : 'ResearchGate disconnected successfully',
      data: merged
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Profile (Soft Delete)
 */
export const deleteProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Soft delete user profile
    await ManualProfile.findOneAndUpdate({ user: userId }, { isDeleted: true });
    await GoogleScholarProfile.findOneAndUpdate({ user: userId }, { isDeleted: true });
    await AcademicProfile.findOneAndUpdate({ user: userId }, { isDeleted: true });
    await ResearchIdentity.findOneAndUpdate({ user: userId }, { isDeleted: true });

    // Soft delete user account
    await User.findByIdAndUpdate(userId, { isDeleted: true, status: 'deleted' });

    res.status(200).json({
      status: 'success',
      message: 'Researcher profile and account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Follow a Researcher (via req.body.userId)
 */
export const followResearcherDirect = async (req, res, next) => {
  try {
    const followerId = req.user._id;
    const { userId: followingId } = req.body;

    if (!followingId) {
      return next(new AppError('Target User ID to follow is required', 400));
    }

    const { follow } = await followService.followUser(followerId, followingId);

    res.status(200).json({
      status: 'success',
      message: 'Followed researcher successfully',
      data: follow
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unfollow a Researcher (via req.body.userId)
 */
export const unfollowResearcherDirect = async (req, res, next) => {
  try {
    const followerId = req.user._id;
    const { userId: followingId } = req.body;

    if (!followingId) {
      return next(new AppError('Target User ID to unfollow is required', 400));
    }

    await followService.unfollowUser(followerId, followingId);

    res.status(200).json({
      status: 'success',
      message: 'Unfollowed researcher successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Share a Profile
 */
export const shareProfileDirect = async (req, res, next) => {
  try {
    const { profileId } = req.body;
    const userId = req.user._id;

    // Log the share event as an activity log
    await ActivityLog.create({
      user: userId,
      activity: `Shared profile: ${profileId || userId}`,
      ipAddress: req.ip,
      browser: req.headers['user-agent'] || '',
    });

    res.status(200).json({
      status: 'success',
      data: {
        shareUrl: `http://localhost:5173/profile/user/${profileId || userId}`
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Compare local data with Google Scholar before merge
 */
export const compareGoogleScholar = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const identity = await ResearchIdentity.findOne({ user: userId });

    if (!identity || !identity.googleScholar) {
      return next(new AppError('No Google Scholar ID linked to this account', 400));
    }

    const comparison = await scholarService.compareScholarData(userId, identity.googleScholar);

    res.status(200).json({
      status: 'success',
      data: comparison,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disconnect/Unlink Google Scholar profile
 */
export const disconnectGoogleScholar = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Clear Scholar ID in ResearchIdentity
    await ResearchIdentity.findOneAndUpdate(
      { user: userId },
      { googleScholar: '' }
    );

    // 2. Clear Scholar ID in AcademicProfile if present
    await AcademicProfile.findOneAndUpdate(
      { user: userId },
      { googleScholar: '' }
    );

    // 3. Delete GoogleScholarProfile document
    await GoogleScholarProfile.findOneAndDelete({ user: userId });

    // 4. Soft delete synced publications from ScholarPublication
    await ScholarPublication.updateMany({ user: userId }, { isDeleted: true });

    // 5. Recompile merged profile
    await profileService.compileAndSaveMergedProfile(userId);

    // 6. Get full updated profile details to return
    const profileDetails = await profileService.getFullProfileDetails(userId);

    res.status(200).json({
      status: 'success',
      message: 'Google Scholar profile disconnected successfully',
      data: profileDetails,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validate Scholar ID format and check preview capability
 */
export const validateScholarId = async (req, res, next) => {
  try {
    const { scholarId } = req.body;
    if (!scholarId) {
      return next(new AppError('Scholar ID is required', 400));
    }

    const cleanId = scholarService.extractScholarId(scholarId) || scholarId;
    
    if (cleanId.length === 12 && /^[a-zA-Z0-9-_]+$/.test(cleanId)) {
      return res.status(200).json({
        status: 'success',
        data: {
          isValid: true,
          scholarId: cleanId
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        isValid: false,
        message: 'Invalid Google Scholar ID format'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH handler for Profile (supports EditProfileModal)
 */
export const patchProfile = async (req, res, next) => {
  return updateProfile(req, res, next);
};

/**
 * PATCH handler for Education adding (supports EditProfileModal)
 */
export const patchEducation = async (req, res, next) => {
  return addEducation(req, res, next);
};

/**
 * PATCH handler for Experience adding (supports EditProfileModal)
 */
export const patchExperience = async (req, res, next) => {
  return addExperience(req, res, next);
};

/**
 * PATCH handler for Publications (supports EditProfileModal)
 */
export const patchPublications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id, ...pubData } = req.body;

    let publication;
    if (id) {
      // Update existing publication
      publication = await Publication.findOneAndUpdate(
        { _id: id, user: userId },
        pubData,
        { new: true, runValidators: true }
      );
      if (!publication) {
        return next(new AppError('Publication not found', 404));
      }
    } else {
      // Create new publication
      const authorList = pubData.authors 
        ? pubData.authors.split(',').map((name, index) => ({
            name: name.trim(),
            authorName: name.trim(),
            user: index === 0 ? userId : null,
            authorOrder: index + 1
          })) 
        : [{ name: req.user.fullName || 'Author', authorName: req.user.fullName || 'Author', user: userId, authorOrder: 1 }];

      publication = await Publication.create({
        user: userId,
        ...pubData,
        authors: authorList
      });
    }

    // Recompile
    await profileService.compileAndSaveMergedProfile(userId);

    res.status(200).json({
      status: 'success',
      data: publication,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH handler for Research Areas & Keywords (supports EditProfileModal)
 */
export const patchResearch = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { researchAreas = [], keywords = [] } = req.body;

    // 1. Process Research Areas
    const areaLinks = [];
    for (const name of researchAreas) {
      if (!name) continue;
      const slug = name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s-]+/g, '-');
      let area = await ResearchArea.findOne({ slug });
      if (!area) {
        area = await ResearchArea.create({ areaName: name.trim() });
      }
      areaLinks.push(area._id);
    }

    // Replace current user research areas
    await UserResearchArea.deleteMany({ user: userId });
    if (areaLinks.length > 0) {
      await UserResearchArea.insertMany(
        areaLinks.map(areaId => ({
          user: userId,
          researchArea: areaId,
          source: 'manual',
        }))
      );
    }

    // 2. Process Keywords
    const keywordLinks = [];
    for (const name of keywords) {
      if (!name) continue;
      const slug = name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s-]+/g, '-');
      let kw = await Keyword.findOne({ slug });
      if (!kw) {
        kw = await Keyword.create({ keyword: name.trim() });
      }
      keywordLinks.push(kw);
    }

    // Replace current user keywords
    await UserKeyword.deleteMany({ user: userId });
    if (keywordLinks.length > 0) {
      await UserKeyword.insertMany(
        keywordLinks.map(kw => ({
          user: userId,
          keyword: kw._id,
          source: 'manual',
        }))
      );

      // Log keyword history
      for (const kw of keywordLinks) {
        const existing = await KeywordHistory.findOne({ user: userId, keyword: kw.keyword, action: 'added' });
        if (!existing) {
          await KeywordHistory.create({
            user: userId,
            keyword: kw.keyword,
            action: 'added',
          });
        }
      }
    }

    // Compile profile
    const merged = await profileService.compileAndSaveMergedProfile(userId);

    res.status(200).json({
      status: 'success',
      message: 'Research interests and keywords updated successfully',
      data: merged,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET Co-authors
 */
export const getCoAuthors = async (req, res, next) => {
  try {
    const coauthors = await GoogleScholarCoAuthor.find({ user: req.user._id });
    res.status(200).json({
      status: 'success',
      data: coauthors,
    });
  } catch (error) {
    next(error);
  }
};
