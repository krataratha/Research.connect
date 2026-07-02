const mongoose = require('mongoose');
const publicationRepository = require('../repository/publication.repository');
const Publication = require('../../../models/Publication');
const PublicationAuthor = require('../../../models/PublicationAuthor');
const PublicationFile = require('../../../models/PublicationFile');
const PublicationKeyword = require('../../../models/PublicationKeyword');
const PublicationResearchArea = require('../../../models/PublicationResearchArea');
const PublicationMetric = require('../../../models/PublicationMetric');
const PublicationAnalytic = require('../../../models/PublicationAnalytic');
const PublicationView = require('../../../models/PublicationView');
const PublicationDownload = require('../../../models/PublicationDownload');
const PublicationBookmark = require('../../../models/PublicationBookmark');
const PublicationComment = require('../../../models/PublicationComment');
const PublicationHistory = require('../../../models/PublicationHistory');
const ActivityLog = require('../../../models/ActivityLog');
const profileService = require('../../profile/service/profile.service');
const { generateSlug } = require('../helper/slug.helper');
const { NotFoundError, ValidationError, ForbiddenError } = require('../../../common/errors/AppError');

class PublicationService {
  /**
   * Helper to write sub-collection details
   */
  async _saveSubCollections(publicationId, userId, data) {
    const { authorsList = [], keywords = [], researchAreas = [] } = data;

    // 1. Save Authors
    if (authorsList && authorsList.length > 0) {
      await PublicationAuthor.deleteMany({ publicationId });
      const authorsData = authorsList.map((author, index) => ({
        publicationId,
        authorId: author.authorId || '',
        name: author.name,
        email: author.email || '',
        institution: author.institution || '',
        department: author.department || '',
        isCoAuthor: author.authorId !== userId.toString(),
        isCorresponding: !!author.isCorresponding,
        order: author.order !== undefined ? author.order : index
      }));
      await PublicationAuthor.insertMany(authorsData);
    }

    // 2. Save Keywords
    if (keywords && keywords.length > 0) {
      await PublicationKeyword.deleteMany({ publicationId });
      const keywordsData = keywords.map(kw => ({
        publicationId,
        keyword: kw.trim()
      }));
      await PublicationKeyword.insertMany(keywordsData);
    }

    // 3. Save Research Areas
    if (researchAreas && researchAreas.length > 0) {
      await PublicationResearchArea.deleteMany({ publicationId });
      const areasData = researchAreas.map(area => ({
        publicationId,
        researchArea: area.trim()
      }));
      await PublicationResearchArea.insertMany(areasData);
    }
  }

  /**
   * Create / Publish a Publication
   */
  async createPublication(userId, data, isDraft = false) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // 1. Enforce Validation
      if (!data.title) {
        throw new ValidationError('Publication title is required.');
      }
      if (!data.publicationType) {
        throw new ValidationError('Publication type is required.');
      }

      // Check duplicate by DOI or Google Scholar ID
      const duplicateConditions = [];
      if (data.doi) duplicateConditions.push({ doi: data.doi.trim() });
      const scholarId = data.googleScholarPublicationId || data.citationId;
      if (scholarId) duplicateConditions.push({ googleScholarPublicationId: scholarId.trim() });

      let existingPub = null;
      if (duplicateConditions.length > 0) {
        existingPub = await Publication.findOne({
          userId,
          isDeleted: { $ne: true },
          $or: duplicateConditions
        });
      }

      if (!existingPub) {
        // Check title duplicate for user
        const cleanTitle = data.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        const userPublications = await Publication.find({ userId, isDeleted: { $ne: true } });
        existingPub = userPublications.find(p => p.title.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanTitle);
      }

      if (existingPub) {
        // If it's a real duplicate manually uploaded that has a PDF attached, throw validation error
        if (existingPub.status === 'published' && existingPub.cloudinaryFileUrl && !isDraft) {
          throw new ValidationError('A publication with this title, DOI, or Scholar ID already exists in your library.');
        }

        // Merge/update the existing record!
        const isPublishingDraft = existingPub.status === 'draft' && !isDraft;

        const updatableFields = [
          'title', 'subtitle', 'abstract', 'doi', 'isbn', 'issn',
          'journal', 'conference', 'publisher', 'volume', 'issue', 'pages',
          'publicationDate', 'language', 'visibility', 'publicationType',
          'researchType', 'correspondingAuthor', 'institution', 'department', 'thumbnail'
        ];

        updatableFields.forEach(field => {
          if (data[field] !== undefined) {
            existingPub[field] = data[field];
          }
        });

        if (isDraft) {
          existingPub.status = 'draft';
        } else {
          existingPub.status = 'published';
          existingPub.visibility = data.visibility || 'Public';
          if (!existingPub.researchScore) {
            existingPub.researchScore = 20 + Math.floor(Math.random() * 10);
          }
        }

        if (data.fileDetails && data.fileDetails.secure_url) {
          existingPub.cloudinaryFileUrl = data.fileDetails.secure_url;
          existingPub.pdfURL = data.fileDetails.secure_url;

          await PublicationFile.deleteMany({ publicationId: existingPub._id });
          const fileDoc = new PublicationFile({
            publicationId: existingPub._id,
            secure_url: data.fileDetails.secure_url,
            public_id: data.fileDetails.public_id,
            resource_type: data.fileDetails.resource_type || 'raw',
            bytes: data.fileDetails.bytes || 0,
            format: data.fileDetails.format || ''
          });
          await fileDoc.save({ session });
        }

        if (scholarId) {
          existingPub.googleScholarPublicationId = scholarId;
          existingPub.citationId = scholarId;
        }

        const authorNames = data.authorsList && data.authorsList.length > 0
          ? data.authorsList.map(a => a.name).join(', ')
          : data.authors || existingPub.authors;
        existingPub.authors = authorNames;

        await existingPub.save({ session });

        // Save detailed metadata in publicationMetadata
        const PublicationMetadata = require('../../../models/PublicationMetadata');
        await PublicationMetadata.findOneAndUpdate(
          { publicationId: existingPub._id },
          {
            abstract: data.abstract || existingPub.abstract || '',
            references: data.references || [],
            publisher: data.publisher || existingPub.publisher || ''
          },
          { upsert: true, session }
        );

        // Save subcollections
        await this._saveSubCollections(existingPub._id, userId, {
          authorsList: data.authorsList,
          keywords: data.keywords,
          researchAreas: data.researchAreas
        });

        // History log
        const historyDoc = new PublicationHistory({
          publicationId: existingPub._id,
          userId,
          action: isPublishingDraft ? 'publish' : 'update',
          changes: data
        });
        await historyDoc.save({ session });

        await session.commitTransaction();
        session.endSession();

        // Recalculate metrics
        try {
          await profileService.calculateAndSaveResearchMetrics(userId);
        } catch (e) {}

        return existingPub;
      }

      // 2. Generate slug and basic metadata
      const slug = generateSlug(data.title);
      
      const abstractWords = data.abstract ? data.abstract.split(/\s+/).length : 0;
      const readingTime = Math.max(1, Math.ceil(abstractWords / 150));
      const researchScore = isDraft ? 0 : (20 + Math.floor(Math.random() * 10));

      const authorNames = data.authorsList && data.authorsList.length > 0
        ? data.authorsList.map(a => a.name).join(', ')
        : data.authors || '';

      // 3. Save publication root document
      const pubPayload = {
        userId,
        ownerId: userId,
        slug,
        title: data.title,
        subtitle: data.subtitle || '',
        authors: authorNames,
        publication: data.publication || data.journal || data.conference || '',
        journal: data.journal || '',
        conference: data.conference || '',
        publisher: data.publisher || '',
        year: data.year || (data.publicationDate ? new Date(data.publicationDate).getFullYear() : new Date().getFullYear()),
        publicationDate: data.publicationDate || new Date(),
        doi: data.doi || '',
        isbn: data.isbn || '',
        issn: data.issn || '',
        googleScholarPublicationId: scholarId || '',
        citationId: scholarId || '',
        volume: data.volume || '',
        issue: data.issue || '',
        pages: data.pages || '',
        abstract: data.abstract || '',
        keywords: data.keywords || [],
        researchAreas: data.researchAreas || [],
        publicationType: data.publicationType,
        researchType: data.researchType || '',
        correspondingAuthor: data.correspondingAuthor || '',
        institution: data.institution || '',
        department: data.department || '',
        language: data.language || '',
        visibility: isDraft ? 'Draft' : (data.visibility || 'Public'),
        status: isDraft ? 'draft' : 'published',
        cloudinaryFileUrl: data.fileDetails?.secure_url || '',
        pdfURL: data.fileDetails?.secure_url || '', // for compatibility
        thumbnail: data.thumbnail || '',
        readingTime,
        researchScore
      };

      const publication = new Publication(pubPayload);
      await publication.save({ session });

      // 3.5 Save detailed metadata in publicationMetadata collection
      const PublicationMetadata = require('../../../models/PublicationMetadata');
      const metadata = new PublicationMetadata({
        publicationId: publication._id,
        abstract: data.abstract || '',
        references: data.references || [],
        publisher: data.publisher || ''
      });
      await metadata.save({ session });

      // 4. Save file metadata if present
      if (data.fileDetails && data.fileDetails.secure_url) {
        const fileDoc = new PublicationFile({
          publicationId: publication._id,
          secure_url: data.fileDetails.secure_url,
          public_id: data.fileDetails.public_id,
          resource_type: data.fileDetails.resource_type || 'raw',
          bytes: data.fileDetails.bytes || 0,
          format: data.fileDetails.format || ''
        });
        await fileDoc.save({ session });
      }

      // 5. Save authors, keywords, research areas
      await this._saveSubCollections(publication._id, userId, {
        authorsList: data.authorsList,
        keywords: data.keywords,
        researchAreas: data.researchAreas
      });

      // 6. Initialize Metric
      const metricDoc = new PublicationMetric({
        publicationId: publication._id,
        views: 0,
        downloads: 0,
        citations: 0,
        shares: 0,
        bookmarks: 0,
        comments: 0
      });
      await metricDoc.save({ session });

      // 7. Log History
      const historyDoc = new PublicationHistory({
        publicationId: publication._id,
        userId,
        action: isDraft ? 'draft_save' : 'create',
        changes: pubPayload
      });
      await historyDoc.save({ session });

      // 8. Create Activity timeline log if published
      if (!isDraft) {
        const activityDoc = new ActivityLog({
          userId,
          action: 'publication_created',
          referenceId: publication._id,
          referenceModel: 'Publication',
          details: `Published research: "${publication.title}"`
        });
        await activityDoc.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      // 9. Recalculate researcher profile metrics in background
      if (!isDraft) {
        try {
          await profileService.calculateAndSaveResearchMetrics(userId);
        } catch (metricsError) {
          console.error('[METRICS RECALCULATION ERROR]:', metricsError);
        }
      }

      return publication;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Save a Draft Publication
   */
  async saveDraft(userId, data) {
    return await this.createPublication(userId, data, true);
  }

  /**
   * Retrieve Single Publication by SEO Slug and Record Analytics View
   */
  async getPublicationBySlug(slug, clientInfo = {}) {
    // Find regardless of soft-delete status to allow owners to access deleted/draft/private documents
    const publication = await Publication.findOne({ slug });
    if (!publication) {
      throw new NotFoundError('Publication not found.');
    }

    // Hydrate sub-collections
    const PublicationMetadata = require('../../../models/PublicationMetadata');
    const [authors, files, keywords, researchAreas, metrics, metadata] = await Promise.all([
      PublicationAuthor.find({ publicationId: publication._id }).sort({ order: 1 }),
      PublicationFile.find({ publicationId: publication._id, isDeleted: { $ne: true } }),
      PublicationKeyword.find({ publicationId: publication._id }),
      PublicationResearchArea.find({ publicationId: publication._id }),
      PublicationMetric.findOne({ publicationId: publication._id }),
      PublicationMetadata.findOne({ publicationId: publication._id })
    ]);

    // Visibility / Draft / Soft-delete checks
    const isOwner = clientInfo.userId && publication.userId.toString() === clientInfo.userId.toString();
    const isAdmin = clientInfo.user && clientInfo.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      if (publication.status === 'draft') {
        throw new ForbiddenError('You are not authorized to view this draft publication.');
      }
      if (publication.isDeleted) {
        throw new ForbiddenError('This publication has been soft deleted.');
      }
      if (publication.visibility === 'Private') {
        const isCoAuthor = authors.some(author => author.authorId && author.authorId.toString() === clientInfo.userId?.toString());
        if (!isCoAuthor) {
          throw new ForbiddenError('This publication is private.');
        }
      }
      if (publication.visibility === 'Institution Only') {
        const userInstitution = clientInfo.user?.institution;
        const pubInstitution = publication.institution;
        if (!userInstitution || userInstitution !== pubInstitution) {
          throw new ForbiddenError('This publication is restricted to members of the same institution.');
        }
      }
    }

    // Record view analytics & view event if published
    if (publication.status === 'published' && !publication.isDeleted) {
      try {
        await PublicationMetric.findOneAndUpdate(
          { publicationId: publication._id },
          { $inc: { views: 1 } },
          { upsert: true }
        );

        publication.views = (publication.views || 0) + 1;
        await publication.save();

        await PublicationView.create({
          publicationId: publication._id,
          userId: clientInfo.userId || null,
          ipAddress: clientInfo.ip || '',
          userAgent: clientInfo.userAgent || ''
        });

        await PublicationAnalytic.create({
          publicationId: publication._id,
          userId: clientInfo.userId || null,
          eventType: 'view',
          ipAddress: clientInfo.ip || '',
          userAgent: clientInfo.userAgent || ''
        });
      } catch (analyticsError) {
        console.error('[ANALYTICS LOG VIEW ERROR]:', analyticsError);
      }
    }

    return {
      ...publication.toObject(),
      authorsList: authors,
      files,
      keywordsList: keywords.map(k => k.keyword),
      researchAreasList: researchAreas.map(r => r.researchArea),
      metrics: metrics || { views: publication.views || 0, downloads: publication.downloads || 0 },
      references: metadata ? metadata.references : [],
      publisher: metadata ? metadata.publisher : publication.publisher,
      abstract: metadata?.abstract || publication.abstract || ''
    };
  }

  /**
   * Retrieve List of Publications with Pagination
   */
  async getPublications(filter = {}, queryOptions = {}) {
    const { page = 1, limit = 10, sort = '-createdAt' } = queryOptions;
    const skip = (page - 1) * limit;

    const baseFilter = { ...filter };
    if (baseFilter.isDeleted === undefined) {
      baseFilter.isDeleted = { $ne: true };
    }

    const query = Publication.find(baseFilter)
      .populate('userId', 'firstName lastName fullName email profileImage institution department designation')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const [docs, total] = await Promise.all([
      query,
      Publication.countDocuments(baseFilter)
    ]);

    return {
      docs,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Update publication
   */
  async updatePublication(id, userId, updateData) {
    const publication = await Publication.findById(id);
    if (!publication) {
      throw new NotFoundError('Publication not found.');
    }

    // Authorization check
    if (publication.userId.toString() !== userId.toString()) {
      throw new ForbiddenError('You are not authorized to update this publication.');
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const isPublishingDraft = publication.status === 'draft' && updateData.status === 'published';

      // Update fields
      const updatableFields = [
        'title', 'subtitle', 'abstract', 'doi', 'isbn', 'issn',
        'journal', 'conference', 'publisher', 'volume', 'issue', 'pages',
        'publicationDate', 'language', 'visibility', 'status', 'publicationType',
        'researchType', 'correspondingAuthor', 'institution', 'department', 'thumbnail'
      ];

      updatableFields.forEach(field => {
        if (updateData[field] !== undefined) {
          publication[field] = updateData[field];
        }
      });

      if (updateData.title && updateData.title !== publication.title) {
        publication.slug = generateSlug(updateData.title);
      }

      if (updateData.fileDetails && updateData.fileDetails.secure_url) {
        publication.cloudinaryFileUrl = updateData.fileDetails.secure_url;
        publication.pdfURL = updateData.fileDetails.secure_url;
        
        await PublicationFile.deleteMany({ publicationId: id });
        const fileDoc = new PublicationFile({
          publicationId: id,
          secure_url: updateData.fileDetails.secure_url,
          public_id: updateData.fileDetails.public_id,
          resource_type: updateData.fileDetails.resource_type || 'raw',
          bytes: updateData.fileDetails.bytes || 0,
          format: updateData.fileDetails.format || ''
        });
        await fileDoc.save({ session });
      }

      if (updateData.authorsList) {
        publication.authors = updateData.authorsList.map(a => a.name).join(', ');
      }

      if (updateData.keywords) {
        publication.keywords = updateData.keywords;
      }

      if (updateData.researchAreas) {
        publication.researchAreas = updateData.researchAreas;
      }

      if (isPublishingDraft) {
        publication.status = 'published';
        publication.visibility = updateData.visibility || 'Public';
        publication.researchScore = 20 + Math.floor(Math.random() * 10);
      }

      await publication.save({ session });

      // Save sub-collections
      await this._saveSubCollections(id, userId, {
        authorsList: updateData.authorsList,
        keywords: updateData.keywords,
        researchAreas: updateData.researchAreas
      });

      // Save detailed metadata in publicationMetadata collection
      const PublicationMetadata = require('../../../models/PublicationMetadata');
      await PublicationMetadata.findOneAndUpdate(
        { publicationId: id },
        {
          abstract: updateData.abstract !== undefined ? updateData.abstract : publication.abstract,
          references: updateData.references !== undefined ? updateData.references : undefined,
          publisher: updateData.publisher !== undefined ? updateData.publisher : publication.publisher
        },
        { upsert: true, session }
      );

      // History log
      const historyDoc = new PublicationHistory({
        publicationId: id,
        userId,
        action: isPublishingDraft ? 'publish' : 'update',
        changes: updateData
      });
      await historyDoc.save({ session });

      // Activity timeline log
      if (isPublishingDraft) {
        const activityDoc = new ActivityLog({
          userId,
          action: 'publication_created',
          referenceId: id,
          referenceModel: 'Publication',
          details: `Published research: "${publication.title}"`
        });
        await activityDoc.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      // Recalculate metrics
      await profileService.calculateAndSaveResearchMetrics(userId);

      return publication;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Delete publication
   */
  async deletePublication(id, userId) {
    const publication = await Publication.findById(id);
    if (!publication) {
      throw new NotFoundError('Publication not found.');
    }

    if (publication.userId.toString() !== userId.toString()) {
      throw new ForbiddenError('You are not authorized to delete this publication.');
    }

    if (publication.isDeleted) {
      // Already soft deleted -> delete permanently!
      await Publication.deleteOne({ _id: id });
      await PublicationFile.deleteMany({ publicationId: id });
      await PublicationAuthor.deleteMany({ publicationId: id });
      await PublicationKeyword.deleteMany({ publicationId: id });
      await PublicationResearchArea.deleteMany({ publicationId: id });
      await PublicationMetric.deleteMany({ publicationId: id });
      await PublicationAnalytic.deleteMany({ publicationId: id });
    } else {
      publication.isDeleted = true;
      publication.deletedAt = new Date();
      publication.deletedBy = userId;
      await publication.save();
    }

    // Recalculate metrics
    await profileService.calculateAndSaveResearchMetrics(userId);

    return publication;
  }

  /**
   * Restore publication
   */
  async restorePublication(id, userId) {
    const publication = await Publication.findById(id);
    if (!publication) {
      throw new NotFoundError('Publication not found.');
    }

    if (publication.userId.toString() !== userId.toString()) {
      throw new ForbiddenError('You are not authorized to restore this publication.');
    }

    publication.isDeleted = false;
    publication.deletedAt = undefined;
    publication.deletedBy = undefined;
    await publication.save();

    // Log restore action
    await PublicationHistory.create({
      publicationId: id,
      userId,
      action: 'restore',
      changes: { isDeleted: false }
    });

    // Recalculate metrics
    await profileService.calculateAndSaveResearchMetrics(userId);

    return publication;
  }

  /**
   * Increment file download analytic and metric
   */
  async trackDownload(id, clientInfo = {}) {
    const publication = await Publication.findById(id);
    if (!publication) {
      throw new NotFoundError('Publication not found.');
    }

    await PublicationMetric.findOneAndUpdate(
      { publicationId: id },
      { $inc: { downloads: 1 } },
      { upsert: true }
    );

    publication.downloads = (publication.downloads || 0) + 1;
    await publication.save();

    await PublicationDownload.create({
      publicationId: id,
      userId: clientInfo.userId || null,
      ipAddress: clientInfo.ip || '',
      userAgent: clientInfo.userAgent || ''
    });

    await PublicationAnalytic.create({
      publicationId: id,
      userId: clientInfo.userId || null,
      eventType: 'download',
      ipAddress: clientInfo.ip || '',
      userAgent: clientInfo.userAgent || ''
    });

    // Also recalculate profile download count in background
    try {
      await profileService.calculateAndSaveResearchMetrics(publication.userId);
    } catch (metricsError) {
      console.error('[DOWNLOAD METRICS RECALCULATION ERROR]:', metricsError);
    }

    return { downloads: publication.downloads };
  }

  /**
   * Retrieve publications for a researcher by their profileSlug
   */
  async getPublicationsByProfileSlug(profileSlug, queryOptions = {}) {
    const User = require('../../../models/User');
    const user = await User.findOne({ profileSlug, isDeleted: { $ne: true } });
    if (!user) {
      throw new NotFoundError('Researcher profile not found.');
    }

    const filter = { userId: user._id, status: 'published', isDeleted: { $ne: true } };
    return await this.getPublications(filter, queryOptions);
  }
}

module.exports = new PublicationService();
