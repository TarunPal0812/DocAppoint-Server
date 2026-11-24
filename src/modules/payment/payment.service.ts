import crypto from 'crypto';
import razorpay from 'razorpay';
import { PaymentRepository } from './payment.repository';
import { IPaymentError } from './payment.model';
import { AppError } from '../../utils/AppError';
import { logger } from '../../utils/logger';

export interface VerifyPaymentInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RecordFailureInput {
  orderId: string;
  paymentId?: string;
  error?: IPaymentError;
}

export class PaymentService {
  private razorpayInstance: razorpay;
  private keySecret: string;
  private webhookSecret: string;

  constructor(private readonly paymentRepository: PaymentRepository) {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.KEY_ID || 'mock_key_id';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.KEY_SECRET || 'mock_key_secret';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || this.keySecret;

    this.razorpayInstance = new razorpay({
      key_id: keyId,
      key_secret: this.keySecret,
    });
  }

  async createOrder(userId: string, appointmentId: string) {
    const appointment = await this.paymentRepository.findAppointmentById(appointmentId);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    if (appointment.cancelled) {
      throw new AppError('Cannot pay for a cancelled appointment', 400);
    }

    if (appointment.payment) {
      throw new AppError('Appointment is already paid', 400);
    }

    const currency = process.env.CURRENCY || 'INR';
    const amountInSubunits = Math.round(appointment.amount * 100);

    const options = {
      amount: amountInSubunits,
      currency,
      receipt: appointmentId,
      notes: {
        appointmentId,
        userId: userId.toString(),
      },
    };

    const order = await this.razorpayInstance.orders.create(options);

    await this.paymentRepository.createPayment({
      appointmentId,
      userId,
      orderId: order.id,
      amount: appointment.amount,
      currency,
      status: 'created',
      receipt: appointmentId,
      notes: {
        appointmentId,
        userId: userId.toString(),
      },
    });

    logger.info(`Payment order created: ${order.id} for appointment: ${appointmentId}`);
    return order;
  }

  async verifyPayment(userId: string, input: VerifyPaymentInput) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = input;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new AppError('Missing payment verification parameters', 400);
    }

    const paymentRecord = await this.paymentRepository.findPaymentByOrderId(razorpay_order_id);
    if (!paymentRecord) {
      throw new AppError('Payment record not found for this order', 404);
    }

    // Cryptographic HMAC SHA256 Signature Verification
    const generatedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const genBuf = Buffer.from(generatedSignature, 'utf-8');
    const sigBuf = Buffer.from(razorpay_signature, 'utf-8');

    const isSignatureValid =
      genBuf.length === sigBuf.length && crypto.timingSafeEqual(genBuf, sigBuf);

    if (!isSignatureValid) {
      await this.paymentRepository.recordStatusTransition(
        razorpay_order_id,
        'failed',
        'Signature verification mismatch',
        {
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          error: {
            code: 'INVALID_SIGNATURE',
            description: 'HMAC SHA256 verification failed',
            source: 'gateway',
          },
        },
      );
      logger.warn(`Signature verification failed for order ${razorpay_order_id}`);
      throw new AppError('Payment verification failed: Invalid signature', 400);
    }

    // Fetch method and details from Razorpay if available
    let paymentMethod = 'unknown';
    try {
      const paymentInfo = await this.razorpayInstance.payments.fetch(razorpay_payment_id);
      paymentMethod = paymentInfo.method || 'unknown';
    } catch (err: unknown) {
      logger.warn(`Could not fetch payment details from Razorpay: ${err}`);
    }

    // Update payment record to captured
    await this.paymentRepository.recordStatusTransition(
      razorpay_order_id,
      'captured',
      'Payment verified successfully via client callback',
      {
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        method: paymentMethod,
      },
    );

    // Mark appointment as paid
    await this.paymentRepository.updateAppointmentPaymentStatus(
      paymentRecord.appointmentId.toString(),
      true,
    );

    logger.info(`Payment successfully captured and verified for order ${razorpay_order_id}`);
    return {
      success: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      message: 'Payment verified and appointment confirmed',
    };
  }

  async handleWebhook(rawBody: string | Buffer, signature: string) {
    if (!signature) {
      throw new AppError('Missing x-razorpay-signature header', 400);
    }

    const bodyString = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody;

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(bodyString)
      .digest('hex');

    const isSignatureValid =
      signature.length === expectedSignature.length &&
      crypto.timingSafeEqual(
        Buffer.from(signature, 'utf-8'),
        Buffer.from(expectedSignature, 'utf-8'),
      );

    if (!isSignatureValid) {
      logger.warn('Webhook signature verification failed');
      throw new AppError('Invalid webhook signature', 400);
    }

    const eventPayload = JSON.parse(bodyString);
    const event = eventPayload.event;
    logger.info(`Processing Razorpay webhook event: ${event}`);

    switch (event) {
      case 'payment.captured':
      case 'order.paid': {
        const paymentEntity = eventPayload.payload?.payment?.entity;
        const orderId = paymentEntity?.order_id || eventPayload.payload?.order?.entity?.id;
        const paymentId = paymentEntity?.id;
        const method = paymentEntity?.method;

        if (orderId) {
          const payment = await this.paymentRepository.findPaymentByOrderId(orderId);
          if (payment) {
            await this.paymentRepository.recordStatusTransition(
              orderId,
              'captured',
              `Payment confirmed via webhook event: ${event}`,
              {
                paymentId: paymentId || payment.paymentId,
                method: method || payment.method,
              },
            );

            await this.paymentRepository.updateAppointmentPaymentStatus(
              payment.appointmentId.toString(),
              true,
            );
            await this.paymentRepository.appendWebhookEvent(orderId, event, eventPayload);
            logger.info(`Webhook: Payment captured and marked for order ${orderId}`);
          }
        }
        break;
      }

      case 'payment.failed': {
        const paymentEntity = eventPayload.payload?.payment?.entity;
        const orderId = paymentEntity?.order_id;
        const paymentId = paymentEntity?.id;

        if (orderId) {
          const errorDetails: IPaymentError = {
            code: paymentEntity?.error_code,
            description: paymentEntity?.error_description,
            source: paymentEntity?.error_source,
            step: paymentEntity?.error_step,
            reason: paymentEntity?.error_reason,
          };

          await this.paymentRepository.recordStatusTransition(
            orderId,
            'failed',
            `Payment failure reported via webhook: ${errorDetails.description || 'Unknown error'}`,
            {
              paymentId,
              error: errorDetails,
            },
          );
          await this.paymentRepository.appendWebhookEvent(orderId, event, eventPayload);
          logger.warn(`Webhook: Payment failed for order ${orderId}: ${errorDetails.description}`);
        }
        break;
      }

      case 'refund.created':
      case 'refund.processed': {
        const refundEntity = eventPayload.payload?.refund?.entity;
        const paymentId = refundEntity?.payment_id;

        if (paymentId) {
          const payment = await this.paymentRepository.findPaymentByPaymentId(paymentId);
          if (payment) {
            await this.paymentRepository.recordStatusTransition(
              payment.orderId,
              'refunded',
              `Refund processed via webhook: ${refundEntity?.id}`,
            );
            await this.paymentRepository.appendWebhookEvent(payment.orderId, event, eventPayload);
            logger.info(`Webhook: Refund processed for payment ${paymentId}`);
          }
        }
        break;
      }

      default:
        logger.info(`Unhandled webhook event: ${event}`);
    }

    return { status: 'ok', event };
  }

  async recordFailure(userId: string, input: RecordFailureInput) {
    const { orderId, paymentId, error } = input;

    const paymentRecord = await this.paymentRepository.findPaymentByOrderId(orderId);
    if (!paymentRecord) {
      throw new AppError('Payment record not found', 404);
    }

    await this.paymentRepository.recordStatusTransition(
      orderId,
      'failed',
      `Client recorded failure: ${error?.description || 'Payment rejected or cancelled by user'}`,
      {
        paymentId: paymentId || paymentRecord.paymentId,
        error: error || {
          code: 'USER_CANCELLED_OR_DROPPED',
          description: 'Payment modal was dismissed or failed on client',
          source: 'customer',
        },
      },
    );

    logger.info(`Recorded payment failure for order: ${orderId}`);
    return { success: true, message: 'Failure recorded successfully' };
  }

  async getUserPaymentHistory(userId: string) {
    return this.paymentRepository.findPaymentsByUserId(userId);
  }

  async getMonitoringDashboard() {
    return this.paymentRepository.getMonitoringStats();
  }
}
