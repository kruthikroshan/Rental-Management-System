import { Rental } from './rentals.model.js';
import mongoose from 'mongoose';

// Helper to enrich rental objects with a populated `product` field
async function enrichWithProduct(rentals) {
  const Product = mongoose.model('Product');
  const asArray = Array.isArray(rentals) ? rentals : [rentals];

  const productIds = [...new Set(asArray.map(r => r.productId).filter(Boolean))];
  const products = productIds.length > 0
    ? await Product.find({ _id: { $in: productIds } }).select('name images category brand pricePerDay averageRating').lean()
    : [];
  const productMap = Object.fromEntries(products.map(p => [p._id.toString(), p]));

  const enriched = asArray.map(r => ({
    ...r,
    product: productMap[r.productId?.toString()] || { name: r.productName, images: [] }
  }));

  return Array.isArray(rentals) ? enriched : enriched[0];
}

export const MongoRentalsService = {
  async create(data) {
    console.log('🗄️  [MongoRentalsService] CREATE called with data:', data);

    const { userId, userEmail, userName, productId, productName, startDate, endDate, notes = '', pricePerDay, totalDays, totalPrice, paidAmount = 0, paymentStatus = 'PENDING' } = data;

    console.log('🔍 [MongoRentalsService] Extracted fields:', {
      userId,
      userEmail,
      userName,
      productId,
      productName,
      startDate,
      endDate,
      notes,
      pricePerDay,
      totalDays,
      totalPrice,
      paidAmount,
      paymentStatus
    });

    try {
      console.log('💾 [MongoRentalsService] Inserting into MongoDB...');

      // Convert date strings to Date objects if needed
      let parsedStartDate = startDate;
      let parsedEndDate = endDate;

      if (typeof startDate === 'string') {
        parsedStartDate = new Date(startDate);
        console.log('📅 [MongoRentalsService] Converted startDate from string:', startDate, '→', parsedStartDate);
      }
      if (typeof endDate === 'string') {
        parsedEndDate = new Date(endDate);
        console.log('📅 [MongoRentalsService] Converted endDate from string:', endDate, '→', parsedEndDate);
      }

      const Product = mongoose.model('Product');
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }
      if (!product.isRentable) {
        throw new Error('This product is not available for rent');
      }
      if (product.availableStock < 1) {
        throw new Error('Product is currently out of stock');
      }

      const rental = await Rental.create({
        userId,
        userEmail,
        userName,
        productId,
        productName,
        pricePerDay: Number(pricePerDay),
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        totalDays: Number(totalDays),
        totalPrice: Number(totalPrice),
        paidAmount: Number(paidAmount),
        paymentStatus,
        notes,
        status: 'PENDING'
      });

      // Decrease available stock (Reservation)
      await Product.findByIdAndUpdate(productId, { $inc: { availableStock: -1 } });

      console.log('✅ [MongoRentalsService] Rental created successfully:', rental);
      const result = rental.toObject();
      console.log('📤 [MongoRentalsService] Returning object:', result);
      return result;
    } catch (error) {
      console.error('❌ [MongoRentalsService] Error creating rental:', error.message);
      console.error('❌ [MongoRentalsService] Full error:', error);
      throw error;
    }
  },

  async list({ page = 1, limit = 20, userId, status } = {}) {
    console.log('🗄️  [MongoRentalsService] LIST called with:', { page, limit, userId, status });

    try {
      const where = {};
      if (userId) where.userId = userId;
      if (status) where.status = status;

      console.log('🔍 [MongoRentalsService] Query filter:', where);

      const skip = (Math.max(1, +page) - 1) * Math.max(1, +limit);
      console.log('📊 [MongoRentalsService] Pagination - skip:', skip, 'limit:', Math.max(1, +limit));

      const [items, total] = await Promise.all([
        Rental.find(where)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Math.max(1, +limit))
          .lean(),
        Rental.countDocuments(where)
      ]);

      console.log('✅ [MongoRentalsService] Found items:', items.length, 'total:', total);

      return {
        items,
        total,
        page: +page,
        limit: +limit,
        hasNext: skip + items.length < total,
        hasPrev: +page > 1
      };
    } catch (error) {
      console.error('❌ [MongoRentalsService] LIST error:', error.message);
      console.error('❌ [MongoRentalsService] Full error:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const rental = await Rental.findById(id).lean();
      if (!rental) {
        console.warn(`[MongoRentalsService] Rental not found with id: ${id}`);
        return null;
      }
      return rental;
    } catch (error) {
      console.error(`[MongoRentalsService] Error in getById(${id}):`, error.message);
      return null;
    }
  },

  async getUserActiveRental(userId) {
    const rental = await Rental.findOne({
      userId,
      status: { $in: ['PENDING', 'CONFIRMED', 'PICKED_UP'] }
    }).sort({ createdAt: -1 }).lean();
    if (!rental) return null;
    return enrichWithProduct(rental);
  },

  async getUserRentals(userId, { page = 1, limit = 10 } = {}) {
    console.log('🔍 [MongoRentalsService] getUserRentals called');
    console.log('   userId:', userId);
    console.log('   page:', page, 'limit:', limit);

    try {
      const skip = (Math.max(1, +page) - 1) * Math.max(1, +limit);

      const [items, total] = await Promise.all([
        Rental.find({ userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Math.max(1, +limit))
          .lean(),
        Rental.countDocuments({ userId })
      ]);

      console.log('✅ [MongoRentalsService] Found', items.length, 'of', total, 'rentals');

      const enrichedItems = await enrichWithProduct(items);

      return {
        items: enrichedItems,
        total,
        page: +page,
        limit: +limit
      };
    } catch (err) {
      console.error('❌ [MongoRentalsService] getUserRentals error:', err.message);
      console.error('   Stack:', err.stack);
      throw err;
    }
  },

  async updateStatus(id, status) {
    console.log('🔄 [MongoRentalsService] updateStatus called with:', { id, status });
    console.log('   ID type:', typeof id, 'ID value:', id);

    try {
      const rental = await Rental.findByIdAndUpdate(
        id,
        { status, updatedAt: new Date() },
        { new: true }
      ).lean();

      if (rental) {
        // Return stock if cancelled or returned
        if (status === 'RETURNED' || status === 'CANCELLED') {
          const Product = mongoose.model('Product');
          await Product.findByIdAndUpdate(rental.productId, { $inc: { availableStock: 1 } });
        }
      }

      if (!rental) {
        console.warn('⚠️ [MongoRentalsService] updateStatus returned null for id:', id);
        console.warn('   Possible causes: Invalid ObjectId, Rental not found');
        return null;
      }

      console.log('✅ [MongoRentalsService] updateStatus succeeded:', {
        rentalId: rental._id,
        newStatus: rental.status,
        updatedAt: rental.updatedAt
      });
      return rental;
    } catch (error) {
      console.error('❌ [MongoRentalsService] updateStatus failed:', error.message);
      console.error('   Error stack:', error.stack);
      throw error;
    }
  },

  async checkOverdueRentals() {
    const now = new Date();
    return await Rental.updateMany(
      {
        status: 'PICKED_UP',
        endDate: { $lt: now }
      },
      { status: 'OVERDUE' }
    );
  }
};
