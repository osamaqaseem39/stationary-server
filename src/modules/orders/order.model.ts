import { Schema, model, Types } from 'mongoose';

export interface IOrderItem {
  variantId: Types.ObjectId;
  price: number;
  quantity: number;
  productName?: string;
  variantAttributes?: Record<string, any>;
}

export interface IOrder {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  addressId: Types.ObjectId;
  items: IOrderItem[];
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  total: number;
  subtotal: number;
  shippingCost?: number;
  tax?: number;
  orderNumber: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  variantId: { type: Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  productName: String,
  variantAttributes: { type: Map, of: Schema.Types.Mixed }
});

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    addressId: { type: Schema.Types.ObjectId, ref: 'Address', required: true },
    items: [OrderItemSchema],
    status: {
      type: String,
      enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending'
    },
    total: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    orderNumber: { type: String, required: true, unique: true },
    notes: String
  },
  { timestamps: true }
);

// Generate order number before save
OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

export const OrderModel = model<IOrder>('Order', OrderSchema);

