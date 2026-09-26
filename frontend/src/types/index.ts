export type Theme = 'feminine' | 'masculine' | 'neutral';
export type GoalCategory = 'coding' | 'study' | 'fitness' | 'career' | 'personal' | 'other';
export type VerificationType = 'github' | 'photo' | 'manual';
export type GoalStatus = 'active' | 'completed' | 'failed' | 'paused';
export type ProofStatus = 'pending' | 'verified' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  theme: Theme;
  avatar: { outfit: string; accessory: string; expression: string; background: string };
  interests: string[];
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  focusScore: number;
  completedGoals: number;
  failedGoals: number;
  totalCommitmentValue: number;
  isOnboarded: boolean;
  notificationPrefs: {
    email: boolean;
    goalCreated: boolean;
    deadlineApproaching: boolean;
    proofSubmitted: boolean;
    proofVerified: boolean;
    goalCompleted: boolean;
    goalMissed: boolean;
    streakMilestone: boolean;
  };
  createdAt: string;
}

export interface Goal {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: GoalCategory;
  deadline: string;
  commitmentAmount: number;
  verificationType: VerificationType;
  status: GoalStatus;
  progress: number;
  penaltyDestination: string;
  reminderDays: number[];
  githubUsername?: string;
  githubRepo?: string;
  githubBranch?: string;
  streak: number;
  xpReward: number;
  createdAt: string;
  completedAt?: string;
}

export interface Proof {
  _id: string;
  goalId: string | { _id: string; title: string; category: string };
  userId: string;
  type: VerificationType;
  status: ProofStatus;
  description?: string;
  imageUrl?: string;
  githubData?: {
    username: string;
    repo: string;
    branch: string;
    commitCount: number;
    lastCommitDate: string;
    commitUrl: string;
  };
  submittedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Achievement {
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface Transaction {
  _id: string;
  userId: string;
  goalId: string | { _id: string; title: string; category: string };
  amount: number;
  currency: string;
  type: 'commitment' | 'penalty' | 'refund';
  status: string;
  description: string;
  isTestMode: boolean;
  createdAt: string;
}

export interface DashboardData {
  user: {
    name: string;
    xp: number;
    level: number;
    streak: number;
    focusScore: number;
    theme: Theme;
    avatar: User['avatar'];
  };
  stats: {
    activeGoals: number;
    completedGoals: number;
    failedGoals: number;
    totalGoals: number;
    totalCommitmentValue: number;
  };
  goals: Goal[];
  recentAchievements: Achievement[];
}

/* ── Pocket-Money Commitment System ───────────────────────────── */

export type CommitmentCategory = 'study' | 'coding' | 'fitness' | 'career' | 'personal' | 'other';
export type CommitmentVerification = 'photo' | 'document' | 'github' | 'manual';
export type CommitmentStatus =
  | 'active'
  | 'eligible_claim'
  | 'claimed'
  | 'missed'
  | 'charity_outcome';
export type CommitmentProofStatus =
  | 'not_submitted'
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'rejected';

export interface CommitmentTask {
  _id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface Charity {
  id: string;
  name: string;
  description: string;
  category: string;
  website?: string;
}

export interface Commitment {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: CommitmentCategory;
  deadline: string;
  amount: number;
  currency: string;
  tasks: CommitmentTask[];
  verificationType: CommitmentVerification;
  proofStatus: CommitmentProofStatus;
  proofImageUrl?: string;
  proofDescription?: string;
  proofGithubData?: {
    username: string; repo: string; branch: string;
    commitCount: number; lastCommitDate: string; commitUrl: string;
  };
  proofSubmittedAt?: string;
  proofVerifiedAt?: string;
  proofRejectionReason?: string;
  charityId: string;
  charityName: string;
  status: CommitmentStatus;
  claimedAt?: string;
  missedProcessedAt?: string;
  xpReward: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommitmentDashboard {
  summary: {
    active: number;
    eligibleToClaim: number;
    claimed: number;
    missed: number;
    total: number;
    moneyCommitted: number;
    moneyClaimed: number;
    charityImpact: number;
  };
  upcoming: Commitment[];
  recentActive: Commitment[];
}

export interface TimelineEntry {
  step: string;
  label: string;
  date: string | null;
  done: boolean;
  emoji: string;
}

// Extend DashboardData to include commitment stats
export interface DashboardData {
  user: {
    name: string;
    xp: number;
    level: number;
    streak: number;
    focusScore: number;
    theme: Theme;
    avatar: User['avatar'];
  };
  stats: {
    activeGoals: number;
    completedGoals: number;
    failedGoals: number;
    totalGoals: number;
    totalCommitmentValue: number;
    commitMoneyCommitted: number;
    commitMoneyClaimed: number;
    commitCharityImpact: number;
    activeCommitmentsCount: number;
    pendingProofsCount: number;
  };
  goals: Goal[];
  recentAchievements: Achievement[];
  recentCommitments: Commitment[];
}
