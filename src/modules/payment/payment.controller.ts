import { Request, Response } from 'express';
import { catchAsync } from '../../middlewares/asyncWrapper';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';

const paymentRepository = new PaymentRepository();
export const paymentService = new PaymentService(paymentRepository);

export const createOrder = catchAsync(
  async (req: Request & { user: { userId: string } }, res: Response) => {
    const { appointmentId } = req.body;
    const order = await paymentService.createOrder(req.user.userId, appointmentId);
    res.status(200).json({
      success: true,
      order,
    });
  },
);

export const verifyPayment = catchAsync(
  async (req: Request & { user: { userId: string } }, res: Response) => {
    const result = await paymentService.verifyPayment(req.user.userId, req.body);
    res.status(200).json(result);
  },
);

export const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string;
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody || JSON.stringify(req.body);

  const result = await paymentService.handleWebhook(rawBody, signature);
  res.status(200).json(result);
});

export const recordFailure = catchAsync(
  async (req: Request & { user: { userId: string } }, res: Response) => {
    const result = await paymentService.recordFailure(req.user.userId, req.body);
    res.status(200).json(result);
  },
);

export const getUserPaymentHistory = catchAsync(
  async (req: Request & { user: { userId: string } }, res: Response) => {
    const payments = await paymentService.getUserPaymentHistory(req.user.userId);
    res.status(200).json({
      success: true,
      payments,
    });
  },
);

export const getMonitoring = catchAsync(async (_req: Request, res: Response) => {
  const stats = await paymentService.getMonitoringDashboard();
  res.status(200).json({
    success: true,
    ...stats,
  });
});
