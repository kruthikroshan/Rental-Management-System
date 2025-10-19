import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  parentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, maxlength: 200 },
    description: String,
    imageUrl: String,
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    metaTitle: { type: String, maxlength: 200 },
    metaDescription: { type: String, maxlength: 500 },
    parentId: { type: Schema.Types.ObjectId, ref: 'Category' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ slug: 1 }, { unique: true });

export const CategoryModel = mongoose.model<ICategory>('Category', CategorySchema);
