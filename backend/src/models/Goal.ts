import mongoose, { Document, Schema } from 'mongoose';

export type GoalCategory = 'coding' | 'study' | 'fitness' | 'career' | 'personal' | 'other';
export type VerificationType = 'github' | 'photo' | 'manual';
export type GoalStatus = 'active' | 'completed' | 'failed' | 'paused';

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: GoalCategory;
  deadline: Date;
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
  processed: boolean;
  deadlineNotified: boolean;
  createdAt: Date;
  completedAt?: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    category: {
      type: String,
      enum: ['coding', 'study', 'fitness', 'career', 'personal', 'other'],
      required: true,
    },
    deadline: { type: Date, required: true },
    commitmentAmount: { type: Number, required: true, min: 0 },
    verificationType: { type: String, enum: ['github', 'photo', 'manual'], required: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'failed', 'paused'],
      default: 'active',
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    penaltyDestination: { type: String, default: 'charity' },
    reminderDays: [{ type: Number }],
    githubUsername: { type: String },
    githubRepo: { type: String },
    githubBranch: { type: String, default: 'main' },
    streak: { type: Number, default: 0 },
    xpReward: { type: Number, default: 100 },
    processed: { type: Boolean, default: false },
    deadlineNotified: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

GoalSchema.index({ userId: 1, status: 1 });
GoalSchema.index({ deadline: 1, status: 1, processed: 1 });

export default mongoose.model<IGoal>('Goal', GoalSchema);
