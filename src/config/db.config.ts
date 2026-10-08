import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const rawUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
    const dbName = process.env.MONGODB_DB_NAME || 'docappoint';

    mongoose.connection.on('connected', () => {
      logger.info('Database Connected..!');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`Database connection error: ${err}`);
    });

    // Check if URI already specifies a database path or query params
    let uri = rawUri;
    const urlWithoutProtocol = rawUri.replace(/^mongodb(\+srv)?:\/\//, '');
    const hasDbOrQuery = urlWithoutProtocol.includes('/') || urlWithoutProtocol.includes('?');

    if (!hasDbOrQuery) {
      uri = `${rawUri.replace(/\/+$/, '')}/${dbName}`;
    }

    await mongoose.connect(uri, {
      dbName: !hasDbOrQuery ? dbName : undefined,
    });
  } catch (error) {
    logger.error(`Database Connection Failed: ${error}`);
    process.exit(1);
  }
};
