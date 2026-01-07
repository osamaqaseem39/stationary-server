import { Schema, model, Types } from 'mongoose';

export interface IProduct {
  _id: Types.ObjectId;
  name: string;
  description: string;
  categoryId: Types.ObjectId;
  brand?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: String,
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: String,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const ProductModel = model<IProduct>('Product', ProductSchema);

