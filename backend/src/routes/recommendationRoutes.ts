import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendationController';
import { authenticate } from '../middleware/auth';

const router = Router();
const recommendationController = new RecommendationController();

/**
 * @route   GET /api/recommendations
 * @desc    Get AI-powered product recommendations based on user history
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  (req, res) => recommendationController.getRecommendations(req, res)
);

/**
 * @route   GET /api/recommendations/usage-insights
 * @desc    Get detailed usage insights and analytics
 * @access  Private
 */
router.get(
  '/usage-insights',
  authenticate,
  (req, res) => recommendationController.getUsageInsights(req, res)
);

export default router;
