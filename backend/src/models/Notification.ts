import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'goal_created'
  | 'deadline_approaching'
  | 'proof_submitted'
  | 'proof_verified'
  | 'proof_rejected'
  | 'goal_completed'
  | 'goal_failed'
  | 'streak_milestone'
  | 'achievement_unlocked'
  | 'level_up';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'goal_created',
        'deadline_approaching',
        'proof_submitted',
        'proof_verified',
        'proof_rejected',
        'goal_completed',
        'goal_failed',
        'streak_milestone',
        'achievement_unlocked',
        'level_up',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
