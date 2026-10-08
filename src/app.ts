import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import cron from 'node-cron';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config';
import { logger } from './utils/logger';
import { globalErrorHandler } from './middlewares/errorHandler.middleware';

import adminRouter from './modules/admin/admin.routes';
import doctorRoutes from './modules/doctor/doctor.routes';
import userRoute from './modules/user/user.routes';

const app: Application = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

app.use(
  cors({
    origin: [
      'https://docappoint-client.netlify.app',
      'https://docappoint-admin.netlify.app',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
    ],
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }),
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
});
app.use('/api', apiLimiter);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRoutes);
app.use('/api/user', userRoute);

app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to the DocAppointment API (Modular Monolith)',
    documentation: '/api/docs',
    endpoints: {
      admin: '/api/admin',
      doctor: '/api/doctor',
      user: '/api/user',
      wakeup: '/api/wakeup',
    },
  });
});

app.get('/api/wakeup', (_req: Request, res: Response) => {
  logger.info('Wakeup API hit!');
  res.status(200).json({ success: true, message: 'Server is awake!' });
});

cron.schedule('*/14 * * * *', () => {
  const PORT = process.env.PORT || 3001;
  const url = process.env.SERVER_URL || `http://localhost:${PORT}`;
  fetch(url)
    .then(() => logger.info(`[Cron Job] Server pinged successfully`))
    .catch((err: Error) => logger.error(`[Cron Job] Error pinging server: ${err.message}`));
});

app.use(globalErrorHandler);

export default app;
