import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, sparse: true, lowercase: true, index: true },
    phoneNumber: { type: String, unique: true, sparse: true, index: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin', 'manager'], default: 'customer' },
    passwordHash: { type: String, required: false }, // Optional for phone-only or social users
    refreshTokenHash: { type: String, default: null },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
    // OAuth fields
    googleId: { type: String, default: null, sparse: true },
    provider: { type: String, enum: ['email', 'google', 'phone'], default: 'email' }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', UserSchema);

