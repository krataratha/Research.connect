import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedPublicationTypes, seedLicenses } from '../database/seeder.js';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/research_connect');

    console.log(`📡 MongoDB Connected Successfully: ${conn.connection.host}`);
    
    // Trigger self-seeding for publication types and licenses
    await seedPublicationTypes();
    await seedLicenses();
    
    // Bind connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
