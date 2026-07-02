/**
 * Generate an SEO-friendly slug with a unique random suffix to avoid collisions and hide ObjectIds.
 * E.g., "Deep Learning for Healthcare" -> "deep-learning-for-healthcare-rp_A8X2KD"
 */
const slugify = require('slugify');
const { nanoid } = require('nanoid');

/**
 * Generate an SEO-friendly slug with a unique random suffix to avoid collisions and hide ObjectIds.
 * E.g., "Deep Learning for Healthcare" -> "deep-learning-for-healthcare-rp_A8X2KD"
 */
const generateSlug = (title) => {
  const titleText = title ? title.toString() : 'research-paper';

  const titleSlug = slugify(titleText, {
    lower: true,
    strict: true,
    trim: true
  });

  // Limit title slug to around 80 characters, and clean trailing hyphens
  const cleanTitleSlug = titleSlug.substring(0, 80).replace(/-+$/, '') || 'research-paper';

  // Append a 6-character unique ID
  return `${cleanTitleSlug}-${nanoid(6)}`;
};

module.exports = {
  generateSlug
};
