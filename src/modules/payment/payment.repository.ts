import PaymentModel, { IPayment, PaymentStatus } from './payment.model';
import AppointmentModel from '../appointment/appointment.model';

export class PaymentRepository {
  async createPayment(paymentData: Partial<IPayment>): Promise<IPayment> {
    const payment = new PaymentModel({
      ...paymentData,
      statusHistory: [
        {
          status: paymentData.status || 'created',
          timestamp: new Date(),
          details: 'Payment order initialized',
        },
      ],
    });
    return payment.save();
  }

  async findPaymentByOrderId(orderId: string): Promise<IPayment | null> {
    return PaymentModel.findOne({ orderId });
  }

  async findPaymentByPaymentId(paymentId: string): Promise<IPayment | null> {
    return PaymentModel.findOne({ paymentId });
  }

  async findPaymentById(id: string): Promise<IPayment | null> {
    return PaymentModel.findById(id);
  }

  async findPaymentsByAppointmentId(appointmentId: string): Promise<IPayment[]> {
    return PaymentModel.find({ appointmentId }).sort({ createdAt: -1 });
  }

  async findPaymentsByUserId(userId: string, limit = 50): Promise<IPayment[]> {
    return PaymentModel.find({ userId }).sort({ createdAt: -1 }).limit(limit);
  }

  async updatePayment(
    orderId: string,
    updateData: Record<string, unknown>,
  ): Promise<IPayment | null> {
    return PaymentModel.findOneAndUpdate({ orderId }, updateData, { new: true });
  }

  async recordStatusTransition(
    orderId: string,
    status: PaymentStatus,
    details?: string,
    extraFields: Record<string, unknown> = {},
  ): Promise<IPayment | null> {
    return PaymentModel.findOneAndUpdate(
      { orderId },
      {
        $set: {
          status,
          ...extraFields,
        },
        $push: {
          statusHistory: {
            status,
            timestamp: new Date(),
            details: details || `Status changed to ${status}`,
          },
        },
      },
      { new: true },
    );
  }

  async appendWebhookEvent(
    orderId: string,
    event: string,
    payload?: Record<string, unknown>,
  ): Promise<void> {
    await PaymentModel.updateOne(
      { orderId },
      {
        $push: {
          webhookEvents: {
            event,
            receivedAt: new Date(),
            payload,
          },
        },
      },
    );
  }

  async updateAppointmentPaymentStatus(appointmentId: string, payment: boolean): Promise<void> {
    await AppointmentModel.findByIdAndUpdate(appointmentId, { payment });
  }

  async findAppointmentById(appointmentId: string) {
    return AppointmentModel.findById(appointmentId);
  }

  async getMonitoringStats() {
    const statsAggregation = await PaymentModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const failureReasons = await PaymentModel.aggregate([
      { $match: { status: 'failed' } },
      {
        $group: {
          _id: { $ifNull: ['$error.description', 'Unknown reason'] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const recentTransactions = await PaymentModel.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('appointmentId', 'slotDate slotTime docData amount')
      .populate('userId', 'name email');

    let total = 0;
    let captured = 0;
    let failed = 0;
    let created = 0;
    let refunded = 0;
    let totalRevenue = 0;

    statsAggregation.forEach((s) => {
      total += s.count;
      if (s._id === 'captured') {
        captured = s.count;
        totalRevenue += s.totalAmount;
      } else if (s._id === 'failed') {
        failed = s.count;
      } else if (s._id === 'created') {
        created = s.count;
      } else if (s._id === 'refunded') {
        refunded = s.count;
      }
    });

    const successRate = total > 0 ? Number(((captured / total) * 100).toFixed(2)) : 0;

    return {
      summary: {
        total,
        captured,
        failed,
        created,
        refunded,
        totalRevenue,
        successRate,
      },
      failureReasons: failureReasons.map((r) => ({
        reason: r._id,
        count: r.count,
      })),
      recentTransactions,
    };
  }
}
