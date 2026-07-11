import ManualProfile from '../models/ManualProfile.js';
import GoogleScholarProfile from '../models/GoogleScholarProfile.js';
import MergedProfile from '../models/MergedProfile.js';
import Education from '../models/Education.js';
import Experience from '../models/Experience.js';
import ResearchMetrics from '../models/ResearchMetrics.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Publication from '../models/Publication.js';
import Project from '../models/Project.js';
import Award from '../models/Award.js';
import AppError from '../utils/AppError.js';

/**
 * Calculate the profile completion percentage and identify missing fields
 * @param {object} profile - The merged profile document
 * @param {string} userId - The user ID
 * @returns {Promise<object>} - Completion score and suggestions
 */
export const calculateProfileCompletion = async (profile, userId) => {
  const educationsCount = await Education.countDocuments({ user: userId, isDeleted: false });
  const experiencesCount = await Experience.countDocuments({ user: userId, isDeleted: false });

  const weights = {
    profilePhoto: { weight: 10, label: 'Profile Picture' },
    coverPhoto: { weight: 5, label: 'Cover Photo' },
    bio: { weight: 15, label: 'Biography' },
    designation: { weight: 10, label: 'Designation / Job Title' },
    institution: { weight: 10, label: 'Institution' },
    department: { weight: 5, label: 'Department' },
    country: { weight: 5, label: 'Country' },
    city: { weight: 5, label: 'City' },
    phone: { weight: 5, label: 'Phone Number' },
    website: { weight: 5, label: 'Personal Website' },
    socialLinks: { weight: 10, label: 'Social Links (LinkedIn, ORCID, GitHub)' },
    scholarId: { weight: 5, label: 'Google Scholar Linked' },
    education: { weight: 5, label: 'At least one Education entry' },
    experience: { weight: 5, label: 'At least one Work Experience entry' },
  };

  let score = 0;
  const missingFields = [];

  // Check simple fields
  if (profile.profilePhoto) score += weights.profilePhoto.weight; else missingFields.push(weights.profilePhoto.label);
  if (profile.coverPhoto) score += weights.coverPhoto.weight; else missingFields.push(weights.coverPhoto.label);
  if (profile.bio) score += weights.bio.weight; else missingFields.push(weights.bio.label);
  if (profile.designation) score += weights.designation.weight; else missingFields.push(weights.designation.label);
  if (profile.institution) score += weights.institution.weight; else missingFields.push(weights.institution.label);
  if (profile.department) score += weights.department.weight; else missingFields.push(weights.department.label);
  if (profile.country) score += weights.country.weight; else missingFields.push(weights.country.label);
  if (profile.city) score += weights.city.weight; else missingFields.push(weights.city.label);
  if (profile.phone) score += weights.phone.weight; else missingFields.push(weights.phone.label);
  if (profile.website) score += weights.website.weight; else missingFields.push(weights.website.label);

  // Check social links
  const hasSocial = profile.socialLinks && Object.values(profile.socialLinks).some(val => !!val);
  if (hasSocial) {
    score += weights.socialLinks.weight;
  } else {
    missingFields.push(weights.socialLinks.label);
  }

  // Check Google Scholar
  if (profile.scholarId) {
    score += weights.scholarId.weight;
  } else {
    missingFields.push(weights.scholarId.label);
  }

  // Check education and experience
  if (educationsCount > 0) {
    score += weights.education.weight;
  } else {
    missingFields.push(weights.education.label);
  }

  if (experiencesCount > 0) {
    score += weights.experience.weight;
  } else {
    missingFields.push(weights.experience.label);
  }

  return {
    percentage: score,
    missingFields,
  };
};

/**
 * Merge Google Scholar Profile and Manual Profile into a MergedProfile
 * @param {string} userId
 * @returns {Promise<object>} - The updated MergedProfile
 */
export const compileAndSaveMergedProfile = async (userId) => {
  // 1. Get or create manual profile
  let manual = await ManualProfile.findOne({ user: userId });
  if (!manual) {
    manual = await ManualProfile.create({ user: userId });
  }

  // 2. Get Scholar profile (if exists)
  const scholar = await GoogleScholarProfile.findOne({ user: userId });

  // Helper to check if a field is selected for importing from Scholar
  const isFieldSelected = (field) => {
    if (!scholar) return false;
    // If selectedFields is empty or not specified, default to true
    if (!scholar.selectedFields || scholar.selectedFields.length === 0) return true;
    return scholar.selectedFields.includes(field);
  };

  // 3. Formulate merged profile
  const mergedData = {
    bio: manual.bio || '',
    displayName: manual.displayName || (isFieldSelected('displayName') ? scholar?.name : '') || '',
    headline: manual.headline || (scholar?.affiliation && isFieldSelected('institution') ? `${scholar.affiliation} researcher` : '') || '',
    designation: manual.designation || '',
    department: manual.department || '',
    institution: manual.institution || (isFieldSelected('institution') ? scholar?.affiliation : '') || '',
    country: manual.country || '',
    city: manual.city || '',
    phone: manual.phone || '',
    website: manual.website || (isFieldSelected('website') ? scholar?.website : '') || '',
    profilePhoto: manual.profilePhoto || (isFieldSelected('profilePhoto') ? scholar?.photo : '') || '',
    coverPhoto: manual.coverPhoto || '',
    socialLinks: {
      linkedin: manual.socialLinks?.linkedin || '',
      twitter: manual.socialLinks?.twitter || '',
      github: manual.socialLinks?.github || '',
      researchgate: manual.socialLinks?.researchgate || '',
      orcid: manual.socialLinks?.orcid || '',
    },
    scholarId: scholar?.scholarId || '',
    totalCitations: scholar?.totalCitations || 0,
    hIndex: scholar?.hIndex || 0,
    i10Index: scholar?.i10Index || 0,
  };

  // 4. Calculate completion
  const completionInfo = await calculateProfileCompletion(mergedData, userId);
  mergedData.profileCompletion = completionInfo.percentage;

  // 5. Check verification criteria
  mergedData.isVerified = !!(scholar?.scholarId || manual.socialLinks?.orcid);

  // 6. Update user record
  await User.findByIdAndUpdate(userId, {
    isProfileComplete: completionInfo.percentage >= 80,
    isVerified: mergedData.isVerified,
  });

  // 7. Save or update MergedProfile
  const mergedProfile = await MergedProfile.findOneAndUpdate(
    { user: userId },
    mergedData,
    { new: true, upsert: true }
  );

  // 8. Keep legacy/main Profile model in sync for search, discovery, etc.
  const totalPublications = await Publication.countDocuments({ user: userId, isDeleted: false });
  await Profile.findOneAndUpdate(
    { user: userId },
    {
      ...mergedData,
      publications: totalPublications,
      citations: mergedData.totalCitations,
    },
    { upsert: true }
  );

  return mergedProfile;
};

/**
 * Get full profile details for a researcher
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const getFullProfileDetails = async (userId) => {
  // Ensure the merged profile is compiled and legacy Profile is kept in sync
  await compileAndSaveMergedProfile(userId);

  // Fetch from legacy/main Profile model and populate everything
  const profile = await Profile.findOne({ user: userId })
    .populate('user', 'fullName email')
    .populate('academicProfile')
    .populate('researchMetrics')
    .populate({
      path: 'researchAreas',
      populate: { path: 'researchArea' }
    })
    .populate({
      path: 'keywords',
      populate: { path: 'keyword' }
    })
    .populate('educationList')
    .populate('experienceList')
    .populate('projectList')
    .populate('achievementList');

  const educations = await Education.find({ user: userId, isDeleted: false }).sort({ sortOrder: 1, startYear: -1 });
  const experiences = await Experience.find({ user: userId, isDeleted: false }).sort({ sortOrder: 1, startYear: -1 });
  const publications = await Publication.find({ user: userId, isDeleted: false }).sort({ publicationYear: -1 });
  const projects = await Project.find({ owner: userId }).sort({ startDate: -1 });
  const achievements = await Award.find({ user: userId, isDeleted: false }).sort({ date: -1 });
  
  let metrics = await ResearchMetrics.findOne({ user: userId });
  if (!metrics) {
    metrics = await ResearchMetrics.create({ user: userId });
  }

  return {
    profile,
    educations,
    experiences,
    metrics,
    publications,
    projects,
    achievements,
  };
};
