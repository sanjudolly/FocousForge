import cron from 'node-cron';
import Goal from '../models/Goal';
import Proof from '../models/Proof';
import Commitment from '../models/Commitment';
import User from '../models/User';
import Transaction from '../models/Transaction';
import Achievement from '../models/Achievement';
import { createNotification } from '../utils/notification';
import { BADGES, calculateFocusScore, calculateLevel } from '../utils/xp';

export const processExpiredGoalsAndCommitments = async (): Promise<{
  expiredGoals: number;
  expiredCommitments: number;
}> => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  let processedGoalsCount = 0;
  let processedCommitmentsCount = 0;

  try {
    const expiredGoals = await Goal.find({
      status: 'active',
      deadline: { $lte: now },
      processed: false,
    });

    for (const goal of expiredGoals) {
      try {
        const verifiedProof = await Proof.findOne({
          goalId: goal._id,
          userId: goal.userId,
          status: 'verified',
        });

        if (verifiedProof) {
          goal.status = 'completed';
          goal.completedAt = new Date();
          goal.progress = 100;
          goal.processed = true;
          await goal.save();

          const user = await User.findById(goal.userId);
          if (user) {
            user.xp += goal.xpReward;
            user.level = calculateLevel(user.xp);
            user.completedGoals += 1;
            user.streak += 1;
            if (user.streak > user.longestStreak) user.longestStreak = user.streak;
            user.focusScore = calculateFocusScore(user.completedGoals, user.failedGoals, user.streak, user.xp);
            await user.save();

            await checkStreakAchievements(user._id.toString(), user.streak);
          }

          await createNotification(
            goal.userId,
            'goal_completed',
            '🏆 Commitment Forged!',
            `"${goal.title}" was completed. Another promise kept! +${goal.xpReward} XP`,
            { goalId: goal._id }
          );
        } else {
          goal.status = 'failed';
          goal.processed = true;
          await goal.save();

          if (goal.commitmentAmount > 0) {
            await Transaction.create({
              userId: goal.userId,
              goalId: goal._id,
              amount: goal.commitmentAmount,
              type: 'penalty',
              status: 'simulated',
              description: `TEST MODE: Simulated penalty — goal "${goal.title}" missed`,
              isTestMode: true,
            });
          }

          const user = await User.findById(goal.userId);
          if (user) {
            user.failedGoals += 1;
            user.streak = 0;
            user.focusScore = calculateFocusScore(user.completedGoals, user.failedGoals, user.streak, user.xp);
            await user.save();
          }

          await createNotification(
            goal.userId,
            'goal_failed',
            '💫 Commitment Missed',
            `"${goal.title}" was not completed in time. Every master was once a beginner. Try again!`,
            { goalId: goal._id }
          );
        }
        processedGoalsCount++;
      } catch (goalErr) {
        console.error(`[CronJob] Error processing goal ${goal._id}:`, goalErr);
      }
    }

    // 24h deadline warning for goals
    const soonGoals = await Goal.find({
      status: 'active',
      deadline: { $gte: now, $lte: tomorrow },
      processed: false,
      deadlineNotified: { $ne: true },
    });

    for (const goal of soonGoals) {
      const hoursLeft = Math.ceil((goal.deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
      await createNotification(
        goal.userId,
        'deadline_approaching',
        '⏰ Deadline Approaching!',
        `"${goal.title}" is due in ${hoursLeft} hours. Submit your proof now!`,
        { goalId: goal._id }
      );
      await Goal.findByIdAndUpdate(goal._id, { deadlineNotified: true });
    }
  } catch (err) {
    console.error('[CronJob] Goal processor fatal error:', err);
  }

  // Process expired commitments
  try {
    const expiredCommitments = await Commitment.find({
      status: { $in: ['active', 'eligible_claim'] },
      deadline: { $lte: now },
      processed: false,
    });

    for (const c of expiredCommitments) {
      try {
        const allTasksDone = c.tasks.length > 0 && c.tasks.every((t) => t.completed);
        const proofOk = c.proofStatus === 'verified';

        if (allTasksDone && proofOk) {
          if (c.status !== 'eligible_claim' && c.status !== 'claimed') {
            c.status = 'eligible_claim';
            c.processed = true;
            await c.save();
            await createNotification(
              c.userId.toString(),
              'goal_completed',
              '🎉 Ready to Claim!',
              `"${c.title}" — all tasks done and proof verified. Claim your ₹${c.amount} now!`,
              { commitmentId: c._id }
            );
          }
        } else {
          c.status = 'charity_outcome';
          c.missedProcessedAt = now;
          c.processed = true;
          await c.save();

          const user = await User.findById(c.userId);
          if (user) {
            user.failedGoals += 1;
            user.streak = 0;
            user.focusScore = calculateFocusScore(user.completedGoals, user.failedGoals, 0, user.xp);
            await user.save();
          }

          await createNotification(
            c.userId.toString(),
            'goal_failed',
            '😔 Commitment Missed',
            `"${c.title}" missed. ₹${c.amount} TEST MODE charity outcome recorded for ${c.charityName}. Don't give up!`,
            { commitmentId: c._id }
          );
        }
        processedCommitmentsCount++;
      } catch (err) {
        console.error(`[CronJob] Error processing commitment ${c._id}:`, err);
      }
    }

    // 24h deadline warning for commitments
    const soonCommitments = await Commitment.find({
      status: 'active',
      deadline: { $gte: now, $lte: tomorrow },
      processed: false,
      deadlineNotified: { $ne: true },
    });

    for (const c of soonCommitments) {
      const hoursLeft = Math.ceil((c.deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
      await createNotification(
        c.userId.toString(),
        'deadline_approaching',
        '⏰ Commitment Deadline Soon!',
        `"${c.title}" is due in ${hoursLeft} hours. Complete tasks and submit proof!`,
        { commitmentId: c._id }
      );
      await Commitment.findByIdAndUpdate(c._id, { deadlineNotified: true });
    }
  } catch (err) {
    console.error('[CronJob] Commitment processor fatal error:', err);
  }

  return {
    expiredGoals: processedGoalsCount,
    expiredCommitments: processedCommitmentsCount,
  };
};

export const startGoalProcessor = (): void => {
  if (process.env.VERCEL) {
    console.log('[CronJob] Running on Vercel: background timer skipped, Vercel Crons enabled.');
    return;
  }

  cron.schedule('0 * * * *', async () => {
    console.log('[CronJob] Running hourly goal and commitment processor...');
    await processExpiredGoalsAndCommitments();
  });

  console.log('[CronJob] Goal + Commitment processors started (run every hour).');
};

async function checkStreakAchievements(userId: string, streak: number): Promise<void> {
  const milestones = [
    { streak: 7, badgeId: 'streak_7' },
    { streak: 30, badgeId: 'streak_30' },
  ];

  for (const m of milestones) {
    if (streak >= m.streak) {
      const existing = await Achievement.findOne({ userId, badgeId: m.badgeId });
      if (!existing) {
        const badge = BADGES.find((b) => b.badgeId === m.badgeId);
        if (badge) {
          await Achievement.create({ userId, ...badge });
          await User.findByIdAndUpdate(userId, { $inc: { xp: badge.xpReward } });
          await createNotification(
            userId,
            'streak_milestone',
            `🔥 ${streak}-Day Streak!`,
            `Incredible! You've earned the "${badge.name}" badge! +${badge.xpReward} XP`
          );
        }
      }
    }
  }
}
