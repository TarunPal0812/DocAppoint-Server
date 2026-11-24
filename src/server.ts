import app from './app';
import { connectDB } from './config/db.config';
import { connectCloudinary } from './config/cloudinary.config';
import { logger } from './utils/logger';

const PORT = Number(process.env.PORT) || 3001;

const startServer = async () => {
  try {
    await connectDB();
    await connectCloudinary();

    app.listen(PORT, '0.0.0.0', () => {
      const mode = process.env.NODE_ENV || 'development';
      logger.info(`=======================================================`);
      logger.info(`DocAppointment Backend (${mode.toUpperCase()} MODE)`);
      logger.info(`=======================================================`);
      logger.info(`Listening on http://0.0.0.0:${PORT}`);
      logger.info(`Swagger Docs: http://0.0.0.0:${PORT}/api/docs`);
      logger.info(`AI Proxy:     http://0.0.0.0:${PORT}/api/ai`);
      logger.info(`Database:     MongoDB Atlas`);
      logger.info(`=======================================================`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error}`);
    process.exit(1);
  }
};

startServer().catch((error) => {
  logger.error(
    `Unhandled error during startup: ${error instanceof Error ? error.message : String(error)}`,
  );
});
