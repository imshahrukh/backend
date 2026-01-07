import express from 'express';
import {
  getCommissionConfigs,
  getCommissionConfig,
  getCommissionConfigByRole,
  createOrUpdateCommissionConfig,
  updateCommissionConfig,
  deleteCommissionConfig,
  initializeCommissionConfigs
} from '../controllers/commissionConfigController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getCommissionConfigs);
router.post('/initialize', authorize('Admin'), initializeCommissionConfigs);
router.post('/', authorize('Admin', 'Manager'), createOrUpdateCommissionConfig);
router.get('/role/:role', getCommissionConfigByRole);
router.get('/:id', getCommissionConfig);
router.put('/:id', authorize('Admin', 'Manager'), updateCommissionConfig);
router.delete('/:id', authorize('Admin'), deleteCommissionConfig);

export default router;

