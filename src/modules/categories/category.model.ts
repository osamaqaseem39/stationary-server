import { Schema, model, Types } from 'mongoose';

export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  parentId?: Types.ObjectId;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Category' },
    description: String,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const CategoryModel = model<ICategory>('Category', CategorySchema);

