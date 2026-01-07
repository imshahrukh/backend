import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { protect, authorize } from '../middleware/auth';
import { EmployeeRole } from '../types';

const router = express.Router();

// All settings routes require authentication
router.use(protect);

router.route('/')
  .get(getSettings) // Any authenticated user can view settings
  .put(authorize(EmployeeRole.ADMIN), updateSettings); // Only admin can update

export default router;

