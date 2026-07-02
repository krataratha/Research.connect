/**
 * Generate an SEO-friendly slug with a unique random suffix to avoid collisions and hide ObjectIds.
 * E.g., "Deep Learning for Healthcare" -> "deep-learning-for-healthcare-rp_A8X2KD"
 */
const generateSlug = (title) => {
  if (!title) return '';

  // 1. Slugify the title
  let slug = title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text

  if (!slug) slug = 'research-item';

  // 2. Generate random 6-character uppercase alphanumeric string
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // 3. Combine with the prompt's suffix format: -rp_[suffix]
  return `${slug}-rp_${suffix}`;
};

module.exports = {
  generateSlug
};
