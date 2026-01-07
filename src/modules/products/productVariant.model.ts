import { Schema, model, Types } from 'mongoose';

export interface IProductVariant {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  sku: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  
  // Inventory
  trackQuantity?: boolean;
  quantity?: number;
  allowBackorder?: boolean;
  lowStockThreshold?: number;
  
  // Shipping
  weight?: number;
  requiresShipping?: boolean;
  
  // Attributes
  attributes: {
    size?: string;
    color?: string;
    material?: string;
    style?: string;
    gender?: 'male' | 'female' | 'unisex' | 'kids';
    [key: string]: any;
  };
  
  // Status
  isActive: boolean;
  taxable?: boolean;
  
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true, unique: true },
    barcode: String,
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    costPerItem: { type: Number, min: 0 },
    
    // Inventory
    trackQuantity: { type: Boolean, default: true },
    quantity: { type: Number, min: 0 },
    allowBackorder: { type: Boolean, default: false },
    lowStockThreshold: { type: Number, min: 0 },
    
    // Shipping
    weight: { type: Number, min: 0 },
    requiresShipping: { type: Boolean, default: true },
    
    // Attributes
    attributes: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {}
    },
    
    // Status
    isActive: { type: Boolean, default: true },
    taxable: { type: Boolean, default: true }
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
