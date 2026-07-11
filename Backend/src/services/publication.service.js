import Publication from '../models/Publication.js';
import PublicationFile from '../models/PublicationFile.js';
import PublicationVersion from '../models/PublicationVersion.js';
import PublicationAnalytics from '../models/PublicationAnalytics.js';
import PublicationView from '../models/PublicationView.js';
import PublicationDownload from '../models/PublicationDownload.js';
import PublicationBookmark from '../models/PublicationBookmark.js';
import PublicationLike from '../models/PublicationLike.js';
import PublicationComment from '../models/PublicationComment.js';
import ResearchMetrics from '../models/ResearchMetrics.js';
import AppError from '../utils/AppError.js';
import { deleteFileFromCloudinary } from './upload.service.js';

/**
 * Create a new publication and initialize version history + analytics
 * @param {string} userId
 * @param {object} publicationData
 * @returns {Promise<object>}
 */
export const createPublication = async (userId, publicationData) => {
  const publication = await Publication.create({
    user: userId,
    ...publicationData,
  });

  // Initialize analytics
  await PublicationAnalytics.create({
    publication: publication._id,
  });

  // Create version 1 snapshot
  await PublicationVersion.create({
    publication: publication._id,
    versionNumber: 1,
    changeSummary: 'Initial publication creation',
    metadataSnapshot: publication.toObject(),
  });

  // Trigger async recalculation of researcher metrics
  recalculateResearcherMetrics(userId).catch(err => console.error('Metrics recalculation error:', err));

  return publication;
};

/**
 * Update a publication and save a version history snapshot
 * @param {string} userId
 * @param {string} publicationId
 * @param {object} updateData
 * @param {string} changeSummary
 * @returns {Promise<object>}
 */
export const updatePublication = async (userId, publicationId, updateData, changeSummary = 'Metadata update') => {
  const publication = await Publication.findOne({ _id: publicationId, user: userId });
  if (!publication) {
    throw new AppError('Publication not found or unauthorized', 404);
  }

  // Increment version number
  const nextVersion = publication.version + 1;

  // Apply updates
  Object.assign(publication, updateData);
  publication.version = nextVersion;
  await publication.save();

  // Create version snapshot
  await PublicationVersion.create({
    publication: publication._id,
    versionNumber: nextVersion,
    changeSummary,
    metadataSnapshot: publication.toObject(),
  });

  // Trigger async metrics update
  recalculateResearcherMetrics(userId).catch(err => console.error('Metrics recalculation error:', err));

  return publication;
};

/**
 * Soft delete a publication and remove it from metrics
 * @param {string} userId
 * @param {string} publicationId
 * @returns {Promise<boolean>}
 */
export const deletePublication = async (userId, publicationId) => {
  const publication = await Publication.findOne({ _id: publicationId, user: userId });
  if (!publication) {
    throw new AppError('Publication not found or unauthorized', 404);
  }

  publication.isDeleted = true;
  await publication.save();

  // Trigger async metrics update
  recalculateResearcherMetrics(userId).catch(err => console.error('Metrics recalculation error:', err));

  return true;
};

/**
 * Rollback a publication to a specific historical version
 * @param {string} userId
 * @param {string} publicationId
 * @param {number} versionNumber
 * @returns {Promise<object>}
 */
export const rollbackPublicationVersion = async (userId, publicationId, versionNumber) => {
  const publication = await Publication.findOne({ _id: publicationId, user: userId });
  if (!publication) {
    throw new AppError('Publication not found or unauthorized', 404);
  }

  const historicalVersion = await PublicationVersion.findOne({
    publication: publicationId,
    versionNumber,
  });

  if (!historicalVersion) {
    throw new AppError(`Version ${versionNumber} not found for this publication`, 404);
  }

  const snapshot = historicalVersion.metadataSnapshot;

  // Restore fields from snapshot (excluding metadata fields like version, timestamps)
  const fieldsToRestore = [
    'title', 'authors', 'abstract', 'keywords', 'journal', 'conference',
    'publisher', 'doi', 'volume', 'issue', 'pages', 'publicationDate',
    'publicationType', 'visibility', 'license', 'status'
  ];

  fieldsToRestore.forEach(field => {
    if (snapshot[field] !== undefined) {
      publication[field] = snapshot[field];
    }
  });

  // Increment version count for the rollback action itself
  publication.version += 1;
  await publication.save();

  // Create new version snapshot for the rollback
  await PublicationVersion.create({
    publication: publication._id,
    versionNumber: publication.version,
    changeSummary: `Rolled back to version ${versionNumber}`,
    metadataSnapshot: publication.toObject(),
  });

  return publication;
};

/**
 * Attach a file to a publication
 * @param {string} publicationId
 * @param {object} fileInfo - Multer file response from Cloudinary/Local upload
 * @param {string} fileType
 * @returns {Promise<object>}
 */
export const attachFileToPublication = async (publicationId, fileInfo, fileType) => {
  const pubFile = await PublicationFile.create({
    publication: publicationId,
    fileType,
    url: fileInfo.secureUrl || fileInfo.url,
    publicId: fileInfo.publicId,
    fileName: fileInfo.fileName || fileInfo.originalName,
    fileSize: fileInfo.fileSize || fileInfo.size,
  });

  return pubFile;
};

/**
 * Remove a file from a publication
 * @param {string} fileId
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export const removePublicationFile = async (fileId, userId) => {
  const pubFile = await PublicationFile.findById(fileId).populate('publication');
  if (!pubFile) {
    throw new AppError('File not found', 404);
  }

  if (pubFile.publication.user.toString() !== userId.toString()) {
    throw new AppError('Unauthorized to delete this file', 403);
  }

  // Delete from Cloudinary / Local disk
  if (pubFile.publicId) {
    await deleteFileFromCloudinary(pubFile.publicId);
  }

  await PublicationFile.deleteOne({ _id: fileId });
  return true;
};

/**
 * Track a publication view event
 */
export const trackView = async (publicationId, viewData) => {
  await PublicationView.create({
    publication: publicationId,
    user: viewData.userId || null,
    ip: viewData.ip || '',
    country: viewData.country || 'Unknown',
    institution: viewData.institution || 'Unknown',
  });

  await PublicationAnalytics.findOneAndUpdate(
    { publication: publicationId },
    { $inc: { views: 1 } },
    { upsert: true }
  );
};

/**
 * Track a publication download event
 */
export const trackDownload = async (publicationId, downloadData) => {
  await PublicationDownload.create({
    publication: publicationId,
    user: downloadData.userId || null,
    ip: downloadData.ip || '',
    country: downloadData.country || 'Unknown',
    institution: downloadData.institution || 'Unknown',
  });

  await PublicationAnalytics.findOneAndUpdate(
    { publication: publicationId },
    { $inc: { downloads: 1 } },
    { upsert: true }
  );

  // Recalculate research metrics citation/reads stats
  const pub = await Publication.findById(publicationId);
  if (pub) {
    recalculateResearcherMetrics(pub.user).catch(err => console.error(err));
  }
};

/**
 * Query publications with advanced search, pagination, and sorting
 * @param {object} queryParams
 * @returns {Promise<object>}
 */
export const searchPublications = async (queryParams) => {
  const {
    q = '',
    author = '',
    doi = '',
    journal = '',
    keyword = '',
    publisher = '',
    year,
    country = '',
    sort = 'latest',
    filter = '',
    page = 1,
    limit = 10,
  } = queryParams;

  const filterQuery = { isDeleted: false, status: 'Published' };

  // Free text search across title, abstract, keywords, and journal
  if (q) {
    filterQuery.$or = [
      { title: { $regex: q, $options: 'i' } },
      { abstract: { $regex: q, $options: 'i' } },
      { journal: { $regex: q, $options: 'i' } },
      { keywords: { $in: [new RegExp(q, 'i')] } },
    ];
  }

  if (author) {
    filterQuery['authors.name'] = { $regex: author, $options: 'i' };
  }

  if (doi) {
    filterQuery.doi = doi.trim();
  }

  if (journal) {
    filterQuery.journal = { $regex: journal, $options: 'i' };
  }

  if (publisher) {
    filterQuery.publisher = { $regex: publisher, $options: 'i' };
  }

  if (year) {
    filterQuery.publicationYear = parseInt(year, 10);
  }

  if (keyword) {
    filterQuery.keywords = { $in: [new RegExp(keyword, 'i')] };
  }

  // Quick filters
  if (filter === 'openAccess') {
    filterQuery.license = { $regex: /^CC-BY/i };
  }

  // Sorting logic
  let sortOption = { publicationDate: -1 };
  if (sort === 'mostCited') {
    sortOption = { citationCount: -1 };
  } else if (sort === 'trending') {
    // We sort by citations and publication date combined
    sortOption = { citationCount: -1, publicationDate: -1 };
  } else if (sort === 'title') {
    sortOption = { title: 1 };
  }

  const skip = (page - 1) * limit;

  const publications = await Publication.find(filterQuery)
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .populate('user', 'fullName isVerified');

  const totalCount = await Publication.countDocuments(filterQuery);

  // Hydrate publications with files and analytics
  const hydrated = await Promise.all(
    publications.map(async (pub) => {
      const files = await PublicationFile.find({ publication: pub._id });
      const analytics = await PublicationAnalytics.findOne({ publication: pub._id });
      return {
        ...pub.toObject(),
        files,
        analytics: analytics || { views: 0, downloads: 0, citations: pub.citationCount },
      };
    })
  );

  return {
    results: hydrated,
    totalResults: totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: parseInt(page, 10),
  };
};

/**
 * Helper to recalculate a user's research metrics
 * @param {string} userId
 */
export const recalculateResearcherMetrics = async (userId) => {
  const publications = await Publication.find({ user: userId, isDeleted: false });
  const totalPublications = publications.length;
  const totalCitations = publications.reduce((sum, p) => sum + (p.citationCount || 0), 0);

  // h-index calculation
  const citations = publications.map(p => p.citationCount || 0).sort((a, b) => b - a);
  let hIndex = 0;
  while (hIndex < citations.length && citations[hIndex] >= hIndex + 1) {
    hIndex++;
  }

  // i10-index calculation
  const i10Index = citations.filter(c => c >= 10).length;

  // Aggregate reads and downloads from analytics
  const pubIds = publications.map(p => p._id);
  const analyticsRecords = await PublicationAnalytics.find({ publication: { $in: pubIds } });
  
  const totalViews = analyticsRecords.reduce((sum, r) => sum + (r.views || 0), 0);
  const totalDownloads = analyticsRecords.reduce((sum, r) => sum + (r.downloads || 0), 0);

  // Compute recommendation/collaboration scores (mock algorithm)
  const recommendationScore = Math.round((totalCitations * 1.5) + (totalViews * 0.1) + (totalPublications * 5));
  const collaborationScore = Math.round((totalPublications * 2) + (hIndex * 3));

  await ResearchMetrics.findOneAndUpdate(
    { user: userId },
    {
      totalPublications,
      totalCitations,
      hIndex,
      i10Index,
      reads: totalViews,
      downloads: totalDownloads,
      recommendationScore,
      collaborationScore,
    },
    { upsert: true, new: true }
  );
};
