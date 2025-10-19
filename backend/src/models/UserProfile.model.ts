import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile extends Document {
  userId: mongoose.Types.ObjectId;
  companyName?: string;
  businessType?: string;
  taxId?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  billingAddress?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  preferences?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName: { type: String, maxlength: 200 },
    businessType: { type: String, maxlength: 100 },
    taxId: { type: String, maxlength: 50 },
    address: { type: String, maxlength: 500 },
    city: { type: String, maxlength: 100 },
    state: { type: String, maxlength: 100 },
    zipCode: { type: String, maxlength: 20 },
    country: { type: String, maxlength: 100 },
    billingAddress: {
      type: {
        address: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
      },
      required: false,
    },
    preferences: { type: Schema.Types.Mixed, default: {} },
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
UserProfileSchema.index({ userId: 1 }, { unique: true });

export const UserProfileModel = mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);
