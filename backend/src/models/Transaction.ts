import mongoose, { Document, Schema } from 'mongoose';

export type TransactionType = 'commitment' | 'penalty' | 'refund';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'simulated';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  goalId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  stripePaymentIntentId?: string;
  description: string;
  isTestMode: boolean;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    goalId: { type: Schema.Types.ObjectId, ref: 'Goal', required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'usd' },
    type: { type: String, enum: ['commitment', 'penalty', 'refund'], required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'simulated'],
      default: 'simulated',
    },
    stripePaymentIntentId: { type: String },
    description: { type: String, required: true },
    isTestMode: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TransactionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
