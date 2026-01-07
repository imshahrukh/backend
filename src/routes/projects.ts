import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  assignEmployees,
  removeEmployee,
  getHistory
} from '../controllers/projectController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All routes require authentication

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

router.get('/:id/history', getHistory);
router.post('/:id/assign', assignEmployees);
router.delete('/:id/remove/:employeeId', removeEmployee);

export default router;

