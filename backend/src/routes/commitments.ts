import { Router } from 'express';
import multer from 'multer';
import {
  getCharities,
  createCommitment,
  getCommitments,
  getCommitment,
  completeTask,
  submitProof,
  verifyProof,
  checkEligibility,
  claimCommitment,
  deleteCommitment,
  getCommitmentDashboard,
  getTimeline,
} from '../controllers/commitmentController';
import { protect } from '../middleware/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  },
});

const router = Router();

// Public endpoint (charities list — no auth needed)
router.get('/charities', getCharities);

// Protected routes
router.use(protect);

router.get('/dashboard', getCommitmentDashboard);
router.get('/', getCommitments);
router.post('/', createCommitment);
router.get('/:id', getCommitment);
router.delete('/:id', deleteCommitment);

// Task operations
router.put('/:id/task/:taskId', completeTask);

// Proof operations
router.post('/:id/proof', upload.single('file'), submitProof);
router.put('/:id/proof/verify', verifyProof);

// Claim
router.get('/:id/eligibility', checkEligibility);
router.post('/:id/claim', claimCommitment);

// Timeline
router.get('/:id/timeline', getTimeline);

export default router;
