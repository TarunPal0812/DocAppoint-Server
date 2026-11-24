import express from 'express';
import {
  createOrder,
  verifyPayment,
  handleWebhook,
  recordFailure,
  getUserPaymentHistory,
  getMonitoring,
} from './payment.controller';
import { authUser } from '../../middlewares/auth.user.guard';
import { authAdmin } from '../../middlewares/auth.admin.guard';
import { validateRequest } from '../../middlewares/validate.middleware';
import { createOrderSchema, verifyPaymentSchema, recordFailureSchema } from './payment.validation';

const paymentRouter = express.Router();

// Webhook endpoint (Public - Cryptographic HMAC signature verified in service)
paymentRouter.post('/webhook', handleWebhook);

// User payment operations
paymentRouter.post('/create-order', authUser, validateRequest(createOrderSchema), createOrder);
paymentRouter.post('/verify', authUser, validateRequest(verifyPaymentSchema), verifyPayment);
paymentRouter.post(
  '/record-failure',
  authUser,
  validateRequest(recordFailureSchema),
  recordFailure,
);
paymentRouter.get('/history', authUser, getUserPaymentHistory);

// Admin / System Monitoring
paymentRouter.get('/monitoring', authAdmin, getMonitoring);

export default paymentRouter;
