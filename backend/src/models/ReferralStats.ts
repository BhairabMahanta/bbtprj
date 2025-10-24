import mongoose, { Document, Schema } from 'mongoose';

export interface IReferralStats extends Document {
  userId: string;
  referralCode: string;
  directReferrals: number;
  totalReferrals: number;
  referralTree: string[];
  
  // New fields for points system
  points: number;
  generationStats: Map<number, number>; // generation level -> count of referrals at that level
  
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
      index: true,
    },
    referralTree: {
      type: [String],
      default: [],
    },
    // New fields
    points: {
      type: Number,
      default: 0,
      index: true, // For leaderboard sorting by points
    },
    generationStats: {
      type: Map,
      of: Number,
      default: new Map(),
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

// Compound indexes for leaderboard queries
referralStatsSchema.index({ points: -1, createdAt: 1 });
referralStatsSchema.index({ totalReferrals: -1, createdAt: 1 });

export const ReferralStats = mongoose.model<IReferralStats>(
  'ReferralStats',
  referralStatsSchema
);
