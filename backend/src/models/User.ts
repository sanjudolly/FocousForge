import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  theme: 'feminine' | 'masculine' | 'neutral';
  avatar: {
    outfit: string;
    accessory: string;
    expression: string;
    background: string;
  };
  interests: string[];
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: Date;
  focusScore: number;
  totalCommitmentValue: number;
  completedGoals: number;
  failedGoals: number;
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
  isOnboarded: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    theme: { type: String, enum: ['feminine', 'masculine', 'neutral'], default: 'neutral' },
    avatar: {
      outfit: { type: String, default: 'default' },
      accessory: { type: String, default: 'none' },
      expression: { type: String, default: 'happy' },
      background: { type: String, default: 'gradient' },
    },
    interests: [{ type: String }],
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: Date.now },
    focusScore: { type: Number, default: 0 },
    totalCommitmentValue: { type: Number, default: 0 },
    completedGoals: { type: Number, default: 0 },
    failedGoals: { type: Number, default: 0 },
    notificationPrefs: {
      email: { type: Boolean, default: true },
      goalCreated: { type: Boolean, default: true },
      deadlineApproaching: { type: Boolean, default: true },
      proofSubmitted: { type: Boolean, default: true },
      proofVerified: { type: Boolean, default: true },
      goalCompleted: { type: Boolean, default: true },
      goalMissed: { type: Boolean, default: true },
      streakMilestone: { type: Boolean, default: true },
    },
    isOnboarded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model<IUser>('User', UserSchema);
