import { Response } from 'express';
import { z } from 'zod';
import Goal from '../models/Goal';
import User from '../models/User';
import Transaction from '../models/Transaction';
import Achievement from '../models/Achievement';
import Commitment from '../models/Commitment';
import { AuthRequest } from '../middleware/auth';
import { BADGES, GOAL_XP_REWARDS, calculateLevel, calculateFocusScore } from '../utils/xp';
import { createNotification } from '../utils/notification';

const createGoalSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  category: z.enum(['coding', 'study', 'fitness', 'career', 'personal', 'other']),
  deadline: z.string().transform((d) => new Date(d)),
  commitmentAmount: z.number().min(0),
  verificationType: z.enum(['github', 'photo', 'manual']),
  penaltyDestination: z.string().optional(),
  reminderDays: z.array(z.number()).optional(),
  githubUsername: z.string().optional(),
  githubRepo: z.string().optional(),
  githubBranch: z.string().optional(),
});

export const createGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = createGoalSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.errors });
      return;
    }

    const data = parsed.data;
    const xpReward = GOAL_XP_REWARDS[data.category] || 100;

    const goal = await Goal.create({
      userId: req.userId,
      ...data,
      xpReward,
    });

    // Create simulated commitment transaction
    if (data.commitmentAmount > 0) {
      await Transaction.create({
        userId: req.userId,
        goalId: goal._id,
        amount: data.commitmentAmount,
        type: 'commitment',
        status: 'simulated',
        description: `TEST MODE: Simulated commitment for goal "${data.title}"`,
        isTestMode: true,
      });
    }

    await createNotification(
      req.userId!,
      'goal_created',
      '🎯 Goal Created!',
      `Your commitment "${data.title}" has been forged. Stay focused!`,
      { goalId: goal._id }
    );

    // Check first goal badge
    const user = await User.findById(req.userId);
    if (user) {
      const goalCount = await Goal.countDocuments({ userId: req.userId });
      if (goalCount === 1) {
        const existingBadge = await Achievement.findOne({ userId: req.userId, badgeId: 'first_commitment' });
        if (!existingBadge) {
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

    res.status(201).json({ success: true, goal });
  } catch (err) {
    console.error('Create goal error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

export const getGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const filter: Record<string, unknown> = { userId: req.userId };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const goals = await Goal.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Goal.countDocuments(filter);
    res.json({ success: true, goals, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

export const getGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
    if (!goal) {
      res.status(404).json({ success: false, message: 'Goal not found.' });
      return;
    }
    res.json({ success: true, goal });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

export const updateGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
    if (!goal) {
      res.status(404).json({ success: false, message: 'Goal not found.' });
      return;
    }
    if (goal.status !== 'active') {
      res.status(400).json({ success: false, message: 'Cannot update a non-active goal.' });
      return;
    }

    if (req.body.title !== undefined) goal.title = req.body.title;
    if (req.body.description !== undefined) goal.description = req.body.description;
    if (req.body.deadline !== undefined) goal.deadline = new Date(req.body.deadline);
    if (req.body.reminderDays !== undefined) goal.reminderDays = req.body.reminderDays;
    if (req.body.progress !== undefined) goal.progress = req.body.progress;
    await goal.save();
    res.json({ success: true, goal });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

export const deleteGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!goal) {
      res.status(404).json({ success: false, message: 'Goal not found.' });
      return;
    }
    // Cascade: delete related proofs and transactions
    const Proof       = (await import('../models/Proof')).default;
    const Transaction = (await import('../models/Transaction')).default;
    await Proof.deleteMany({ goalId: goal._id });
    await Transaction.deleteMany({ goalId: goal._id });
    res.json({ success: true, message: 'Goal deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const activeGoals = await Goal.find({ userId: req.userId, status: 'active' }).sort({ deadline: 1 }).limit(6);
    const completedGoals = await Goal.countDocuments({ userId: req.userId, status: 'completed' });
    const failedGoals = await Goal.countDocuments({ userId: req.userId, status: 'failed' });
    const totalGoals = await Goal.countDocuments({ userId: req.userId });

    const totalCommitment = await Transaction.aggregate([
      { $match: { userId: user._id, type: 'commitment' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const recentAchievements = await Achievement.find({ userId: req.userId })
      .sort({ unlockedAt: -1 })
      .limit(3);

    // Commitment (pocket-money) stats
    const mongoose = (await import('mongoose')).default;
    const uid = new mongoose.Types.ObjectId(req.userId);

    const [commitMoneyCommitted, commitMoneyClaimed, commitCharityImpact, activeCommitmentsCount, pendingProofsCount] = await Promise.all([
      Commitment.aggregate([{ $match: { userId: uid } }, { $group: { _id: null, t: { $sum: '$amount' } } }]),
      Commitment.aggregate([{ $match: { userId: uid, status: 'claimed' } }, { $group: { _id: null, t: { $sum: '$amount' } } }]),
      Commitment.aggregate([{ $match: { userId: uid, status: { $in: ['missed', 'charity_outcome'] } } }, { $group: { _id: null, t: { $sum: '$amount' } } }]),
      Commitment.countDocuments({ userId: req.userId, status: { $in: ['active', 'eligible_claim'] } }),
      Commitment.countDocuments({ userId: req.userId, proofStatus: { $in: ['submitted', 'under_review'] } }),
    ]);

    const recentCommitments = await Commitment.find({
      userId: req.userId,
      status: { $in: ['active', 'eligible_claim'] },
    }).sort({ deadline: 1 }).limit(3);

    res.json({
      success: true,
      dashboard: {
        user: {
          name: user.name,
          xp: user.xp,
          level: user.level,
          streak: user.streak,
          focusScore: user.focusScore,
          theme: user.theme,
          avatar: user.avatar,
        },
        stats: {
          activeGoals: activeGoals.length,
          completedGoals,
          failedGoals,
          totalGoals,
          totalCommitmentValue: totalCommitment[0]?.total || 0,
          // Pocket-money commitment stats
          commitMoneyCommitted: commitMoneyCommitted[0]?.t ?? 0,
          commitMoneyClaimed:   commitMoneyClaimed[0]?.t   ?? 0,
          commitCharityImpact:  commitCharityImpact[0]?.t  ?? 0,
          activeCommitmentsCount,
          pendingProofsCount,
        },
        goals: activeGoals,
        recentAchievements,
        recentCommitments,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

export const completeGoalManually = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
    if (!goal || goal.status !== 'active') {
      res.status(404).json({ success: false, message: 'Active goal not found.' });
      return;
    }

    goal.status = 'completed';
    goal.completedAt = new Date();
    goal.progress = 100;
    await goal.save();

    const user = await User.findById(req.userId);
    if (user) {
      user.xp += goal.xpReward;
      user.level = calculateLevel(user.xp);
      user.completedGoals += 1;
      user.streak += 1;
      if (user.streak > user.longestStreak) user.longestStreak = user.streak;
      user.lastActiveDate = new Date();
      user.focusScore = calculateFocusScore(user.completedGoals, user.failedGoals, user.streak, user.xp);
      await user.save();

      // Check achievements
      await checkAndAwardAchievements(user._id.toString(), user.completedGoals);
    }

    await createNotification(
      req.userId!,
      'goal_completed',
      '🏆 Commitment Forged!',
      `"${goal.title}" completed. Another promise kept! +${goal.xpReward} XP`,
      { goalId: goal._id }
    );

    res.json({ success: true, goal, xpEarned: goal.xpReward });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

async function checkAndAwardAchievements(userId: string, completedCount: number): Promise<void> {
  const badgesToCheck = [
    { badgeId: 'goal_crusher', condition: completedCount >= 5 },
    { badgeId: 'ten_goals', condition: completedCount >= 10 },
  ];

  for (const check of badgesToCheck) {
    if (check.condition) {
      const existing = await Achievement.findOne({ userId, badgeId: check.badgeId });
      if (!existing) {
        const badge = BADGES.find((b) => b.badgeId === check.badgeId);
        if (badge) {
          await Achievement.create({ userId, ...badge });
          await User.findByIdAndUpdate(userId, { $inc: { xp: badge.xpReward } });
          await createNotification(
            userId,
            'achievement_unlocked',
            '🏅 Achievement Unlocked!',
            `You earned "${badge.name}"! +${badge.xpReward} XP`
          );
        }
      }
    }
  }
}
