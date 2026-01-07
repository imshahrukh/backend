import express from 'express';
import {
  getMonthlyRevenues,
  getMonthlyRevenueById,
  getRevenuesByMonth,
  createMonthlyRevenue,
  updateMonthlyRevenue,
  deleteMonthlyRevenue,
  bulkUpsertRevenues
} from '../controllers/monthlyRevenueController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/monthly-revenues
 * @desc    Get all monthly revenues (with optional month filter)
 * @access  Private
 */
router.get('/', getMonthlyRevenues);

/**
 * @route   GET /api/monthly-revenues/month/:month
 * @desc    Get revenues for a specific month with project list
 * @access  Private
 */
router.get('/month/:month', getRevenuesByMonth);

/**
 * @route   GET /api/monthly-revenues/:id
 * @desc    Get monthly revenue by ID
 * @access  Private
 */
router.get('/:id', getMonthlyRevenueById);

/**
 * @route   POST /api/monthly-revenues
 * @desc    Create monthly revenue
 * @access  Private (Admin only)
 */
router.post('/', authorize('Admin'), createMonthlyRevenue);

/**
 * @route   POST /api/monthly-revenues/bulk
 * @desc    Bulk create/update monthly revenues
 * @access  Private (Admin only)
 */
router.post('/bulk', authorize('Admin'), bulkUpsertRevenues);

/**
 * @route   PUT /api/monthly-revenues/:id
 * @desc    Update monthly revenue
 * @access  Private (Admin only)
 */
router.put('/:id', authorize('Admin'), updateMonthlyRevenue);

/**
 * @route   DELETE /api/monthly-revenues/:id
 * @desc    Delete monthly revenue
 * @access  Private (Admin only)
 */
router.delete('/:id', authorize('Admin'), deleteMonthlyRevenue);

export default router;

