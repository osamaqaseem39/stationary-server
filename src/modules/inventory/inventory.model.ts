import { Schema, model, Types } from 'mongoose';

export interface IInventory {
  _id: Types.ObjectId;
  variantId: Types.ObjectId;
  quantity: number;
  reservedQuantity?: number;
  lowStockThreshold?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    variantId: { type: Schema.Types.ObjectId, ref: 'ProductVariant', required: true, unique: true },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    reservedQuantity: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10 }
  },
  { timestamps: true }
);

export const InventoryModel = model<IInventory>(
  'Inventory',
  InventorySchema
);

