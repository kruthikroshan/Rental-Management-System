import mongoose, { Schema, Document } from 'mongoose';
import { PaymentStatus, PaymentMethod } from './enums';

export interface IPayment extends Document {
  bookingId?: mongoose.Types.ObjectId;
  invoiceId?: mongoose.Types.ObjectId;
  paidById: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'BookingOrder' },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    paidById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    transactionId: { type: String, maxlength: 100 },
    paymentDate: { type: Date, required: true, default: Date.now },
    notes: String,
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
PaymentSchema.index({ bookingId: 1 });
PaymentSchema.index({ invoiceId: 1 });
PaymentSchema.index({ paidById: 1 });
PaymentSchema.index({ status: 1 });

export const PaymentModel = mongoose.model<IPayment>('Payment', PaymentSchema);
