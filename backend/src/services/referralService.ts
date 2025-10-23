import { User, IUser } from '../models/User';
import mongoose from 'mongoose';
import { ReferralStats } from '../models/ReferralStats';

export class ReferralService {
  /**
   * Initialize stats for a new user
   */
  static async initializeUserStats(userId: string, referralCode: string): Promise<void> {
    try {
      console.log(`[ReferralService] Initializing stats for user ${userId}`);
      const stats = await ReferralStats.create({
        userId,
        referralCode,
        directReferrals: 0,
        totalReferrals: 0,
        referralTree: [],
      });
      console.log(`[ReferralService] Stats initialized successfully for ${userId}`);
    } catch (error) {
      console.error(`[ReferralService] Error initializing stats for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get all referrals (direct and indirect) for a user
   */
  static async getAllReferrals(userId: string): Promise<string[]> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const allReferrals: string[] = [];
    const queue: string[] = [user.referralCode];
    const visited = new Set<string>(); // Prevent infinite loops

    while (queue.length > 0) {
      const currentCode = queue.shift()!;
      
      // Skip if already visited
      if (visited.has(currentCode)) continue;
      visited.add(currentCode);
      
      // Find all users referred by this code
      const directRefs = await User.find({ referredBy: currentCode }).select('_id referralCode');
      
      for (const ref of directRefs) {
        const refId = (ref._id as mongoose.Types.ObjectId).toString();
        allReferrals.push(refId);
        queue.push(ref.referralCode);
      }
    }

    return allReferrals;
  }

  /**
   * Get direct referrals only
   */
  static async getDirectReferrals(userId: string): Promise<IUser[]> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    return await User.find({ referredBy: user.referralCode });
  }

  /**
   * Update referral stats for a user and all their ancestors
   */
  static async updateReferralStats(userId: string): Promise<void> {
    try {
      console.log(`[ReferralService] Updating stats for user ${userId}`);
      
      const user = await User.findById(userId);
      if (!user) {
        console.error(`[ReferralService] User ${userId} not found`);
        throw new Error('User not found');
      }

      console.log(`[ReferralService] Found user: ${user.username} (${user.referralCode})`);

      // Get all referrals for this user
      const allReferralIds = await this.getAllReferrals(userId);
      const directReferrals = await User.find({ referredBy: user.referralCode });

      console.log(`[ReferralService] User ${user.username} has:`, {
        directReferrals: directReferrals.length,
        totalReferrals: allReferralIds.length,
        referralTree: allReferralIds
      });

      // Update or create stats for this user
      const updatedStats = await ReferralStats.findOneAndUpdate(
        { userId: (user._id as mongoose.Types.ObjectId).toString() },
        {
          $set: {
            userId: (user._id as mongoose.Types.ObjectId).toString(),
            referralCode: user.referralCode,
            directReferrals: directReferrals.length,
            totalReferrals: allReferralIds.length,
            referralTree: allReferralIds,
            lastUpdated: new Date(),
          }
        },
        { upsert: true, new: true, runValidators: true }
      );

      console.log(`[ReferralService] Stats updated for ${user.username}:`, {
        direct: updatedStats?.directReferrals,
        total: updatedStats?.totalReferrals
      });

      // Update all ancestor stats (propagate up the tree)
      if (user.referredBy) {
        console.log(`[ReferralService] User has referrer with code: ${user.referredBy}`);
        const referrer = await User.findOne({ referralCode: user.referredBy });
        if (referrer) {
          console.log(`[ReferralService] Updating ancestor: ${referrer.username}`);
          await this.updateReferralStats((referrer._id as mongoose.Types.ObjectId).toString());
        } else {
          console.warn(`[ReferralService] Referrer not found for code: ${user.referredBy}`);
        }
      }
    } catch (error) {
      console.error(`[ReferralService] Error updating stats for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get leaderboard sorted by total referrals
   */
  static async getLeaderboard(limit: number = 100, skip: number = 0) {
    const leaderboard = await ReferralStats.find()
      .sort({ totalReferrals: -1, createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const userIds = leaderboard.map((stat) => stat.userId);
    const users = await User.find({ _id: { $in: userIds } }).select('username email referralCode');

    const userMap = new Map(users.map((u) => [(u._id as mongoose.Types.ObjectId).toString(), u]));

    return leaderboard.map((stat, index) => ({
      rank: skip + index + 1,
      userId: stat.userId,
      username: userMap.get(stat.userId)?.username || 'Unknown',
      email: userMap.get(stat.userId)?.email || 'Unknown',
      referralCode: stat.referralCode,
      directReferrals: stat.directReferrals,
      totalReferrals: stat.totalReferrals,
    }));
  }

  /**
   * Get user's referral tree structure
   */
  static async getReferralTree(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const buildTree = async (referralCode: string, level: number = 0): Promise<any> => {
      const directRefs = await User.find({ referredBy: referralCode })
        .select('username email referralCode createdAt')
        .lean();

      const children = await Promise.all(
        directRefs.map(async (ref: any) => ({
          id: ref._id,
          username: ref.username,
          email: ref.email,
          referralCode: ref.referralCode,
          level: level + 1,
          children: await buildTree(ref.referralCode, level + 1),
        }))
      );

      return children;
    };

    return {
      id: user._id,
      username: user.username,
      email: user.email,
      referralCode: user.referralCode,
      level: 0,
      children: await buildTree(user.referralCode, 0),
    };
  }
}
