import express from 'express';
import {
  submitOnboardingRequest,
  getOnboardingRequests,
  getOnboardingRequest,
  updateOnboardingRequest,
  approveOnboardingRequest,
  rejectOnboardingRequest,
  deleteOnboardingRequest,
} from '../controllers/onboardingController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public route - no authentication required
router.post('/submit', submitOnboardingRequest);

// Protected routes - require authentication
router.use(protect);

router.get('/requests', getOnboardingRequests);
router.get('/requests/:id', getOnboardingRequest);
router.put('/requests/:id', updateOnboardingRequest);
router.post('/requests/:id/approve', approveOnboardingRequest);
router.post('/requests/:id/reject', rejectOnboardingRequest);
router.delete('/requests/:id', deleteOnboardingRequest);

export default router;

