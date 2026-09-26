import { Router } from 'express';
import { submitProof, getProofs, verifyProof } from '../controllers/proofController';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
router.use(protect);

router.get('/', getProofs);
router.post('/', upload.single('image'), submitProof);
router.put('/:id/verify', verifyProof);

export default router;
