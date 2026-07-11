import AppError from '../utils/AppError.js';

/**
 * Fetch and normalize metadata for a given DOI from the Crossref API
 * @param {string} doi
 * @returns {Promise<object>}
 */
export const fetchDoiMetadata = async (doi) => {
  if (!doi) {
    throw new AppError('DOI is required', 400);
  }

  // Clean the DOI (remove URL prefix if present)
  const cleanDoi = doi.trim().replace(/^https?:\/\/doi\.org\//, '');
  const url = `https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ResearchConnect/1.0 (mailto:support@researchconnect.org)',
      },
    });

    if (response.status === 404) {
      throw new AppError('DOI not found in Crossref registry', 404);
    }

    if (!response.ok) {
      throw new AppError(`Failed to fetch metadata from Crossref: ${response.statusText}`, response.status);
    }

    const data = await response.json();
    const message = data.message;

    if (!message) {
      throw new AppError('No metadata found for this DOI', 404);
    }

    // Normalize authors
    const authors = (message.author || []).map((auth, index) => ({
      name: `${auth.given || ''} ${auth.family || ''}`.trim(),
      authorOrder: index + 1,
    }));

    // Normalize publication date
    let publicationDate = new Date();
    if (message.created && message.created['date-time']) {
      publicationDate = new Date(message.created['date-time']);
    } else if (message.issued && message.issued['date-parts'] && message.issued['date-parts'][0]) {
      const parts = message.issued['date-parts'][0];
      const year = parts[0];
      const month = parts[1] ? parts[1] - 1 : 0;
      const day = parts[2] || 1;
      publicationDate = new Date(year, month, day);
    }

    // Map Crossref types to ResearchConnect types
    const typeMapping = {
      'journal-article': 'Journal Article',
      'proceedings-article': 'Conference Paper',
      'book-chapter': 'Book Chapter',
      'book': 'Book',
      'report': 'Technical Report',
      'thesis': 'Thesis',
    };

    return {
      title: message.title && message.title[0] ? message.title[0] : '',
      authors,
      abstract: message.abstract ? message.abstract.replace(/<[^>]*>/g, '').trim() : '', // Strip XML tags
      journal: message['container-title'] && message['container-title'][0] ? message['container-title'][0] : '',
      publisher: message.publisher || '',
      volume: message.volume || '',
      issue: message.issue || '',
      pages: message.page || '',
      publicationDate,
      publicationYear: publicationDate.getFullYear(),
      publicationType: typeMapping[message.type] || 'Journal Article',
      keywords: message.subject || [],
      issn: message.ISSN ? message.ISSN[0] : '',
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Crossref DOI Fetch Error:', error.message);
    throw new AppError(`Error fetching DOI metadata: ${error.message}`, 500);
  }
};
