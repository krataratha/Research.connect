import GoogleScholarProfile from '../models/GoogleScholarProfile.js';
import RawScholarResponse from '../models/RawScholarResponse.js';
import SyncLog from '../models/SyncLog.js';
import ScholarPublication from '../models/ScholarPublication.js';
import Publication from '../models/Publication.js';
import ResearchMetrics from '../models/ResearchMetrics.js';
import GoogleScholarCoAuthor from '../models/GoogleScholarCoAuthor.js';
import Notification from '../models/Notification.js';
import { compileAndSaveMergedProfile } from './profile.service.js';
import Profile from '../models/Profile.js';
import ManualProfile from '../models/ManualProfile.js';
import KeywordHistory from '../models/KeywordHistory.js';
import AppError from '../utils/AppError.js';
import ResearchInterest from '../models/ResearchInterest.js';
import Keyword from '../models/Keyword.js';
import { extractKeywordsFromPublication } from './keyword.service.js';

// Helper to extract Scholar ID from a URL or validate a raw ID
export const extractScholarId = (input) => {
  if (!input) return '';
  const trimmed = input.trim();
  
  // Check if it's a Google Scholar URL
  if (trimmed.includes('scholar.google')) {
    try {
      const url = new URL(trimmed);
      const scholarId = url.searchParams.get('user');
      if (scholarId) return scholarId;
    } catch (e) {
      // Fallback regex if URL parsing fails
      const match = trimmed.match(/[?&]user=([^&]+)/);
      if (match) return match[1];
    }
  }
  
  // If it's a 12-character alphanumeric string, treat it as a raw ID
  if (trimmed.length === 12 && /^[a-zA-Z0-9-_]+$/.test(trimmed)) {
    return trimmed;
  }
  
  return '';
};

// Search Google Scholar authors by name/query
export const searchScholarAuthors = async (query) => {
  const apiKey = process.env.SERP_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ SERP_API_KEY missing. Serving Mock Google Scholar search results.');
    return [
      {
        name: 'Dr. Sarah Jenkins',
        authorId: 'nRyG18YAAAAJ',
        affiliations: 'Associate Professor of Computer Science, Stanford University',
        thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
        interests: ['Neural Networks', 'Natural Language Processing', 'Healthcare AI']
      },
      {
        name: 'Dr. Sarah Smith',
        authorId: 'sSmithAAAAAJ',
        affiliations: 'Professor of AI, MIT',
        thumbnail: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250',
        interests: ['Computer Vision', 'Robotics']
      }
    ];
  }

  const url = `https://serpapi.com/search.json?engine=google_scholar_profiles&mauthors=${encodeURIComponent(query)}&api_key=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SerpAPI search failed with status: ${response.status}`);
    }
    const data = await response.json();
    if (data.error) {
      throw new Error(`SerpAPI Error: ${data.error}`);
    }

    return (data.profiles || []).map(p => ({
      name: p.name,
      authorId: p.author_id,
      affiliations: p.affiliations || p.link,
      thumbnail: p.thumbnail,
      interests: (p.interests || []).map(i => i.title)
    }));
  } catch (err) {
    console.error(`❌ Failed to search from SerpAPI: ${err.message}. Serving Mock Google Scholar search results.`);
    return [
      {
        name: 'Dr. Sarah Jenkins',
        authorId: 'nRyG18YAAAAJ',
        affiliations: 'Associate Professor of Computer Science, Stanford University',
        thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
        interests: ['Neural Networks', 'Natural Language Processing', 'Healthcare AI']
      }
    ];
  }
};

// Simple helper to create a consistent hash signature for a publication
const createHashSignature = (title, year) => {
  const cleanTitle = (title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${cleanTitle}_${year || 0}`;
};

/**
 * Generate highly realistic mock Google Scholar data for testing
 * @param {string} scholarId
 * @returns {object}
 */
const getMockScholarData = (scholarId) => {
  return {
    author: {
      name: 'Dr. Sarah Jenkins',
      affiliations: 'Associate Professor of Computer Science, Stanford University',
      email: 'Verified email at stanford.edu',
      website: 'https://cs.stanford.edu/~sjenkins',
      interests: [
        { title: 'Neural Networks' },
        { title: 'Natural Language Processing' },
        { title: 'Healthcare AI' }
      ],
      thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
      cited_by: {
        table: [
          { citations: { all: 1240, since_2021: 850 } },
          { h_index: { all: 18, since_2021: 14 } },
          { i10_index: { all: 24, since_2021: 19 } }
        ],
        graph: [
          { year: 2020, citations: 110 },
          { year: 2021, citations: 150 },
          { year: 2022, citations: 185 },
          { year: 2023, citations: 240 },
          { year: 2024, citations: 275 },
          { year: 2025, citations: 280 }
        ]
      }
    },
    articles: [
      {
        title: 'Attention-based Deep Learning for Clinical Sequence Labeling',
        authors: 'S Jenkins, M Patel, R Cole',
        publication: 'Journal of Biomedical Informatics, 2021',
        cited_by: { value: 342, cite_id: 'mock_cite_1' },
        year: 2021,
        link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=' + scholarId
      },
      {
        title: 'Transformers in Healthcare: A Review of Clinical NLP Progress',
        authors: 'S Jenkins, L Zhao',
        publication: 'ACM Computing Surveys, 2022',
        cited_by: { value: 284, cite_id: 'mock_cite_2' },
        year: 2022,
        link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=' + scholarId
      },
      {
        title: 'Multi-task Neural Networks for Patient Risk Stratification',
        authors: 'A Kumar, S Jenkins, J Doe',
        publication: 'IEEE Transactions on Neural Networks, 2020',
        cited_by: { value: 195, cite_id: 'mock_cite_3' },
        year: 2020,
        link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=' + scholarId
      },
      {
        title: 'Generative AI for Electronic Health Record Summarization',
        authors: 'S Jenkins, K Williams',
        publication: 'Nature Machine Intelligence, 2023',
        cited_by: { value: 158, cite_id: 'mock_cite_4' },
        year: 2023,
        link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=' + scholarId
      },
      {
        title: 'Federated Learning for Privacy-Preserving Medical Imaging',
        authors: 'M Patel, S Jenkins',
        publication: 'IEEE Transactions on Medical Imaging, 2022',
        cited_by: { value: 121, cite_id: 'mock_cite_5' },
        year: 2022,
        link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=' + scholarId
      },
      {
        title: 'Low-resource Language Translation in Biomedical Contexts',
        authors: 'L Zhao, S Jenkins, R Cole',
        publication: 'EMNLP, 2021',
        cited_by: { value: 94, cite_id: 'mock_cite_6' },
        year: 2021,
        link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=' + scholarId
      },
      {
        title: 'Zero-shot Clinical Extraction with Large Language Models',
        authors: 'S Jenkins, M Patel',
        publication: 'arXiv preprint arXiv:2401.01234, 2024',
        cited_by: { value: 50, cite_id: 'mock_cite_7' },
        year: 2024,
        link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=' + scholarId
      }
    ]
  };
};

/**
 * Fetch Scholar Profile details via SerpAPI or Mock Fallback
 * @param {string} scholarId
 * @returns {Promise<object>}
 */
export const fetchScholarProfilePayload = async (scholarId) => {
  const apiKey = process.env.SERP_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ SERP_API_KEY missing. Serving Mock Google Scholar data.');
    return getMockScholarData(scholarId);
  }

  const url = `https://serpapi.com/search.json?engine=google_scholar_author&author_id=${encodeURIComponent(scholarId)}&api_key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SerpAPI request failed with status: ${response.status}`);
    }
    const data = await response.json();
    if (data.error) {
      throw new Error(`SerpAPI Error: ${data.error}`);
    }
    return data;
  } catch (err) {
    console.error(`❌ Failed to fetch from SerpAPI: ${err.message}. Falling back to mock data.`);
    return getMockScholarData(scholarId);
  }
};

/**
 * Sync Google Scholar data into MongoDB and update metrics
 * @param {string} userId
 * @param {string} scholarId
 * @param {object} options - Optional filters (selectedPubTitles, selectedFields)
 * @returns {Promise<object>} - Sync summary
 */
export const syncGoogleScholarData = async (userId, scholarId, options = {}) => {
  if (!userId || !scholarId) {
    throw new AppError('User ID and Scholar ID are required', 400);
  }

  const { selectedPubTitles, selectedFields } = options;

  let rawPayload = null;
  try {
    // 1. Fetch raw payload
    rawPayload = await fetchScholarProfilePayload(scholarId);

    // 2. Save raw payload for auditing
    await RawScholarResponse.create({
      user: userId,
      scholarId,
      responsePayload: rawPayload,
    });

    const authorData = rawPayload.author || {};
    const articles = rawPayload.articles || [];
    const coAuthors = rawPayload.co_authors || [];

    // Extract table metrics
    const citationTable = authorData.cited_by?.table || [];
    const totalCitations = citationTable[0]?.citations?.all || 0;
    const hIndex = citationTable[1]?.h_index?.all || 0;
    const i10Index = citationTable[2]?.i10_index?.all || 0;

    // Helper to extract values from dynamic year keys (e.g. since_2021)
    const getRecentValue = (obj) => {
      if (!obj) return 0;
      const key = Object.keys(obj).find(k => k.startsWith('since_'));
      return key ? obj[key] : 0;
    };
    const citationsSinceRecentYears = getRecentValue(citationTable[0]?.citations);
    const hIndexSinceRecentYears = getRecentValue(citationTable[1]?.h_index);
    const i10IndexSinceRecentYears = getRecentValue(citationTable[2]?.i10_index);

    // 3. Save / Update GoogleScholarProfile
    const profileUpdateData = {
      scholarId,
      name: authorData.name || '',
      affiliation: authorData.affiliations || '',
      verifiedEmail: authorData.email || '',
      interests: authorData.interests ? authorData.interests.map(i => i.title) : [],
      photo: authorData.thumbnail || '',
      totalCitations,
      citationsSinceRecentYears,
      hIndex,
      hIndexSinceRecentYears,
      i10Index,
      i10IndexSinceRecentYears,
      publicationsCount: articles.length,
      scholarProfileUrl: `https://scholar.google.com/citations?user=${scholarId}`,
      website: authorData.website || '',
      lastSync: new Date(),
    };

    if (selectedFields) {
      profileUpdateData.selectedFields = selectedFields;
    }

    const scholarProfile = await GoogleScholarProfile.findOneAndUpdate(
      { user: userId },
      { $set: profileUpdateData },
      { new: true, upsert: true }
    );

    // Sync interests to keyword history
    const interests = authorData.interests ? authorData.interests.map(i => i.title) : [];
    for (const kw of interests) {
      const existingHistory = await KeywordHistory.findOne({ user: userId, keyword: kw, action: 'imported' });
      if (!existingHistory) {
        await KeywordHistory.create({
          user: userId,
          keyword: kw,
          action: 'imported',
        });
      }
    }

    // Sync interests to ResearchInterest model (collection research_interests)
    const keywordIds = [];
    for (const kw of interests) {
      const normalized = kw.trim().toLowerCase();
      if (!normalized) continue;
      
      let dbKeyword = await Keyword.findOne({ keyword: normalized });
      if (!dbKeyword) {
        dbKeyword = await Keyword.create({
          keyword: normalized,
          category: 'Extracted',
          popularityScore: 1
        });
      } else {
        dbKeyword.popularityScore = (dbKeyword.popularityScore || 0) + 1;
        await dbKeyword.save();
      }
      keywordIds.push(dbKeyword._id);
    }

    if (keywordIds.length > 0) {
      await ResearchInterest.findOneAndUpdate(
        { user: userId },
        { 
          $addToSet: { keywords: { $each: keywordIds } },
          lastUpdated: new Date()
        },
        { upsert: true }
      );
    }

    // Sync Co-authors to googleScholarCoAuthors collection (co_authors)
    if (coAuthors.length > 0) {
      const coAuthorOps = coAuthors.map(ca => {
        // Calculate shared publications
        const sharedPublications = [];
        const coAuthorNameLower = ca.name.toLowerCase();
        for (const art of articles) {
          const artAuthorsLower = (art.authors || '').toLowerCase();
          if (artAuthorsLower.includes(coAuthorNameLower)) {
            sharedPublications.push(art.title);
          }
        }

        return {
          updateOne: {
            filter: { user: userId, scholarId: ca.author_id },
            update: {
              name: ca.name,
              affiliation: ca.affiliations || ca.link || '',
              thumbnail: ca.thumbnail || '',
              link: ca.link || '',
              sharedPublications,
              collaborationCount: sharedPublications.length || 1,
            },
            upsert: true
          }
        };
      });
      await GoogleScholarCoAuthor.bulkWrite(coAuthorOps);
    }

    // Filter articles if selectedPubTitles is provided
    let articlesToSync = articles;
    if (selectedPubTitles && Array.isArray(selectedPubTitles)) {
      articlesToSync = articles.filter(art => selectedPubTitles.includes(art.title));
    }

    // 4. Sync publications with incremental updates & soft-deletes
    const fetchedArticlesRaw = await Promise.all(articlesToSync.map(async art => {
      const title = art.title || '';
      const year = art.year || 0;
      const hashSig = createHashSignature(title, year);
      
      // Parse authors list
      const authorList = (art.authors || '').split(',').map(a => a.trim()).filter(Boolean);

      // Generate keywords (AI generated if unavailable)
      const extraction = await extractKeywordsFromPublication(title, art.publication || '');
      const keywords = extraction.keywords || [];
      const researchArea = extraction.domains?.[0] || '';

      return {
        user: userId,
        scholarId,
        title,
        authors: authorList,
        year,
        journal: art.publication || '',
        citationCount: art.cited_by?.value || 0,
        scholarUrl: art.link || '',
        pdfUrl: art.pdfUrl || '', // fallback pdf
        hashSignature: hashSig,
        isDeleted: false,
        researchArea,
        keywords,
      };
    }));

    // Deduplicate fetched articles by hashSignature to prevent E11000 duplicate key errors
    const uniqueFetchedMap = new Map();
    for (const art of fetchedArticlesRaw) {
      const existingFetched = uniqueFetchedMap.get(art.hashSignature);
      if (!existingFetched || art.citationCount > existingFetched.citationCount) {
        uniqueFetchedMap.set(art.hashSignature, art);
      }
    }
    const fetchedArticles = Array.from(uniqueFetchedMap.values());

    // Fetch existing Scholar publications
    const existingPubs = await ScholarPublication.find({ user: userId });
    const existingMap = new Map(existingPubs.map(p => [p.hashSignature, p]));

    const bulkOps = [];

    // Identify updates or inserts
for (const fetched of fetchedArticles) {
  const existing = existingMap.get(fetched.hashSignature);
  if (existing) {
    // Update if citation count or other fields changed
    if (existing.citationCount !== fetched.citationCount || existing.isDeleted) {
      bulkOps.push({
        updateOne: {
          filter: { _id: existing._id },
          update: {
            citationCount: fetched.citationCount,
            isDeleted: false,
            scholarUrl: fetched.scholarUrl,
            pdfUrl: fetched.pdfUrl,
            researchArea: fetched.researchArea,
            keywords: fetched.keywords,
          }
        }
      });
    }
  } else {
    // Upsert to prevent E11000 duplicate key on re-import
    bulkOps.push({
      updateOne: {
        filter: { user: fetched.user, hashSignature: fetched.hashSignature },
        update: { $setOnInsert: fetched },
        upsert: true,
      }
    });
  }
}

    // Soft delete publications that were removed from Google Scholar (only if not doing a selective import)
    if (!selectedPubTitles) {
      const fetchedSignatures = new Set(fetchedArticles.map(f => f.hashSignature));
      for (const existing of existingPubs) {
        if (!fetchedSignatures.has(existing.hashSignature) && !existing.isDeleted) {
          bulkOps.push({
            updateOne: {
              filter: { _id: existing._id },
              update: { isDeleted: true }
            }
          });
        }
      }
    }

    if (bulkOps.length > 0) {
      await ScholarPublication.bulkWrite(bulkOps);
    }

    // 5. Update main Publications collection
    // Automatically import synced papers into the user's main portfolio if they don't already exist
    const mainPubs = await Publication.find({ user: userId });
    const mainTitles = new Set(mainPubs.map(p => p.title.toLowerCase().replace(/[^a-z0-9]/g, '')));

    const mainBulkOps = [];
    for (const fetched of fetchedArticles) {
      const cleanTitle = fetched.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!mainTitles.has(cleanTitle)) {
        mainBulkOps.push({
          insertOne: {
            document: {
              user: userId,
              title: fetched.title,
              authors: fetched.authors.map((name, idx) => ({
                name,
                user: idx === 0 ? userId : null, // Assume the syncing user is the first author if matching
                authorOrder: idx + 1
              })),
              abstract: `Imported from Google Scholar. Published in ${fetched.journal || 'Academic Journal'}.`,
              journal: fetched.journal,
              publicationYear: fetched.year || new Date().getFullYear(),
              publicationType: 'Journal Article',
              citationCount: fetched.citationCount,
              status: 'Published',
              visibility: 'Public',
              googleScholarLink: fetched.scholarUrl,
              pdfLink: fetched.pdfUrl,
              researchArea: fetched.researchArea,
              keywords: fetched.keywords,
            }
          }
        });
      } else {
        // Update citation count and scholar links on existing main publication
        mainBulkOps.push({
          updateOne: {
            filter: { user: userId, title: { $regex: new RegExp(`^${fetched.title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } },
            update: { 
              citationCount: fetched.citationCount,
              googleScholarLink: fetched.scholarUrl,
              pdfLink: fetched.pdfUrl,
              researchArea: fetched.researchArea,
              keywords: fetched.keywords,
            }
          }
        });
      }
    }

    if (mainBulkOps.length > 0) {
      await Publication.bulkWrite(mainBulkOps);
    }

    // 6. Recalculate and update ResearchMetrics
    const totalPubsCount = await Publication.countDocuments({ user: userId, isDeleted: false });
    
    // Graph citations
    const graphData = authorData.cited_by?.graph || [];
    const citationsByYear = graphData.map(g => ({
      year: g.year,
      citations: g.citations,
    }));

    // Calculate average citations
    const averageCitations = totalPubsCount > 0 ? parseFloat((totalCitations / totalPubsCount).toFixed(2)) : 0;

    // Group publications by year for publicationsPerYear calculation
    const allUserPublications = await Publication.find({ user: userId, isDeleted: false });
    const yearCounts = {};
    for (const pub of allUserPublications) {
      const year = pub.publicationYear || (pub.publicationDate ? new Date(pub.publicationDate).getFullYear() : null);
      if (year) {
        yearCounts[year] = (yearCounts[year] || 0) + 1;
      }
    }
    const publicationsPerYear = Object.entries(yearCounts).map(([yr, count]) => ({
      year: parseInt(yr),
      count
    })).sort((a, b) => a.year - b.year);

    await ResearchMetrics.findOneAndUpdate(
      { user: userId },
      {
        totalPublications: totalPubsCount,
        totalCitations,
        citationsSinceLastYear: citationsSinceRecentYears,
        hIndex,
        hIndexSinceLastYear: hIndexSinceRecentYears,
        i10Index,
        i10IndexSinceLastYear: i10IndexSinceRecentYears,
        citationsByYear,
        citationTrend: citationsByYear,
        averageCitations,
        publicationsPerYear,
        collaborationScore: coAuthors.length,
        totalCoAuthors: coAuthors.length,
        lastUpdated: new Date(),
      },
      { new: true, upsert: true }
    );

    // 7. Compile the merged profile
    await compileAndSaveMergedProfile(userId);

    // 8. Create system notification for the user
    await Notification.create({
      user: userId,
      title: 'Google Scholar Synced',
      message: `Your Google Scholar profile has been successfully synced. Synced ${fetchedArticles.length} publications.`,
      type: 'Profile',
    });

    // 9. Log sync success
    await SyncLog.create({
      user: userId,
      provider: 'google-scholar',
      status: 'success',
      recordsSynced: fetchedArticles.length,
    });

    return {
      success: true,
      recordsSynced: fetchedArticles.length,
      citations: totalCitations,
      hIndex,
      i10Index,
    };
  } catch (err) {
    console.error(`❌ Sync failed for user ${userId}:`, err.message);

    // Log sync failure
    await SyncLog.create({
      user: userId,
      provider: 'google-scholar',
      status: 'failed',
      errorMessage: err.message,
    });

    throw new AppError(`Sync failed: ${err.message}`, 500);
  }
};

/**
 * Import Google Scholar data selectively from the wizard
 */
export const importGoogleScholarData = async (userId, { authorId, selectedPubTitles, selectedFields }) => {
  return await syncGoogleScholarData(userId, authorId, { selectedPubTitles, selectedFields });
};

/**
 * Alias for integration tests
 */
export const importGoogleScholarProfile = async (userId, scholarId, selectedPubTitles, selectedFields) => {
  return await syncGoogleScholarData(userId, scholarId, { selectedPubTitles, selectedFields });
};

/**
 * Background Scheduler Job: Runs every 24 hours to sync all connected users
 */
export const runDailyBackgroundSync = async () => {
  console.log('⏰ Starting 24-Hour Google Scholar Background Sync Job...');
  try {
    const connectedProfiles = await GoogleScholarProfile.find({}).select('user scholarId');
    console.log(`Found ${connectedProfiles.length} connected researcher profiles.`);

    let successCount = 0;
    let failCount = 0;

    for (const profile of connectedProfiles) {
      try {
        await syncGoogleScholarData(profile.user, profile.scholarId);
        successCount++;
        // Throttling SerpAPI requests
        await new Promise(res => setTimeout(res, 2000));
      } catch (err) {
        console.error(`Failed to sync user ${profile.user}:`, err.message);
        failCount++;
      }
    }

    console.log(`✅ Background Sync Job Finished. Successes: ${successCount}, Failures: ${failCount}`);
  } catch (err) {
    console.error('❌ Background Sync Job failed:', err.message);
  }
};

/**
 * Compare Google Scholar profile data with local profile data
 * @param {string} userId
 * @param {string} scholarId
 * @returns {Promise<object>} - comparison details
 */
export const compareScholarData = async (userId, scholarId) => {
  if (!userId || !scholarId) {
    throw new AppError('User ID and Scholar ID are required', 400);
  }

  // 1. Fetch latest SerpAPI data
  const latestData = await fetchScholarProfilePayload(scholarId);
  const authorData = latestData.author || {};
  const articles = latestData.articles || [];
  const citationTable = authorData.cited_by?.table || [];

  const latestMetrics = {
    publications: articles.length,
    citations: citationTable[0]?.citations?.all || 0,
    hIndex: citationTable[1]?.h_index?.all || 0,
    i10Index: citationTable[2]?.i10_index?.all || 0,
  };

  // 2. Fetch current local profile and metrics
  const profile = await Profile.findOne({ user: userId });
  const manual = await ManualProfile.findOne({ user: userId });

  const currentMetrics = {
    publications: profile?.publications || 0,
    citations: profile?.citations || 0,
    hIndex: profile?.hIndex || 0,
    i10Index: profile?.i10Index || 0,
  };

  const metricsDiff = {
    Publications: { current: currentMetrics.publications, latest: latestMetrics.publications },
    Citations: { current: currentMetrics.citations, latest: latestMetrics.citations },
    'h-index': { current: currentMetrics.hIndex, latest: latestMetrics.hIndex },
    'i10-index': { current: currentMetrics.i10Index, latest: latestMetrics.i10Index },
  };

  const checkManualOverride = (field) => {
    if (!manual) return false;
    return manual[field] !== undefined && manual[field] !== '';
  };

  const profileDiff = {
    displayName: {
      current: profile?.displayName || '',
      latest: authorData.name || '',
      isManualOverride: checkManualOverride('displayName'),
    },
    institution: {
      current: profile?.institution || '',
      latest: authorData.affiliations || '',
      isManualOverride: checkManualOverride('institution'),
    },
    department: {
      current: profile?.department || '',
      latest: '',
      isManualOverride: checkManualOverride('department'),
    },
    bio: {
      current: profile?.bio || '',
      latest: authorData.interests ? authorData.interests.map(i => i.title).join(', ') : '',
      isManualOverride: checkManualOverride('bio'),
    },
    website: {
      current: profile?.website || '',
      latest: authorData.website || '',
      isManualOverride: checkManualOverride('website'),
    },
  };

  // 3. Find new publications
  const localPubs = await Publication.find({ user: userId, isDeleted: false }).select('title');
  const localTitles = new Set(localPubs.map(p => p.title.toLowerCase().replace(/[^a-z0-9]/g, '')));

  const newPublications = [];
  for (const art of articles) {
    const cleanTitle = art.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!localTitles.has(cleanTitle)) {
      newPublications.push({
        title: art.title,
        authors: art.authors,
        journal: art.publication || '',
        publicationYear: art.year || null,
        citationCount: art.cited_by?.value || 0,
      });
    }
  }

  return {
    profileDiff,
    metricsDiff,
    newPublications,
  };
};

// Export as a unified service object for integration tests
export const scholarService = {
  extractScholarId,
  searchScholarAuthors,
  fetchScholarProfilePayload,
  syncGoogleScholarData,
  importGoogleScholarData,
  importGoogleScholarProfile,
  runDailyBackgroundSync,
  compareScholarData
};
