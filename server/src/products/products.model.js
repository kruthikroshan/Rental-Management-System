import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    description: { type: String, default: '' },
    images: [{ type: String }],
    isRentable: { type: Boolean, default: true, index: true },
    stock: { type: Number, default: 0 },
    availableStock: { type: Number, default: 0 },
    pricePerHour: { type: Number, default: null },
    pricePerDay: { type: Number, required: true },
    pricePerWeek: { type: Number, default: null },
    category: { type: String, default: '' },
    brand: { type: String, default: '' },
    model: { type: String, default: '' },
    condition: { type: String, default: 'Good' },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Indexes for filtering and search
ProductSchema.index({ name: 'text', description: 'text', category: 'text', brand: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ pricePerDay: 1 });

export const Product = mongoose.model('Product', ProductSchema);
