import express from 'express';
import {
  getSalaries,
  getSalary,
  generateSalaries,
  recalculateSalaries,
  updateSalaryStatus,
  getEmployeeSalaryHistory,
  calculateSalary
} from '../controllers/salaryController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getSalaries);
router.post('/generate', generateSalaries);
router.post('/recalculate', recalculateSalaries);
router.get('/employee/:employeeId', getEmployeeSalaryHistory);
router.get('/calculate/:employeeId', calculateSalary);
router.get('/:id', getSalary);
router.put('/:id/status', updateSalaryStatus);

export default router;

