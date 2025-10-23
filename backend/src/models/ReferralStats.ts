import mongoose, { Document, Schema } from 'mongoose';

export interface IReferralStats extends Document {
  userId: string;
  referralCode: string;
  directReferrals: number;
  totalReferrals: number; // Direct + Indirect
  referralTree: string[]; // Array of all user IDs in the tree
  lastUpdated: Date;
}

const referralStatsSchema = new Schema<IReferralStats>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    directReferrals: {
      type: Number,
      default: 0,
    },
    totalReferrals: {
      type: Number,
      default: 0,
      index: true, // For leaderboard sorting
    },
    referralTree: {
      type: [String],
      default: [],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for leaderboard queries
referralStatsSchema.index({ totalReferrals: -1, createdAt: 1 });

export const ReferralStats = mongoose.model<IReferralStats>(
  'ReferralStats',
  referralStatsSchema
);
