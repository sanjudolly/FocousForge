import { Response } from 'express';
import Goal from '../models/Goal';
import Proof from '../models/Proof';
import Transaction from '../models/Transaction';
import Achievement from '../models/Achievement';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    // Weekly productivity (last 7 days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const start = startOfDay(date);
      const end = endOfDay(date);
      const completed = await Goal.countDocuments({
        userId,
        completedAt: { $gte: start, $lte: end },
      });
      const proofSubmitted = await Proof.countDocuments({
        userId,
        submittedAt: { $gte: start, $lte: end },
      });
      weeklyData.push({
        day: format(date, 'EEE'),
        date: format(date, 'MMM d'),
        completed,
        proofs: proofSubmitted,
      });
    }

    // All goals stats
    const allGoals = await Goal.find({ userId }).sort({ createdAt: -1 });
    const completedGoals = allGoals.filter((g) => g.status === 'completed');
    const failedGoals = allGoals.filter((g) => g.status === 'failed');
    const activeGoals = allGoals.filter((g) => g.status === 'active');

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    allGoals.forEach((g) => {
      categoryBreakdown[g.category] = (categoryBreakdown[g.category] || 0) + 1;
    });

    // Commitment history
    const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 }).limit(10);

    // Achievements
    const achievements = await Achievement.find({ userId }).sort({ unlockedAt: -1 });

    // Time to completion
    const completionTimes = completedGoals
      .filter((g) => g.completedAt)
      .map((g) => {
        const days = Math.ceil(
          (g.completedAt!.getTime() - g.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        return { title: g.title, days, category: g.category };
      });

    // Journey timeline
    const journeyItems = [
      ...allGoals.map((g) => ({
        type: g.status === 'completed' ? 'goal_completed' : g.status === 'failed' ? 'goal_failed' : 'goal_created',
        title: g.title,
        date: g.completedAt || g.createdAt,
        category: g.category,
        xp: g.status === 'completed' ? g.xpReward : 0,
      })),
      ...achievements.map((a) => ({
        type: 'achievement',
        title: a.name,
        date: a.unlockedAt,
        icon: a.icon,
        xp: a.xpReward,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({
      success: true,
      analytics: {
        weeklyData,
        stats: {
          totalGoals: allGoals.length,
          completedGoals: completedGoals.length,
          failedGoals: failedGoals.length,
          activeGoals: activeGoals.length,
          successRate: allGoals.length > 0
            ? Math.round((completedGoals.length / allGoals.length) * 100)
            : 0,
          streak: user.streak,
          longestStreak: user.longestStreak,
          focusScore: user.focusScore,
          totalXp: user.xp,
          level: user.level,
          totalCommitmentValue: transactions.reduce((sum, t) => sum + (t.type === 'commitment' ? t.amount : 0), 0),
        },
        categoryBreakdown,
        completionTimes,
        transactions,
        achievements,
        journeyTimeline: journeyItems.slice(0, 20),
      },
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
