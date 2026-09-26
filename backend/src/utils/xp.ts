// XP and level calculation utilities
export const XP_PER_LEVEL = 500;

export const calculateLevel = (xp: number): number => {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
};

export const xpToNextLevel = (xp: number): number => {
  const currentLevelXp = (calculateLevel(xp) - 1) * XP_PER_LEVEL;
  return XP_PER_LEVEL - (xp - currentLevelXp);
};

export const xpProgressPercent = (xp: number): number => {
  const currentLevelXp = (calculateLevel(xp) - 1) * XP_PER_LEVEL;
  return Math.round(((xp - currentLevelXp) / XP_PER_LEVEL) * 100);
};

export const GOAL_XP_REWARDS: Record<string, number> = {
  coding: 150,
  study: 120,
  fitness: 130,
  career: 140,
  personal: 100,
  other: 80,
};

export const STREAK_BONUS_XP = (streak: number): number => {
  if (streak >= 30) return 200;
  if (streak >= 14) return 100;
  if (streak >= 7) return 50;
  return 0;
};

// Badges definitions
export const BADGES = [
  {
    badgeId: 'first_commitment',
    name: 'First Commitment',
    description: 'Created your very first goal commitment',
    icon: '🎯',
    rarity: 'common' as const,
    xpReward: 50,
  },
  {
    badgeId: 'goal_crusher',
    name: 'Goal Crusher',
    description: 'Completed 5 goals successfully',
    icon: '💪',
    rarity: 'rare' as const,
    xpReward: 150,
  },
  {
    badgeId: 'ten_goals',
    name: '10 Goals Completed',
    description: 'Completed 10 goals — you are unstoppable',
    icon: '🏆',
    rarity: 'epic' as const,
    xpReward: 300,
  },
  {
    badgeId: 'streak_7',
    name: '7 Day Streak',
    description: 'Maintained a 7-day active streak',
    icon: '🔥',
    rarity: 'rare' as const,
    xpReward: 100,
  },
  {
    badgeId: 'streak_30',
    name: 'Streak Master',
    description: 'Maintained a 30-day active streak',
    icon: '⚡',
    rarity: 'legendary' as const,
    xpReward: 500,
  },
  {
    badgeId: 'focus_master',
    name: 'Focus Master',
    description: 'Reached a Focus Score of 90+',
    icon: '🧠',
    rarity: 'legendary' as const,
    xpReward: 500,
  },
  {
    badgeId: 'consistent',
    name: 'Consistently Consistent',
    description: 'Submitted proof 7 times in a row',
    icon: '📅',
    rarity: 'rare' as const,
    xpReward: 100,
  },
  {
    badgeId: 'github_warrior',
    name: 'GitHub Warrior',
    description: 'Verified 3 goals via GitHub commits',
    icon: '💻',
    rarity: 'rare' as const,
    xpReward: 120,
  },
];

export const calculateFocusScore = (
  completedGoals: number,
  failedGoals: number,
  streak: number,
  xp: number
): number => {
  const totalGoals = completedGoals + failedGoals;
  const successRate = totalGoals > 0 ? (completedGoals / totalGoals) * 40 : 0;
  const streakScore = Math.min(streak * 2, 30);
  const xpScore = Math.min(xp / 100, 30);
  return Math.min(Math.round(successRate + streakScore + xpScore), 100);
};
