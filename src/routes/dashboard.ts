import express from 'express';
import { getDashboardMetrics, getSalaryOverview } from '../controllers/dashboardController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/metrics', getDashboardMetrics);
router.get('/salary-overview', getSalaryOverview);

export default router;

