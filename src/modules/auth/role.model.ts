import { Schema, model } from 'mongoose';

export interface IRole {
  _id: string;
  name: 'customer' | 'admin' | 'staff';
  permissions: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true, enum: ['customer', 'admin', 'staff'] },
    permissions: [{ type: String }]
  },
  { timestamps: true }
);

export const RoleModel = model<IRole>('Role', RoleSchema);

