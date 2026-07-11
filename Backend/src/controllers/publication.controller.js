import path from 'path';
import * as publicationService from '../services/publication.service.js';
import * as metadataService from '../services/metadata.service.js';
import * as uploadService from '../services/upload.service.js';
import Publication from '../models/Publication.js';
import PublicationFile from '../models/PublicationFile.js';
import PublicationVersion from '../models/PublicationVersion.js';
import PublicationAnalytics from '../models/PublicationAnalytics.js';
import PublicationComment from '../models/PublicationComment.js';
import AppError from '../utils/AppError.js';

/**
 * Create a new publication
 */
export const createPublication = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const publication = await publicationService.createPublication(userId, req.body);

    res.status(201).json({
      status: 'success',
      data: publication,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update publication metadata
 */
export const updatePublication = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const publicationId = req.params.id;
    const { changeSummary, ...updateData } = req.body;

    const publication = await publicationService.updatePublication(
      userId,
      publicationId,
      updateData,
      changeSummary
    );

    res.status(200).json({
      status: 'success',
      data: publication,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a publication (soft delete)
 */
export const deletePublication = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const publicationId = req.params.id;

    await publicationService.deletePublication(userId, publicationId);

    res.status(200).json({
      status: 'success',
      message: 'Publication deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed view of a publication (tracks view count)
 */
export const getPublicationDetails = async (req, res, next) => {
  try {
    const publicationId = req.params.id;
    const publication = await Publication.findById(publicationId).populate('user', 'fullName isVerified');

    if (!publication) {
      return next(new AppError('Publication not found', 404));
    }

    // Track view asynchronously
    publicationService.trackView(publicationId, {
      userId: req.user?._id,
      ip: req.ip,
      country: req.headers['cf-ipcountry'] || 'Unknown',
      institution: req.user?.institution || 'Unknown',
    }).catch(err => console.error('Error tracking view:', err));

    const files = await PublicationFile.find({ publication: publicationId });
    const analytics = await PublicationAnalytics.findOne({ publication: publicationId });

    res.status(200).json({
      status: 'success',
      data: {
        publication,
        files,
        analytics: analytics || { views: 0, downloads: 0, citations: publication.citationCount },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's publications
 */
export const getMyPublications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const publications = await Publication.find({ user: userId, isDeleted: false });

    // Hydrate with files
    const hydrated = await Promise.all(
      publications.map(async (pub) => {
        const files = await PublicationFile.find({ publication: pub._id });
        const analytics = await PublicationAnalytics.findOne({ publication: pub._id });
        return {
          ...pub.toObject(),
          files,
          analytics: analytics || { views: 0, downloads: 0 },
        };
      })
    );

    res.status(200).json({
      status: 'success',
      data: hydrated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload and attach a file to a publication
 */
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    const { publicationId, fileType } = req.body;
    if (!publicationId || !fileType) {
      return next(new AppError('Publication ID and File Type are required', 400));
    }

    // Verify publication ownership
    const publication = await Publication.findOne({ _id: publicationId, user: req.user._id });
    if (!publication) {
      return next(new AppError('Publication not found or unauthorized', 404));
    }

    // Upload to Cloudinary or Local
    const uploadedFile = await uploadService.uploadFileToCloudinary(
      req.file,
      'publication-pdf',
      { publicationId },
      req.user._id
    );

    // Attach file record
    const pubFile = await publicationService.attachFileToPublication(
      publicationId,
      uploadedFile,
      fileType
    );

    res.status(201).json({
      status: 'success',
      data: pubFile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove an attached file from a publication
 */
export const removeFile = async (req, res, next) => {
  try {
    const fileId = req.params.fileId;
    await publicationService.removePublicationFile(fileId, req.user._id);

    res.status(200).json({
      status: 'success',
      message: 'File removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resolve DOI and return metadata
 */
export const resolveDoi = async (req, res, next) => {
  try {
    const { doi } = req.params;
    const metadata = await metadataService.fetchDoiMetadata(doi);

    res.status(200).json({
      status: 'success',
      data: metadata,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get version history snapshots of a publication
 */
export const getVersionHistory = async (req, res, next) => {
  try {
    const publicationId = req.params.id;
    const versions = await PublicationVersion.find({ publication: publicationId }).sort({ versionNumber: -1 });

    res.status(200).json({
      status: 'success',
      data: versions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rollback publication to a specific historical version
 */
export const rollbackVersion = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const publicationId = req.params.id;
    const { versionNumber } = req.body;

    if (!versionNumber) {
      return next(new AppError('Version number is required', 400));
    }

    const publication = await publicationService.rollbackPublicationVersion(
      userId,
      publicationId,
      versionNumber
    );

    res.status(200).json({
      status: 'success',
      message: `Rolled back successfully to version ${versionNumber}`,
      data: publication,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search publications with query, filters, and sorting
 */
export const searchPublications = async (req, res, next) => {
  try {
    const searchResults = await publicationService.searchPublications(req.query);

    res.status(200).json({
      status: 'success',
      data: searchResults,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download a publication file and track download event
 */
export const downloadFile = async (req, res, next) => {
  try {
    const fileId = req.params.fileId;
    const fileRecord = await PublicationFile.findById(fileId);

    if (!fileRecord) {
      return next(new AppError('File not found', 404));
    }

    // Track download event
    publicationService.trackDownload(fileRecord.publication, {
      userId: req.user?._id,
      ip: req.ip,
      country: req.headers['cf-ipcountry'] || 'Unknown',
      institution: req.user?.institution || 'Unknown',
    }).catch(err => console.error('Error tracking download:', err));

    // Redirect to Cloudinary URL or serve local path
    if (fileRecord.url.startsWith('http')) {
      res.redirect(fileRecord.url);
    } else {
      // Local file serve — guard against path traversal attacks
      const uploadsBaseDir = path.resolve('uploads');
      // Remove any leading slash and resolve against base
      const sanitizedRelPath = fileRecord.url.replace(/^\/+/, '');
      const localPath = path.resolve(uploadsBaseDir, sanitizedRelPath);

      // Ensure the resolved path is strictly within the uploads directory
      if (!localPath.startsWith(uploadsBaseDir + path.sep) && localPath !== uploadsBaseDir) {
        return next(new AppError('Invalid file path.', 400));
      }

      res.download(localPath, fileRecord.fileName);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Add a comment to a publication
 */
export const addComment = async (req, res, next) => {
  try {
    const { commentText, parentId } = req.body;
    const publicationId = req.params.id;

    const comment = await PublicationComment.create({
      publication: publicationId,
      user: req.user._id,
      commentText,
      parentId: parentId || null,
    });

    const populatedComment = await PublicationComment.findById(comment._id).populate('user', 'fullName profilePhoto');

    res.status(201).json({
      status: 'success',
      data: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comments for a publication
 */
export const getComments = async (req, res, next) => {
  try {
    const publicationId = req.params.id;
    const comments = await PublicationComment.find({ publication: publicationId, isDeleted: false })
      .populate('user', 'fullName profilePhoto')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};
