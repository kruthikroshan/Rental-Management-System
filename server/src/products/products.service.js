import { Product } from './products.model.js';

export const ProductsService = {
  async create(data) {
    const stock = Number.isFinite(data.stock) ? Math.max(0, data.stock) : 0;
    const doc = new Product({
      name: data.name,
      description: data.description ?? '',
      images: Array.isArray(data.images) ? data.images.filter(Boolean) : [],
      isRentable: Boolean(data.isRentable ?? true),
      stock: stock,
      availableStock: stock, // Initially all stock is available
      pricePerDay: data.pricePerDay,
      category: data.category ?? '',
      brand: data.brand ?? '',
      model: data.model ?? '',
      condition: data.condition ?? 'Good'
    });
    return await doc.save();
  },

  async list({
    page = 1,
    limit = 20,
    search = '',
    rentable,
    category,
    brand,
    condition,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = {}) {
    const where = {};

    // Text search across name and description
    if (search) {
      where.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter conditions
    if (typeof rentable === 'boolean') where.isRentable = rentable;
    if (category) where.category = { $regex: category, $options: 'i' };
    if (brand) where.brand = { $regex: brand, $options: 'i' };
    if (condition) where.condition = { $regex: condition, $options: 'i' };

    // Price range filtering
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.pricePerDay = {};
      if (minPrice !== undefined) where.pricePerDay.$gte = minPrice;
      if (maxPrice !== undefined) where.pricePerDay.$lte = maxPrice;
    }

    const skip = (Math.max(1, +page) - 1) * Math.max(1, +limit);

    // Dynamic sorting
    const validSortFields = ['createdAt', 'updatedAt', 'name', 'pricePerDay', 'category', 'brand'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = ['asc', 'desc'].includes(sortOrder) ? (sortOrder === 'asc' ? 1 : -1) : -1;

    const [items, total] = await Promise.all([
      Product.find(where)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(Math.max(1, +limit))
        .lean(),
      Product.countDocuments(where)
    ]);

    return {
      items,
      total,
      page: +page,
      limit: +limit,
      hasNext: skip + items.length < total,
      hasPrev: +page > 1
    };
  },

  // Get all unique categories
  async getCategories() {
    const result = await Product.find({ isRentable: true })
      .select('category')
      .distinct('category');
    return result.filter(Boolean).sort();
  },

  // Get all unique brands
  async getBrands() {
    const result = await Product.find({ isRentable: true })
      .select('brand')
      .distinct('brand');
    return result.filter(Boolean).sort();
  },

  async getById(id) {
    return await Product.findById(id).lean();
  },

  async update(id, data) {
    const update = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.description !== undefined) update.description = data.description;
    if (data.images !== undefined) update.images = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
    if (data.isRentable !== undefined) update.isRentable = !!data.isRentable;
    if (data.stock !== undefined) {
      const newStock = Math.max(0, Number(data.stock));
      const currentProduct = await Product.findById(id);
      if (currentProduct) {
        const diff = newStock - currentProduct.stock;
        update.stock = newStock;
        update.availableStock = Math.max(0, currentProduct.availableStock + diff);
      }
    }
    if (data.pricePerDay !== undefined) update.pricePerDay = data.pricePerDay;
    if (data.category !== undefined) update.category = data.category;
    if (data.brand !== undefined) update.brand = data.brand;
    if (data.model !== undefined) update.model = data.model;
    if (data.condition !== undefined) update.condition = data.condition;

    return await Product.findByIdAndUpdate(id, update, { new: true }).lean();
  },

  async remove(id) {
    await Product.findByIdAndDelete(id);
    return { success: true };
  }
};
