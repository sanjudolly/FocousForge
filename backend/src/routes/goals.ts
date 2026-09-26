import { Router } from 'express';
import {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  getDashboard,
  completeGoalManually,
} from '../controllers/goalController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/', getGoals);
router.post('/', createGoal);
router.get('/:id', getGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);
router.post('/:id/complete', completeGoalManually);

export default router;
