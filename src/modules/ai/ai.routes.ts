import express from 'express';
import { validateRequest } from '../../middlewares/validate.middleware';
import { aiChatSchema } from './ai.validation';
import { chat, getDoctors, getHealth, getHistory } from './ai.controller';

const aiRouter = express.Router();

aiRouter.post('/chat', validateRequest(aiChatSchema), chat);
aiRouter.get('/history/:sessionId', getHistory);
aiRouter.get('/health', getHealth);
aiRouter.get('/doctors', getDoctors);

export default aiRouter;
