import mongoose, { Schema, Document } from 'mongoose';
import { QuotationStatus } from './enums';

export interface IQuotation extends Document {
  customerId: mongoose.Types.ObjectId;
  quotationNumber: string;
  status: QuotationStatus;
  validUntil: Date;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  subtotal: number;
  securityDeposit: number;
  tax: number;
  discount: number;
  totalAmount: number;
  notes?: string;
  termsConditions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationSchema = new Schema<IQuotation>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quotationNumber: { type: String, required: true, unique: true, maxlength: 50 },
    status: {
      type: String,
      enum: Object.values(QuotationStatus),
      default: QuotationStatus.DRAFT,
    },
    validUntil: { type: Date, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    subtotal: { type: Number, required: true, default: 0 },
    securityDeposit: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    notes: String,
    termsConditions: String,
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

// Indexes (quotationNumber unique index already created via schema definition)
QuotationSchema.index({ customerId: 1 });
QuotationSchema.index({ status: 1 });

export const QuotationModel = mongoose.model<IQuotation>('Quotation', QuotationSchema);
