import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema({
  userId: String,
  userEmail: String,
  userName: String,
  productId: String,
  productName: String,
  pricePerDay: Number,
  startDate: Date,
  endDate: Date,
  totalDays: Number,
  totalPrice: Number,
  paidAmount: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PARTIAL', 'PAID', 'REFUNDED'],
    default: 'PENDING'
  },
  notes: String,
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'PICKED_UP', 'RETURNED', 'CANCELLED', 'OVERDUE'],
    default: 'PENDING'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Rental = mongoose.model('Rental', rentalSchema, 'rentals');
