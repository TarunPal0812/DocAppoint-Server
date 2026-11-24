import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    appointmentId: z.string().min(1, 'Appointment ID is required'),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpay_order_id: z.string().min(1, 'Order ID is required'),
    razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
    razorpay_signature: z.string().min(1, 'Signature is required'),
  }),
});

export const recordFailureSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    paymentId: z.string().optional(),
    error: z
      .object({
        code: z.string().optional(),
        description: z.string().optional(),
        source: z.string().optional(),
        step: z.string().optional(),
        reason: z.string().optional(),
      })
      .optional(),
  }),
});
