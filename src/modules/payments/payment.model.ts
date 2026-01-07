import { Schema, model, Types } from 'mongoose';

export interface IPayment {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  provider: 'stripe' | 'razorpay';
  transactionId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  paymentMethod?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    provider: { type: String, enum: ['stripe', 'razorpay'], required: true },
    transactionId: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentMethod: String,
    metadata: { type: Map, of: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const PaymentModel = model<IPayment>('Payment', PaymentSchema);

