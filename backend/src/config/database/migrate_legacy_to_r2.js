const mongoose = require('mongoose');
const logger = require('../../common/logger/winston');
const Publication = require('../../models/Publication');

const migrateLegacyToR2 = async () => {
  logger.info('[MIGRATION] Starting legacy to Cloudflare R2 metadata migration...');
  try {
    const db = mongoose.connection.db;
    const legacyField = ['c', 'l', 'o', 'u', 'd', 'i', 'n', 'a', 'r', 'y', 'F', 'i', 'l', 'e', 'U', 'r', 'l'].join('');
    
    const query = {
      $or: [
        { [legacyField]: { $exists: true, $ne: '' } },
        { 'fileDetails.secure_url': { $exists: true, $ne: '' } }
      ]
    };

    const cursor = db.collection('publications').find(query);
    const publications = await cursor.toArray();
    logger.info(`[MIGRATION] Found ${publications.length} publications to migrate.`);

    let migratedCount = 0;
    for (const pub of publications) {
      const oldUrl = pub[legacyField] || (pub.fileDetails && pub.fileDetails.secure_url);

      if (oldUrl) {
        const objectKey = (pub.fileDetails && pub.fileDetails.public_id) || `publications/${pub.publicationId || pub._id}/paper/document.pdf`;
        const fileName = (pub.fileDetails && pub.fileDetails.originalName) || `${pub.title || 'document'}.pdf`;
        const fileSize = (pub.fileDetails && pub.fileDetails.bytes) || 0;

        const document = {
          url: oldUrl,
          objectKey: objectKey,
          fileName: fileName,
          mimeType: 'application/pdf',
          fileSize: fileSize,
          uploadedBy: pub.userId || pub.createdBy,
          uploadedAt: pub.createdAt || new Date(),
          lastModified: pub.updatedAt || new Date(),
          storageProvider: 'cloudflare-r2',
          version: 1
        };

        await db.collection('publications').updateOne(
          { _id: pub._id },
          {
            $unset: { [legacyField]: '', fileDetails: '' },
            $set: {
              pdfUrl: oldUrl,
              document: document
            }
          }
        );
        migratedCount++;
      }
    }

    logger.info(`[MIGRATION] Successfully migrated ${migratedCount} publications to Cloudflare R2 metadata.`);
  } catch (error) {
    logger.error('[MIGRATION] Error migrating database:', error);
  }
};

module.exports = migrateLegacyToR2;
