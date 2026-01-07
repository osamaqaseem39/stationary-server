import { Schema, model, Types } from 'mongoose';

export interface IProductVariant {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  sku: string;
  price: number;
  compareAtPrice?: number;
  attributes: {
    size?: string;
    color?: string;
    gender?: 'male' | 'female' | 'unisex';
    [key: string]: any;
  };
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    attributes: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {}
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Convert attributes Map to Object for better TypeScript support
ProductVariantSchema.set('toJSON', {
  transform: function(doc, ret) {
    if (ret.attributes instanceof Map) {
      ret.attributes = Object.fromEntries(ret.attributes);
    }
    return ret;
  }
});

export const ProductVariantModel = model<IProductVariant>(
  'ProductVariant',
  ProductVariantSchema
);

