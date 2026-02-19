import mongoose from 'mongoose';
import logger from '../utils/logger.js';

/**
 * Connects to MongoDB with enhanced error handling and ESM syntax
 */
const connectDB = async () => {
  try {
    // 1. Prioritize the .env URI, fallback to IPv4 localhost to prevent IPv6 crashes
    const uri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      'mongodb://127.0.0.1:27017/recalliq';

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Listen for connection events
    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('✅ MongoDB reconnected.');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB runtime error:', err.message);
    });

    return conn;
  } catch (err) {
    logger.error('💥 MongoDB connection error during startup:', err.message);
    
    // Provide a helpful hint for the most common local error
    if (err.message.includes('ECONNREFUSED')) {
      logger.error('👉 TIP: Ensure your MongoDB service is running (services.msc on Windows).');
    }
    
    process.exit(1);
  }
};

export default connectDB;