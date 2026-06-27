import { validationResult } from 'express-validator';
import Publication from '../models/Publication.js';
import AppError from '../utils/AppError.js';

// Helper: extract validation errors and throw if any
const validate = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg).join(', ');
    throw new AppError(messages, 400);
  }
};

// Helper: build pagination meta
const paginate = (page, limit) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 10));
  return { page: p, limit: l, skip: (p - 1) * l };
};

// POST /api/v1/publications
export const createPublication = async (req, res, next) => {
  try {
    validate(req);

    const { title, abstract, authors, journal, doi, publicationDate, fileUrl, tags, citationCount } = req.body;

    const publication = await Publication.create({
      title,
      abstract,
      authors,
      journal,
      doi,
      publicationDate,
      fileUrl,
      tags,
      citationCount,
    });

    res.status(201).json({
      status: 'success',
      data: { publication },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/publications
export const getAllPublications = async (req, res, next) => {
  try {
    validate(req);

    const { page, limit, sortBy = 'createdAt', order = 'desc', year, tag, author, journal } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    // Build filter object
    const filter = {};

    if (year) {
      const start = new Date(`${year}-01-01`);
      const end = new Date(`${year}-12-31T23:59:59.999Z`);
      filter.publicationDate = { $gte: start, $lte: end };
    }

    if (tag) {
      filter.tags = { $in: [tag.toLowerCase()] };
    }

    if (journal) {
      filter.journal = { $regex: journal, $options: 'i' };
    }

    if (author) {
      filter['authors.displayName'] = { $regex: author, $options: 'i' };
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const allowedSortFields = ['publicationDate', 'citationCount', 'title', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [publications, total] = await Promise.all([
      Publication.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(l)
        .lean(),
      Publication.countDocuments(filter),
    ]);

    res.status(200).json({
      status: 'success',
      results: publications.length,
      pagination: {
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l),
      },
      data: { publications },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/publications/:id
export const getPublicationById = async (req, res, next) => {
  try {
    validate(req);

    const publication = await Publication.findById(req.params.id).lean();

    if (!publication) {
      return next(new AppError('No publication found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { publication },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/publications/:id
export const updatePublication = async (req, res, next) => {
  try {
    validate(req);

    const allowedFields = ['title', 'abstract', 'authors', 'journal', 'publicationDate', 'fileUrl', 'tags', 'citationCount'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
      return next(new AppError('No valid fields provided for update', 400));
    }

    const publication = await Publication.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!publication) {
      return next(new AppError('No publication found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { publication },
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/publications/:id
export const deletePublication = async (req, res, next) => {
  try {
    validate(req);

    const publication = await Publication.findByIdAndDelete(req.params.id);

    if (!publication) {
      return next(new AppError('No publication found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/publications/:id/citation
export const incrementCitation = async (req, res, next) => {
  try {
    validate(req);

    const publication = await Publication.findByIdAndUpdate(
      req.params.id,
      { $inc: { citationCount: 1 } },
      { new: true }
    ).lean();

    if (!publication) {
      return next(new AppError('No publication found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { publication },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/publications/search?q=keyword
export const searchPublications = async (req, res, next) => {
  try {
    const { q, page, limit } = req.query;

    if (!q || !q.trim()) {
      return next(new AppError('Search query (q) is required', 400));
    }

    const { page: p, limit: l, skip } = paginate(page, limit);

    const filter = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { abstract: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
        { 'authors.displayName': { $regex: q, $options: 'i' } },
        { journal: { $regex: q, $options: 'i' } },
      ],
    };

    const [publications, total] = await Promise.all([
      Publication.find(filter).sort({ citationCount: -1 }).skip(skip).limit(l).lean(),
      Publication.countDocuments(filter),
    ]);

    res.status(200).json({
      status: 'success',
      results: publications.length,
      pagination: {
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l),
      },
      data: { publications },
    });
  } catch (err) {
    next(err);
  }
};
