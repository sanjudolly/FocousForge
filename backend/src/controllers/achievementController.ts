import { Response } from 'express';
import Achievement from '../models/Achievement';
import { AuthRequest } from '../middleware/auth';
import { BADGES } from '../utils/xp';

export const getAchievements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userAchievements = await Achievement.find({ userId: req.userId });
    const unlockedIds = new Set(userAchievements.map((a) => a.badgeId));

    const allBadges = BADGES.map((badge) => ({
      ...badge,
      unlocked: unlockedIds.has(badge.badgeId),
      unlockedAt: userAchievements.find((a) => a.badgeId === badge.badgeId)?.unlockedAt || null,
    }));

    res.json({ success: true, achievements: allBadges, unlocked: userAchievements.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
