import { Router } from 'express';
import { createPaymentIntent, getTransactions } from '../controllers/stripeController';
import { protect } from '../middleware/auth';

const router = Router();
router.use(protect);

router.post('/payment-intent', createPaymentIntent);
router.get('/transactions', getTransactions);

export default router;
