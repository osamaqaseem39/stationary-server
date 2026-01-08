import { Schema, model, Types } from 'mongoose';

export interface IProduct {
  _id: Types.ObjectId;
  name: string;
  shortDescription?: string;
  description?: string;
  categoryId?: Types.ObjectId; // Optional for bundles
  productType?: string;
  brand?: string; // Keep for backward compatibility
  brandId?: Types.ObjectId; // Reference to Brand model
  vendor?: string;
  tags?: string[];
  status?: 'active' | 'draft' | 'archived';
  featured?: boolean;
  isActive: boolean;
  
  // Uniform-specific fields
  size?: string;
  color?: string;
  gender?: 'male' | 'female' | 'unisex' | 'kids';
  material?: string;
  style?: string;
  schoolName?: string;
  grade?: string;
  uniformType?: string; // e.g., 'school', 'sports', 'formal'
  
  // Pricing
  regularPrice?: number;
  salePrice?: number;
  taxStatus?: 'taxable' | 'shipping' | 'none';
  taxClass?: string;
  
  // Inventory
  sku?: string;
  manageStock?: boolean;
  stockQuantity?: number;
  stockStatus?: 'instock' | 'outofstock' | 'onbackorder';
  backorders?: 'no' | 'notify' | 'yes';
  lowStockThreshold?: number;
  
  // Shipping
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  shippingClass?: string;
  requiresShipping?: boolean;
  shippingTaxable?: boolean;
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoSlug?: string;
  seoKeywords?: string;
  
  // Images
  images?: string[];
  
  // Product Bundle/Set
  isBundle?: boolean;
  bundleItems?: Array<{
    productId: Types.ObjectId;
    quantity: number;
    name?: string; // Cached product name for display
  }>;
  
  // Additional
  purchaseNote?: string;
  menuOrder?: number;
  reviewsAllowed?: boolean;
  catalogVisibility?: 'visible' | 'catalog' | 'search' | 'hidden';
  
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    shortDescription: String,
    description: String,
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: false }, // Optional for bundles
    productType: String,
    brand: String, // Keep for backward compatibility
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand' },
    vendor: String,
    tags: [String],
    status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active' },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    
    // Uniform-specific fields
    size: String,
    color: String,
    gender: { type: String, enum: ['male', 'female', 'unisex', 'kids'] },
    material: String,
    style: String,
    schoolName: String,
    grade: String,
    uniformType: String,
    
    // Pricing
    regularPrice: { type: Number, min: 0 },
    salePrice: { type: Number, min: 0 },
    taxStatus: { type: String, enum: ['taxable', 'shipping', 'none'], default: 'taxable' },
    taxClass: String,
    
    // Inventory
    sku: String,
    manageStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, min: 0 },
    stockStatus: { type: String, enum: ['instock', 'outofstock', 'onbackorder'], default: 'instock' },
    backorders: { type: String, enum: ['no', 'notify', 'yes'], default: 'no' },
    lowStockThreshold: { type: Number, min: 0 },
    
    // Shipping
    weight: { type: Number, min: 0 },
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    shippingClass: String,
    requiresShipping: { type: Boolean, default: true },
    shippingTaxable: { type: Boolean, default: true },
    
    // SEO
    seoTitle: String,
    seoDescription: String,
    seoSlug: String,
    seoKeywords: String,
    
    // Images
    images: [String],
    
    // Product Bundle/Set
    isBundle: { type: Boolean, default: false },
    bundleItems: [{
      productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, min: 1, default: 1 },
      name: String // Cached product name for easier display
    }],
    
    // Additional
    purchaseNote: String,
    menuOrder: { type: Number, default: 0 },
    reviewsAllowed: { type: Boolean, default: true },
    catalogVisibility: { type: String, enum: ['visible', 'catalog', 'search', 'hidden'], default: 'visible' }
  },
  { timestamps: true }
);

export const ProductModel = model<IProduct>('Product', ProductSchema);
