import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger';

export const connectCloudinary = async (): Promise<void> => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_SECRET_KEY,
    });
    logger.info('Cloudinary configured successfully.');
  } catch (error) {
    logger.error(`Cloudinary configuration failed: ${error}`);
  }
};
