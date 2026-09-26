import mongoose, { Document, Schema } from 'mongoose';

export type CommitmentCategory = 'study' | 'coding' | 'fitness' | 'career' | 'personal' | 'other';
export type CommitmentVerification = 'photo' | 'document' | 'github' | 'manual';
export type CommitmentStatus =
  | 'active'           // in progress
  | 'eligible_claim'   // all tasks done + proof verified
  | 'claimed'          // successfully claimed by student
  | 'missed'           // deadline passed without completion
  | 'charity_outcome'; // missed + charity transaction recorded

export type ProofStatus =
  | 'not_submitted'
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'rejected';

export interface ITask {
  _id: mongoose.Types.ObjectId;
  title: string;
  completed: boolean;
  completedAt?: Date;
}

export interface ICharity {
  id: string;
  name: string;
  description: string;
  category: string;
  website?: string;
}

export interface ICommitment extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: CommitmentCategory;
  deadline: Date;

  // Pocket money stake
  amount: number;          // in INR (₹)
  currency: string;        // 'inr'

  // Tasks / milestones
  tasks: ITask[];

  // Proof
  verificationType: CommitmentVerification;
  proofStatus: ProofStatus;
  proofImageUrl?: string;
  proofImagePublicId?: string;
  proofDescription?: string;
  proofGithubData?: {
    username: string;
    repo: string;
    branch: string;
    commitCount: number;
    lastCommitDate: string;
    commitUrl: string;
  };
  proofSubmittedAt?: Date;
  proofVerifiedAt?: Date;
  proofRejectionReason?: string;

  // Charity
  charityId: string;
  charityName: string;

  // State
  status: CommitmentStatus;
  claimedAt?: Date;
  missedProcessedAt?: Date;

  // Gamification
  xpReward: number;
  processed: boolean;          // cron guard
  deadlineNotified: boolean;   // 24h notification sent

  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title:       { type: String, required: true, trim: true, maxlength: 200 },
    completed:   { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { _id: true }
);

const CommitmentSchema = new Schema<ICommitment>(
  {
    userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title:       { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, maxlength: 600 },
    category:    {
      type: String,
      enum: ['study', 'coding', 'fitness', 'career', 'personal', 'other'],
      required: true,
    },
    deadline: { type: Date, required: true },

    amount:   { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'inr' },

    tasks: { type: [TaskSchema], default: [] },

    verificationType: {
      type: String,
      enum: ['photo', 'document', 'github', 'manual'],
      required: true,
    },
    proofStatus: {
      type: String,
      enum: ['not_submitted', 'submitted', 'under_review', 'verified', 'rejected'],
      default: 'not_submitted',
    },
    proofImageUrl:       { type: String },
    proofImagePublicId:  { type: String },
    proofDescription:    { type: String },
    proofGithubData: {
      username:       { type: String },
      repo:           { type: String },
      branch:         { type: String },
      commitCount:    { type: Number },
      lastCommitDate: { type: String },
      commitUrl:      { type: String },
    },
    proofSubmittedAt:      { type: Date },
    proofVerifiedAt:       { type: Date },
    proofRejectionReason:  { type: String },

    charityId:   { type: String, required: true },
    charityName: { type: String, required: true },

    status: {
      type: String,
      enum: ['active', 'eligible_claim', 'claimed', 'missed', 'charity_outcome'],
      default: 'active',
    },
    claimedAt:            { type: Date },
    missedProcessedAt:    { type: Date },

    xpReward:         { type: Number, default: 120 },
    processed:        { type: Boolean, default: false },
    deadlineNotified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CommitmentSchema.index({ userId: 1, status: 1 });
CommitmentSchema.index({ deadline: 1, status: 1, processed: 1 });
CommitmentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<ICommitment>('Commitment', CommitmentSchema);
