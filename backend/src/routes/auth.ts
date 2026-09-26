import { Router } from 'express';
import {
  register,
  login,
  getMe,
  completeOnboarding,
  updateProfile,
  changePassword,
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/onboarding', protect, completeOnboarding);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

export default router;
