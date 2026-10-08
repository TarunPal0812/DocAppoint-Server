import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.connection.on('connected', () => {
      logger.info('Database Connected..!');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`Database connection error: ${err}`);
    });

    await mongoose.connect(`${process.env.MONGODB_URI}/docappoint`);
  } catch (error) {
    logger.error(`Database Connection Failed: ${error}`);
    process.exit(1);
  }
};
