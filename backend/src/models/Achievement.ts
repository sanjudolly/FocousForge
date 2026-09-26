import mongoose, { Document, Schema } from 'mongoose';

export interface IAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  unlockedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    badgeId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
    xpReward: { type: Number, default: 50 },
    unlockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AchievementSchema.index({ userId: 1 });
AchievementSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);
