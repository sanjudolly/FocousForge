import { Request, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Octokit } from '@octokit/rest';
import Commitment from '../models/Commitment';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { BADGES, GOAL_XP_REWARDS, calculateLevel, calculateFocusScore } from '../utils/xp';
import { createNotification } from '../utils/notification';
import Achievement from '../models/Achievement';

/* ── Charity catalogue (demo / TEST MODE) ──────────────────────────── */
export const CHARITIES = [
  {
    id: 'pratham',
    name: 'Pratham Education Foundation',
    description: 'Improving quality of education for underprivileged children in India',
    category: 'Education',
    website: 'https://www.pratham.org',
  },
  {
    id: 'cry',
    name: 'CRY – Child Rights and You',
    description: 'Enabling lasting change in the lives of underprivileged children',
    category: 'Child Welfare',
    website: 'https://www.cry.org',
  },
  {
    id: 'goonj',
    name: 'Goonj',
    description: 'Bridging the gap between urban surplus and rural need',
    category: 'Rural Development',
    website: 'https://goonj.org',
  },
  {
    id: 'akshara',
    name: 'Akshara Foundation',
    description: 'Ensuring quality primary education for every child',
    category: 'Education',
    website: 'https://www.aksharafoundation.org',
  },
  {
    id: 'sammaan',
    name: 'Sammaan Foundation',
    description: 'Empowering urban homeless and marginalised communities',
    category: 'Social Welfare',
    website: 'https://sammaanfoundation.org',
  },
  {
    id: 'demo_charity',
    name: 'Demo Charity (TEST)',
    description: 'Placeholder charity for testing — no real organisation',
    category: 'Demo',
    website: '#',
  },
];

/* ── Zod schemas ────────────────────────────────────────────────────── */
const createSchema = z.object({
  title:            z.string().min(3).max(150),
  description:      z.string().min(10).max(600),
  category:         z.enum(['study', 'coding', 'fitness', 'career', 'personal', 'other']),
  deadline:         z.string().transform((d) => new Date(d)),
  amount:           z.number().min(1),
  tasks:            z.array(z.object({ title: z.string().min(1).max(200) })).min(1).max(20),
  verificationType: z.enum(['photo', 'document', 'github', 'manual']),
  charityId:        z.string().min(1),
  charityName:      z.string().min(1),
  githubUsername:   z.string().optional(),
  githubRepo:       z.string().optional(),
  githubBranch:     z.string().optional(),
});

/* ── helpers ────────────────────────────────────────────────────────── */
function allTasksDone(tasks: { completed: boolean }[]): boolean {
  return tasks.length > 0 && tasks.every((t) => t.completed);
}

function proofVerified(proofStatus: string): boolean {
  return proofStatus === 'verified';
}

async function awardXPAndAchievements(userId: string, xpReward: number): Promise<void> {
  const user = await User.findById(userId);
  if (!user) return;

  user.xp += xpReward;
  user.level = calculateLevel(user.xp);
  user.completedGoals += 1;
  user.streak += 1;
  if (user.streak > user.longestStreak) user.longestStreak = user.streak;
  user.lastActiveDate = new Date();
  user.focusScore = calculateFocusScore(user.completedGoals, user.failedGoals, user.streak, user.xp);
  await user.save();

  // badge checks
  const badgesToCheck = [
    { badgeId: 'goal_crusher', condition: user.completedGoals >= 5 },
    { badgeId: 'ten_goals',    condition: user.completedGoals >= 10 },
  ];
  for (const check of badgesToCheck) {
    if (check.condition) {
      const existing = await Achievement.findOne({ userId, badgeId: check.badgeId });
      if (!existing) {
        const badge = BADGES.find((b) => b.badgeId === check.badgeId);
        if (badge) {
          await Achievement.create({ userId, ...badge });
          await User.findByIdAndUpdate(userId, { $inc: { xp: badge.xpReward } });
          await createNotification(userId, 'achievement_unlocked', '🏅 Achievement Unlocked!', `You earned "${badge.name}"! +${badge.xpReward} XP`);
        }
      }
    }
  }
}

/* ══════════════════════════════════════════════
   CONTROLLERS
══════════════════════════════════════════════ */

/** GET /api/commitments/charities  — list available charities */
export const getCharities = async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, charities: CHARITIES });
};

/** POST /api/commitments  — create new commitment */
export const createCommitment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.errors });
      return;
    }
    const d = parsed.data;

    // Validate charity id
    const charity = CHARITIES.find((c) => c.id === d.charityId);
    if (!charity) {
      res.status(400).json({ success: false, message: 'Invalid charity selection.' });
      return;
    }

    const xpReward = GOAL_XP_REWARDS[d.category] ?? 120;

    const commitment = await Commitment.create({
      userId:           req.userId,
      title:            d.title,
      description:      d.description,
      category:         d.category,
      deadline:         d.deadline,
      amount:           d.amount,
      currency:         'inr',
      tasks:            d.tasks.map((t) => ({ title: t.title, completed: false })),
      verificationType: d.verificationType,
      charityId:        d.charityId,
      charityName:      d.charityName,
      xpReward,
    });

    // First commitment badge
    const user = await User.findById(req.userId);
    if (user) {
      const count = await Commitment.countDocuments({ userId: req.userId });
      if (count === 1) {
        const existing = await Achievement.findOne({ userId: req.userId, badgeId: 'first_commitment' });
        if (!existing) {
          const badge = BADGES.find((b) => b.badgeId === 'first_commitment');
          if (badge) {
            await Achievement.create({ userId: req.userId, ...badge });
            user.xp += badge.xpReward;
            user.level = calculateLevel(user.xp);
            await user.save();
          }
        }
      }
    }

    await createNotification(
      req.userId!,
      'goal_created',
      '💰 Commitment Created!',
      `"${d.title}" — ₹${d.amount} committed. Stay focused!`,
      { commitmentId: commitment._id }
    );

    res.status(201).json({ success: true, commitment });
  } catch (err) {
    console.error('createCommitment error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/** GET /api/commitments  — list user commitments */
export const getCommitments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter: Record<string, unknown> = { userId: req.userId };
    if (status) filter.status = status;

    const commitments = await Commitment.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Commitment.countDocuments(filter);
    res.json({ success: true, commitments, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/** GET /api/commitments/:id  — single commitment */
export const getCommitment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const commitment = await Commitment.findOne({ _id: req.params.id, userId: req.userId });
    if (!commitment) {
      res.status(404).json({ success: false, message: 'Commitment not found.' });
      return;
    }
    res.json({ success: true, commitment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/** PUT /api/commitments/:id/task/:taskId  — toggle task complete */
export const completeTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const commitment = await Commitment.findOne({ _id: req.params.id, userId: req.userId });
    if (!commitment) {
      res.status(404).json({ success: false, message: 'Commitment not found.' });
      return;
    }
    if (commitment.status !== 'active') {
      res.status(400).json({ success: false, message: 'Cannot update tasks on a non-active commitment.' });
      return;
    }

    const task = commitment.tasks.find(
      (t) => t._id.toString() === req.params.taskId
    );
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }

    task.completed   = !task.completed;
    task.completedAt = task.completed ? new Date() : undefined;

    // Recalculate progress
    const done = commitment.tasks.filter((t) => t.completed).length;
    // Note: proof must still be verified; we only compute % here

    await commitment.save();

    res.json({
      success:  true,
      commitment,
      taskProgress: Math.round((done / commitment.tasks.length) * 100),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/** POST /api/commitments/:id/proof  — submit proof (multipart) */
export const submitProof = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const commitment = await Commitment.findOne({ _id: req.params.id, userId: req.userId });
    if (!commitment) {
      res.status(404).json({ success: false, message: 'Commitment not found.' });
      return;
    }
    if (commitment.status !== 'active') {
      res.status(400).json({ success: false, message: 'Commitment is not active.' });
      return;
    }
    if (['submitted', 'under_review', 'verified'].includes(commitment.proofStatus)) {
      res.status(400).json({ success: false, message: 'Proof already submitted or verified.' });
      return;
    }

    const { description, githubUsername, githubRepo, githubBranch } = req.body;

    // Handle GitHub auto-verify
    if (commitment.verificationType === 'github') {
      if (!githubUsername || !githubRepo) {
        res.status(400).json({ success: false, message: 'GitHub username and repo required.' });
        return;
      }
      try {
        const octokit = new Octokit();
        const { data: commits } = await octokit.repos.listCommits({
          owner: githubUsername,
          repo:  githubRepo,
          sha:   githubBranch || 'main',
          since: commitment.createdAt.toISOString(),
          per_page: 5,
        });
        if (commits.length > 0) {
          commitment.proofGithubData = {
            username:       githubUsername,
            repo:           githubRepo,
            branch:         githubBranch || 'main',
            commitCount:    commits.length,
            lastCommitDate: commits[0].commit.committer?.date ?? '',
            commitUrl:      commits[0].html_url,
          };
          commitment.proofStatus      = 'verified';
          commitment.proofVerifiedAt  = new Date();
          commitment.proofSubmittedAt = new Date();
        } else {
          commitment.proofStatus      = 'submitted';
          commitment.proofSubmittedAt = new Date();
        }
      } catch {
        commitment.proofStatus      = 'submitted';
        commitment.proofSubmittedAt = new Date();
      }
    } else if (commitment.verificationType === 'photo' || commitment.verificationType === 'document') {
      // File uploaded via multer → req.file
      const file = (req as Request & { file?: Express.Multer.File }).file;
      if (!file) {
        res.status(400).json({ success: false, message: 'Please upload a file.' });
        return;
      }

      // Try Cloudinary upload
      try {
        const { uploadImage } = await import('../utils/cloudinary');
        const { url, publicId } = await uploadImage(file.buffer, 'commitment_proofs');
        commitment.proofImageUrl        = url;
        commitment.proofImagePublicId   = publicId;
      } catch {
        commitment.proofImageUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64').slice(0, 100)}`;
      }

      commitment.proofDescription  = description || '';
      commitment.proofStatus       = 'under_review';
      commitment.proofSubmittedAt  = new Date();
    } else {
      // Manual
      if (!description || description.length < 20) {
        res.status(400).json({ success: false, message: 'Description must be at least 20 characters.' });
        return;
      }
      commitment.proofDescription = description;
      commitment.proofStatus      = description.length >= 20 ? 'verified' : 'submitted';
      commitment.proofSubmittedAt = new Date();
      if (commitment.proofStatus === 'verified') commitment.proofVerifiedAt = new Date();
    }

    // Check if now eligible to claim
    if (allTasksDone(commitment.tasks) && proofVerified(commitment.proofStatus)) {
      commitment.status = 'eligible_claim';
    }

    await commitment.save();

    await createNotification(
      req.userId!,
      'proof_submitted',
      '📸 Proof Submitted',
      `Proof for "${commitment.title}" has been submitted.`,
      { commitmentId: commitment._id }
    );

    res.json({ success: true, commitment });
  } catch (err) {
    console.error('submitProof error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/** PUT /api/commitments/:id/proof/verify  — verify or reject proof */
export const verifyProof = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const commitment = await Commitment.findOne({ _id: req.params.id, userId: req.userId });
    if (!commitment) {
      res.status(404).json({ success: false, message: 'Not found.' });
      return;
    }

    const { status, rejectionReason } = req.body;
    if (!['verified', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'status must be verified or rejected.' });
      return;
    }

    commitment.proofStatus = status;
    if (status === 'verified') {
      commitment.proofVerifiedAt = new Date();
      if (allTasksDone(commitment.tasks)) {
        commitment.status = 'eligible_claim';
      }
    } else {
      commitment.proofRejectionReason = rejectionReason || 'Proof did not meet requirements.';
    }

    await commitment.save();

    await createNotification(
      req.userId!,
      status === 'verified' ? 'proof_verified' : 'proof_rejected',
      status === 'verified' ? '✅ Proof Verified!' : '❌ Proof Rejected',
      status === 'verified'
        ? `Proof for "${commitment.title}" verified. You can now claim!`
        : `Proof rejected: ${commitment.proofRejectionReason}`,
      { commitmentId: commitment._id }
    );

    res.json({ success: true, commitment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/** GET /api/commitments/:id/eligibility  — backend eligibility check */
export const checkEligibility = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const commitment = await Commitment.findOne({ _id: req.params.id, userId: req.userId });
    if (!commitment) {
      res.status(404).json({ success: false, message: 'Not found.' });
      return;
    }

    const tasksDone  = allTasksDone(commitment.tasks);
    const proofOk    = proofVerified(commitment.proofStatus);
    const eligible   = tasksDone && proofOk && commitment.status !== 'claimed';
    const pastDL     = new Date() > commitment.deadline;

    res.json({
      success: true,
      eligible,
      tasksDone,
      proofOk,
      pastDeadline: pastDL,
      status: commitment.status,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/** POST /api/commitments/:id/claim  — claim commitment (TEST MODE) */
export const claimCommitment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const commitment = await Commitment.findOne({ _id: req.params.id, userId: req.userId });
    if (!commitment) {
      res.status(404).json({ success: false, message: 'Not found.' });
      return;
    }

    // Backend guard — never trust frontend
    if (!allTasksDone(commitment.tasks)) {
      res.status(400).json({ success: false, message: 'Not all tasks are completed.' });
      return;
    }
    if (!proofVerified(commitment.proofStatus)) {
      res.status(400).json({ success: false, message: 'Proof not yet verified.' });
      return;
    }
    if (commitment.status === 'claimed') {
      res.status(400).json({ success: false, message: 'Commitment already claimed.' });
      return;
    }
    if (!['active', 'eligible_claim'].includes(commitment.status)) {
      res.status(400).json({ success: false, message: 'Commitment cannot be claimed in current state.' });
      return;
    }

    commitment.status    = 'claimed';
    commitment.claimedAt = new Date();
    commitment.processed = true;
    await commitment.save();

    // Award XP, update user stats
    await awardXPAndAchievements(req.userId!, commitment.xpReward);

    await createNotification(
      req.userId!,
      'goal_completed',
      '🎉 Commitment Claimed!',
      `"${commitment.title}" — ₹${commitment.amount} commitment successfully claimed. Well done!`,
      { commitmentId: commitment._id }
    );

    const updatedUser = await User.findById(req.userId).select('-password');
    res.json({
      success: true,
      commitment,
      xpEarned: commitment.xpReward,
      user: updatedUser,
    });
  } catch (err) {
    console.error('claimCommitment error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/** DELETE /api/commitments/:id  — delete (only active before any proof) */
export const deleteCommitment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const commitment = await Commitment.findOne({ _id: req.params.id, userId: req.userId });
    if (!commitment) {
      res.status(404).json({ success: false, message: 'Not found.' });
      return;
    }
    if (!['active'].includes(commitment.status)) {
      res.status(400).json({ success: false, message: 'Cannot delete a non-active commitment.' });
      return;
    }
    await Commitment.deleteOne({ _id: commitment._id });
    res.json({ success: true, message: 'Commitment deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/** GET /api/commitments/dashboard  — dashboard summary for commitments */
export const getCommitmentDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);

    const [active, eligibleToClaim, claimed, missed, total] = await Promise.all([
      Commitment.countDocuments({ userId, status: 'active' }),
      Commitment.countDocuments({ userId, status: 'eligible_claim' }),
      Commitment.countDocuments({ userId, status: 'claimed' }),
      Commitment.countDocuments({ userId, status: { $in: ['missed', 'charity_outcome'] } }),
      Commitment.countDocuments({ userId }),
    ]);

    // Financial aggregates
    const moneyCommitted = await Commitment.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const moneyClaimed = await Commitment.aggregate([
      { $match: { userId, status: 'claimed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const charityImpact = await Commitment.aggregate([
      { $match: { userId, status: { $in: ['missed', 'charity_outcome'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Upcoming deadlines (next 3 active sorted by deadline)
    const upcoming = await Commitment.find({ userId, status: 'active' })
      .sort({ deadline: 1 })
      .limit(3);

    // Recent active + eligible
    const recentActive = await Commitment.find({
      userId,
      status: { $in: ['active', 'eligible_claim'] },
    })
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      summary: {
        active,
        eligibleToClaim,
        claimed,
        missed,
        total,
        moneyCommitted: moneyCommitted[0]?.total ?? 0,
        moneyClaimed:   moneyClaimed[0]?.total   ?? 0,
        charityImpact:  charityImpact[0]?.total  ?? 0,
      },
      upcoming,
      recentActive,
    });
  } catch (err) {
    console.error('getCommitmentDashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/** GET /api/commitments/:id/timeline  — transaction timeline for a commitment */
export const getTimeline = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const commitment = await Commitment.findOne({ _id: req.params.id, userId: req.userId });
    if (!commitment) {
      res.status(404).json({ success: false, message: 'Not found.' });
      return;
    }

    type TLEntry = { step: string; label: string; date: Date | null; done: boolean; emoji: string };

    const timeline: TLEntry[] = [
      { step: 'created',          label: 'Commitment Created',              date: commitment.createdAt,         done: true,                                           emoji: '📝' },
      { step: 'amount_committed', label: 'TEST MODE Amount Committed',      date: commitment.createdAt,         done: true,                                           emoji: '💰' },
    ];

    const allDone = allTasksDone(commitment.tasks);
    timeline.push({ step: 'tasks', label: 'All Tasks Completed', date: allDone ? (commitment.tasks.filter(t=>t.completedAt).sort((a,b)=>new Date(b.completedAt!).getTime()-new Date(a.completedAt!).getTime())[0]?.completedAt ?? null) : null, done: allDone, emoji: '✅' });

    timeline.push({ step: 'proof_submitted', label: 'Proof Submitted',       date: commitment.proofSubmittedAt ?? null, done: !!commitment.proofSubmittedAt, emoji: '📸' });
    timeline.push({ step: 'proof_verified',  label: 'Proof Verified',        date: commitment.proofVerifiedAt  ?? null, done: commitment.proofStatus === 'verified',  emoji: '🔍' });

    if (['active', 'eligible_claim', 'claimed'].includes(commitment.status)) {
      timeline.push({ step: 'eligible',    label: 'Eligible to Claim',    date: commitment.status === 'eligible_claim' || commitment.status === 'claimed' ? commitment.proofVerifiedAt ?? null : null, done: ['eligible_claim','claimed'].includes(commitment.status), emoji: '🎯' });
      timeline.push({ step: 'claimed',     label: 'Claimed by You',       date: commitment.claimedAt   ?? null, done: commitment.status === 'claimed',          emoji: '🏆' });
    } else {
      timeline.push({ step: 'deadline',    label: 'Deadline Passed',      date: commitment.deadline,                                                                done: new Date() > commitment.deadline, emoji: '⏰' });
      timeline.push({ step: 'missed',      label: 'Commitment Missed',    date: commitment.missedProcessedAt ?? null, done: ['missed','charity_outcome'].includes(commitment.status), emoji: '😔' });
      timeline.push({ step: 'charity',     label: 'TEST MODE Charity Outcome', date: commitment.missedProcessedAt ?? null, done: commitment.status === 'charity_outcome', emoji: '💝' });
    }

    res.json({ success: true, timeline });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
