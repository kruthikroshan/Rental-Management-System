import mongoose, { Schema, Document } from 'mongoose';
import { RentalUnit, ProductCondition } from './enums';

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEEDS_REVIEW = 'needs_review'
}

export interface IProduct extends Document {
  categoryId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  sku: string;
  barcode?: string;
  isRentable: boolean;
  rentalUnits: RentalUnit;
  minRentalDuration: number;
  maxRentalDuration?: number;
  advanceBookingDays: number;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  maintenanceQuantity: number;
  baseRentalRate: number;
  securityDeposit: number;
  lateFeePerDay: number;
  replacementCost?: number;
  brand?: string;
  productModel?: string;
  yearManufactured?: number;
  condition: ProductCondition;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  specifications: Record<string, any>;
  images: string[];
  manuals: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isActive: boolean;
  approvalStatus: ApprovalStatus;
  approvalNotes?: string;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, maxlength: 200 },
    description: String,
    shortDescription: { type: String, maxlength: 500 },
    sku: { type: String, required: true, unique: true, maxlength: 100 },
    barcode: { type: String, maxlength: 100 },
    isRentable: { type: Boolean, default: true },
    rentalUnits: {
      type: String,
      enum: Object.values(RentalUnit),
      default: RentalUnit.DAY,
    },
    minRentalDuration: { type: Number, default: 1 },
    maxRentalDuration: Number,
    advanceBookingDays: { type: Number, default: 0 },
    totalQuantity: { type: Number, default: 0 },
    availableQuantity: { type: Number, default: 0 },
    reservedQuantity: { type: Number, default: 0 },
    maintenanceQuantity: { type: Number, default: 0 },
    baseRentalRate: { type: Number, required: true },
    securityDeposit: { type: Number, default: 0 },
    lateFeePerDay: { type: Number, default: 0 },
    replacementCost: Number,
    brand: { type: String, maxlength: 100 },
    productModel: { type: String, maxlength: 100 },
    yearManufactured: Number,
    condition: {
      type: String,
      enum: Object.values(ProductCondition),
      default: ProductCondition.GOOD,
    },
    weight: Number,
    dimensions: {
      type: {
        length: Number,
        width: Number,
        height: Number,
        unit: String,
      },
      required: false,
    },
    specifications: { type: Schema.Types.Mixed, default: {} },
    images: { type: [String], default: [] },
    manuals: { type: [String], default: [] },
    metaTitle: { type: String, maxlength: 200 },
    metaDescription: { type: String, maxlength: 500 },
    metaKeywords: { type: String, maxlength: 500 },
    isActive: { type: Boolean, default: true },
    approvalStatus: {
      type: String,
      enum: Object.values(ApprovalStatus),
      default: ApprovalStatus.PENDING,
    },
    approvalNotes: String,
    approvedAt: Date,
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: Date,
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
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ isRentable: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ sku: 1 }, { unique: true });
ProductSchema.index({ ownerId: 1 });
ProductSchema.index({ approvalStatus: 1 });

export const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);
