import mongoose, { Document, Schema } from 'mongoose';

export type ProofStatus = 'pending' | 'verified' | 'rejected';
export type ProofType = 'github' | 'photo' | 'manual';

export interface IProof extends Document {
  goalId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: ProofType;
  status: ProofStatus;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
  githubData?: {
    username: string;
    repo: string;
    branch: string;
    commitCount: number;
    lastCommitDate: Date;
    commitUrl: string;
  };
  submittedAt: Date;
  verifiedAt?: Date;
  rejectionReason?: string;
}

const ProofSchema = new Schema<IProof>(
  {
    goalId: { type: Schema.Types.ObjectId, ref: 'Goal', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['github', 'photo', 'manual'], required: true },
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    description: { type: String, trim: true },
    imageUrl: { type: String },
    imagePublicId: { type: String },
    githubData: {
      username: { type: String },
      repo: { type: String },
      branch: { type: String },
      commitCount: { type: Number },
      lastCommitDate: { type: Date },
      commitUrl: { type: String },
    },
    submittedAt: { type: Date, default: Date.now },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

ProofSchema.index({ goalId: 1, userId: 1 });
ProofSchema.index({ status: 1 });

export default mongoose.model<IProof>('Proof', ProofSchema);
