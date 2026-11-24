import crypto from 'crypto';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { AppError } from '../../utils/AppError';

jest.mock('./payment.repository');
jest.mock('razorpay');

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockPaymentRepository: jest.Mocked<PaymentRepository>;
  const mockSecret = 'test_secret_12345';

  beforeEach(() => {
    process.env.KEY_SECRET = mockSecret;
    process.env.RAZORPAY_KEY_SECRET = mockSecret;
    process.env.RAZORPAY_WEBHOOK_SECRET = mockSecret;

    mockPaymentRepository = new PaymentRepository() as jest.Mocked<PaymentRepository>;
    paymentService = new PaymentService(mockPaymentRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should throw AppError 404 if appointment does not exist', async () => {
      mockPaymentRepository.findAppointmentById.mockResolvedValue(null);

      await expect(paymentService.createOrder('user123', 'app123')).rejects.toThrow(AppError);
    });

    it('should throw AppError 400 if appointment is cancelled', async () => {
      mockPaymentRepository.findAppointmentById.mockResolvedValue({
        _id: 'app123',
        cancelled: true,
        payment: false,
      } as any);

      await expect(paymentService.createOrder('user123', 'app123')).rejects.toThrow(
        'Cannot pay for a cancelled appointment',
      );
    });

    it('should throw AppError 400 if appointment is already paid', async () => {
      mockPaymentRepository.findAppointmentById.mockResolvedValue({
        _id: 'app123',
        cancelled: false,
        payment: true,
      } as any);

      await expect(paymentService.createOrder('user123', 'app123')).rejects.toThrow(
        'Appointment is already paid',
      );
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment with valid HMAC SHA256 signature and mark appointment paid', async () => {
      const orderId = 'order_123';
      const paymentId = 'pay_456';
      const validSignature = crypto
        .createHmac('sha256', mockSecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      mockPaymentRepository.findPaymentByOrderId.mockResolvedValue({
        orderId,
        appointmentId: 'app123',
        status: 'created',
      } as any);

      const result = await paymentService.verifyPayment('user123', {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
      });

      expect(result.success).toBe(true);
      expect(mockPaymentRepository.recordStatusTransition).toHaveBeenCalledWith(
        orderId,
        'captured',
        expect.any(String),
        expect.objectContaining({ paymentId, signature: validSignature }),
      );
      expect(mockPaymentRepository.updateAppointmentPaymentStatus).toHaveBeenCalledWith(
        'app123',
        true,
      );
    });

    it('should reject invalid signature and record payment failure', async () => {
      const orderId = 'order_123';
      const paymentId = 'pay_456';
      const invalidSignature = 'invalid_tampered_signature_hex';

      mockPaymentRepository.findPaymentByOrderId.mockResolvedValue({
        orderId,
        appointmentId: 'app123',
        status: 'created',
      } as any);

      await expect(
        paymentService.verifyPayment('user123', {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: invalidSignature,
        }),
      ).rejects.toThrow('Payment verification failed: Invalid signature');

      expect(mockPaymentRepository.recordStatusTransition).toHaveBeenCalledWith(
        orderId,
        'failed',
        expect.any(String),
        expect.objectContaining({
          error: expect.objectContaining({ code: 'INVALID_SIGNATURE' }),
        }),
      );
    });
  });

  describe('handleWebhook', () => {
    it('should successfully handle payment.captured webhook event', async () => {
      const eventPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_789',
              order_id: 'order_123',
              method: 'upi',
            },
          },
        },
      };

      const rawBody = JSON.stringify(eventPayload);
      const signature = crypto.createHmac('sha256', mockSecret).update(rawBody).digest('hex');

      mockPaymentRepository.findPaymentByOrderId.mockResolvedValue({
        orderId: 'order_123',
        appointmentId: 'app123',
      } as any);

      const result = await paymentService.handleWebhook(rawBody, signature);
      expect(result.status).toBe('ok');
      expect(result.event).toBe('payment.captured');
      expect(mockPaymentRepository.recordStatusTransition).toHaveBeenCalledWith(
        'order_123',
        'captured',
        expect.any(String),
        expect.objectContaining({ paymentId: 'pay_789', method: 'upi' }),
      );
      expect(mockPaymentRepository.updateAppointmentPaymentStatus).toHaveBeenCalledWith(
        'app123',
        true,
      );
    });

    it('should successfully handle payment.failed webhook event and save error record', async () => {
      const eventPayload = {
        event: 'payment.failed',
        payload: {
          payment: {
            entity: {
              id: 'pay_failed_999',
              order_id: 'order_123',
              error_code: 'BAD_REQUEST_ERROR',
              error_description: 'Payment was declined by bank',
              error_source: 'bank',
            },
          },
        },
      };

      const rawBody = JSON.stringify(eventPayload);
      const signature = crypto.createHmac('sha256', mockSecret).update(rawBody).digest('hex');

      const result = await paymentService.handleWebhook(rawBody, signature);
      expect(result.status).toBe('ok');
      expect(mockPaymentRepository.recordStatusTransition).toHaveBeenCalledWith(
        'order_123',
        'failed',
        expect.any(String),
        expect.objectContaining({
          paymentId: 'pay_failed_999',
          error: expect.objectContaining({
            code: 'BAD_REQUEST_ERROR',
            description: 'Payment was declined by bank',
          }),
        }),
      );
    });

    it('should reject webhook with invalid signature', async () => {
      const rawBody = JSON.stringify({ event: 'payment.captured' });
      const badSignature =
        'invalid_hex_string_1234567890123456789012345678901234567890123456789012345678901234';

      await expect(paymentService.handleWebhook(rawBody, badSignature)).rejects.toThrow(
        'Invalid webhook signature',
      );
    });
  });

  describe('recordFailure', () => {
    it('should record client-side failure telemetry', async () => {
      mockPaymentRepository.findPaymentByOrderId.mockResolvedValue({
        orderId: 'order_123',
      } as any);

      const result = await paymentService.recordFailure('user123', {
        orderId: 'order_123',
        paymentId: 'pay_failed_1',
        error: { code: 'USER_CANCELLED', description: 'User closed modal' },
      });

      expect(result.success).toBe(true);
      expect(mockPaymentRepository.recordStatusTransition).toHaveBeenCalledWith(
        'order_123',
        'failed',
        expect.any(String),
        expect.objectContaining({
          paymentId: 'pay_failed_1',
          error: expect.objectContaining({ code: 'USER_CANCELLED' }),
        }),
      );
    });
  });
});
