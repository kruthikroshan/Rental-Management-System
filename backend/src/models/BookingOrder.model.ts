import mongoose, { Schema, Document } from 'mongoose';
import { BookingStatus } from './enums';

export interface IBookingOrder extends Document {
  customerId: mongoose.Types.ObjectId;
  bookingNumber: string;
  status: BookingStatus;
  startDate: Date;
  endDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  totalDays: number;
  subtotal: number;
  securityDeposit: number;
  tax: number;
  discount: number;
  totalAmount: number;
  notes?: string;
  customerNotes?: string;
  internalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingOrderSchema = new Schema<IBookingOrder>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookingNumber: { type: String, required: true, unique: true, maxlength: 50 },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    actualStartDate: Date,
    actualEndDate: Date,
    totalDays: { type: Number, required: true },
    subtotal: { type: Number, required: true, default: 0 },
    securityDeposit: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    notes: String,
    customerNotes: String,
    internalNotes: String,
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

// Indexes (bookingNumber unique index already created via schema definition)
BookingOrderSchema.index({ customerId: 1 });
BookingOrderSchema.index({ status: 1 });
BookingOrderSchema.index({ startDate: 1, endDate: 1 });

export const BookingOrderModel = mongoose.model<IBookingOrder>('BookingOrder', BookingOrderSchema);
