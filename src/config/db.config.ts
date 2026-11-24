import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      logger.error('MONGODB_URI is not configured in environment variables');
      process.exit(1);
    }
    const dbName = process.env.MONGODB_DB_NAME || 'docappoint';

    mongoose.connection.on('connected', () => {
      logger.info('Database Connected..!');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`Database connection error: ${err}`);
    });

    await mongoose.connect(uri, {
      dbName,
    });
  } catch (error) {
    logger.error(`Database Connection Failed: ${error}`);
    process.exit(1);
  }
};
