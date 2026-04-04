import { Review } from './reviews.model.js';
import { Product } from '../products/products.model.js';

export const ReviewController = {
  // Add a new review
  async addReview(req, res) {
    try {
      const { productId, rating, comment } = req.body;
      const userId = req.user.id;

      if (!productId || !rating || !comment) {
        return res.status(400).json({ message: 'ProductId, rating, and comment are required' });
      }

      // Check if user already reviewed this product
      const existing = await Review.findOne({ product: productId, user: userId });
      if (existing) {
        return res.status(400).json({ message: 'You have already reviewed this product' });
      }

      const review = await Review.create({
        product: productId,
        user: userId,
        rating,
        comment
      });

      // Update product average rating and review count
      const reviews = await Review.find({ product: productId, isApproved: true });
      const avg = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
      
      await Product.findByIdAndUpdate(productId, {
        averageRating: Math.round(avg * 10) / 10,
        reviewCount: reviews.length
      });

      res.status(201).json(review);
    } catch (e) {
      res.status(500).json({ message: e.message || 'Failed to add review' });
    }
  },

  // Get reviews for a product
  async getProductReviews(req, res) {
    try {
      const { productId } = req.params;
      const reviews = await Review.find({ product: productId, isApproved: true })
        .populate('user', 'name profileImage') // Show user name and optionally profile image
        .sort('-createdAt');
      res.json(reviews);
    } catch (e) {
      res.status(500).json({ message: e.message || 'Failed to get reviews' });
    }
  },

  // Admin: Get all reviews for moderation
  async getAllReviews(req, res) {
    try {
      const reviews = await Review.find()
        .populate('product', 'name')
        .populate('user', 'name email')
        .sort('-createdAt');
      res.json(reviews);
    } catch (e) {
      res.status(500).json({ message: e.message || 'Failed to get all reviews' });
    }
  },

  // Admin: Delete review
  async deleteReview(req, res) {
    try {
      const { reviewId } = req.params;
      const review = await Review.findById(reviewId);
      if (!review) return res.status(404).json({ message: 'Review not found' });

      await Review.findByIdAndDelete(reviewId);

      // Re-calculate product ratings
      const reviews = await Review.find({ product: review.product, isApproved: true });
      const avg = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
      
      await Product.findByIdAndUpdate(review.product, {
        averageRating: Math.round(avg * 10) / 10,
        reviewCount: reviews.length
      });

      res.json({ success: true, message: 'Review deleted' });
    } catch (e) {
      res.status(500).json({ message: e.message || 'Failed to delete review' });
    }
  }
};
