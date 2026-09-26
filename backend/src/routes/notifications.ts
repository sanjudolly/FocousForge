import { Router } from 'express';
import { getNotifications, markRead, markAllRead, deleteNotification } from '../controllers/notificationController';
import { protect } from '../middleware/auth';

const router = Router();
router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markRead);
router.delete('/:id', deleteNotification);

export default router;
