import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import models
import ScholarPublication from '../models/ScholarPublication.js';
import GoogleScholarProfile from '../models/GoogleScholarProfile.js';
import GoogleScholarCoAuthor from '../models/GoogleScholarCoAuthor.js';
import SyncLog from '../models/SyncLog.js';
import ResearchMetrics from '../models/ResearchMetrics.js';
import Publication from '../models/Publication.js';
import User from '../models/User.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../../.env') }); // Adjusted path since this is inside src/database/

const MONGO_URI = process.env.MONGO_URI || process.env.DATABASE_URL;

const userId = '6a40b2f8584639400e887d1c';

async function runCleanup() {
  if (!MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in the environment.');
    process.exit(1);
  }

  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB.');

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Verify user exists
    const user = await User.findById(userObjectId);
    if (!user) {
      console.log(`⚠️ User with ID ${userId} not found in User collection.`);
    } else {
      console.log(`User found: ${user.fullName} (${user.email})`);
    }

    console.log(`\nStarting cleanup for user ${userId}...`);

    // Delete Google Scholar publications
    const pubDeleteResult = await ScholarPublication.deleteMany({ user: userObjectId });
    console.log(`🧹 Deleted ${pubDeleteResult.deletedCount} ScholarPublication documents.`);

    // Delete Google Scholar profiles
    const profileDeleteResult = await GoogleScholarProfile.deleteMany({ user: userObjectId });
    console.log(`🧹 Deleted ${profileDeleteResult.deletedCount} GoogleScholarProfile documents.`);

    // Delete Google Scholar co-authors
    const coAuthorDeleteResult = await GoogleScholarCoAuthor.deleteMany({ user: userObjectId });
    console.log(`🧹 Deleted ${coAuthorDeleteResult.deletedCount} GoogleScholarCoAuthor documents.`);

    // Delete main Publications imported from Google Scholar
    // Note: We only delete main publications if their abstract matches the import pattern
    const mainPubDeleteResult = await Publication.deleteMany({ 
      user: userObjectId, 
      abstract: /Imported from Google Scholar/ 
    });
    console.log(`🧹 Deleted ${mainPubDeleteResult.deletedCount} imported Publication documents from main publications.`);

    // Delete ResearchMetrics
    const metricsDeleteResult = await ResearchMetrics.deleteMany({ user: userObjectId });
    console.log(`🧹 Deleted ${metricsDeleteResult.deletedCount} ResearchMetrics documents.`);

    // Delete SyncLogs
    const logDeleteResult = await SyncLog.deleteMany({ user: userObjectId });
    console.log(`🧹 Deleted ${logDeleteResult.deletedCount} SyncLog documents.`);

    console.log('\n✅ Cleanup complete! User sync state has been fully reset.');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

runCleanup();
