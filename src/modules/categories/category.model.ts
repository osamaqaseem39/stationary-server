import { Schema, model, Types } from 'mongoose';

export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  parentId?: Types.ObjectId;
  description?: string;
  shortDescription?: string;
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  
  // Display
  image?: string;
  displayOrder?: number;
  isActive: boolean;
  showInMenu?: boolean;
  featured?: boolean;
  
  createdAt?: Date;
  updatedAt?: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Category' },
    description: String,
    shortDescription: String,
    
    // SEO
    seoTitle: String,
    seoDescription: String,
    seoKeywords: String,
    
    // Display
    image: String,
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    showInMenu: { type: Boolean, default: true },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Generate slug from name if not provided
CategorySchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

export const CategoryModel = model<ICategory>('Category', CategorySchema);
