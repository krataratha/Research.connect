const mongoose = require('mongoose');
const logger = require('../../common/logger/winston');
const dns = require('dns');

// Fallback to Google and Cloudflare public DNS in case system DNS cannot resolve MongoDB SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (err) {
  logger.warn('Failed to set fallback DNS servers:', err.message);
}

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error('MONGO_URI environment variable is required');
}

const options = {
  maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE, 10) || 10,
  minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE, 10) || 5,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 5000,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  retryReads: true,
  writeConcern: { w: 'majority' }
};

let connectionPromise = null;
let retryCount = 0;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    try {
      logger.info('Attempting to connect to MongoDB...');
      await mongoose.connect(MONGO_URI, options);
      retryCount = 0;
      return mongoose.connection;
    } catch (error) {
      retryCount++;
      const delay = Math.min(Math.pow(2, retryCount) * 1000, 30000);
      logger.error(`MongoDB connection failed (attempt ${retryCount}): ${error.message}`);
      logger.info(`Retrying in ${delay}ms...`);
      
      connectionPromise = null;
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectDB();
    }
  })();

  return connectionPromise;
};

mongoose.connection.on('connected', () => logger.info('MongoDB connected.'));
mongoose.connection.on('error', (err) => logger.error('MongoDB error:', err));
mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected.'));

const checkHealth = () => {
  const readyState = mongoose.connection.readyState;
  const isHealthy = readyState === 1;
  
  return {
    isHealthy,
    status: ['disconnected', 'connected', 'connecting', 'disconnecting', 'uninitialized'][readyState] || 'unknown',
    replicaSet: mongoose.connection.getClient()?.topology?.description?.setName || 'n/a'
  };
};

const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info('MongoDB connection closed.');
  }
};

module.exports = {
  connectDB,
  checkHealth,
  closeDB
};
