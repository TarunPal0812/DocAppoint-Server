import app from './app';
import { connectDB } from './config/db.config';
import { connectCloudinary } from './config/cloudinary.config';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectDB();
    await connectCloudinary();

    app.listen(PORT, () => {
      const mode = process.env.NODE_ENV || 'development';
      const baseUrl = `http://localhost:${PORT}`;

      logger.info(`=======================================================`);
      logger.info(`DocAppointment Backend (${mode.toUpperCase()} MODE)`);
      logger.info(`=======================================================`);
      logger.info(`Port [${PORT}]  -> Main API Server: ${baseUrl}`);
      logger.info(`Port [${PORT}]  -> Swagger Docs:   ${baseUrl}/api/docs`);
      logger.info(`Port [27017] -> MongoDB Service: docappoint`);
      logger.info(`Port [8081]  -> Mongo Express GUI (if Docker enabled)`);
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
