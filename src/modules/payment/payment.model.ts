import mongoose, { Document, Schema } from 'mongoose';

export type PaymentStatus = 'created' | 'attempted' | 'captured' | 'failed' | 'refunded';

export interface IPaymentError {
  code?: string;
  description?: string;
  source?: string;
  step?: string;
  reason?: string;
}

export interface IPaymentStatusHistory {
  status: PaymentStatus;
  timestamp: Date;
  details?: string;
}

export interface IPayment extends Document {
  appointmentId: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  orderId: string;
  paymentId?: string;
  signature?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: string;
  error?: IPaymentError;
  statusHistory: IPaymentStatusHistory[];
  webhookEvents?: { event: string; receivedAt: Date; payload?: Record<string, unknown> }[];
  receipt?: string;
  notes?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'AppointmentModel',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'UserModel',
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    paymentId: {
      type: String,
      sparse: true,
      index: true,
    },
    signature: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['created', 'attempted', 'captured', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
    method: {
      type: String,
    },
    error: {
      code: { type: String },
      description: { type: String },
      source: { type: String },
      step: { type: String },
      reason: { type: String },
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        details: { type: String },
      },
    ],
    webhookEvents: [
      {
        event: { type: String },
        receivedAt: { type: Date, default: Date.now },
        payload: { type: Schema.Types.Mixed },
      },
    ],
    receipt: {
      type: String,
    },
    notes: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  },
);

const PaymentModel = mongoose.model<IPayment>('PaymentModel', paymentSchema);

export default PaymentModel;
