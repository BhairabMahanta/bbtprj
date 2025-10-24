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
        points: 0,
        generationStats: new Map(),
      });
      console.log(`[ReferralService] Stats initialized successfully for ${userId}`);
    } catch (error) {
      console.error(`[ReferralService] Error initializing stats for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get all referrals organized by generation/level
   */
  static async getReferralsByGeneration(userId: string): Promise<Map<number, string[]>> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const generationMap = new Map<number, string[]>();
    const visited = new Set<string>();
    
    // BFS to traverse the tree level by level
    interface QueueItem {
      referralCode: string;
      level: number;
    }
    
    const queue: QueueItem[] = [{ referralCode: user.referralCode, level: 0 }];

    while (queue.length > 0) {
      const { referralCode, level } = queue.shift()!;
      
      if (visited.has(referralCode)) continue;
      visited.add(referralCode);
      
      // Find all users referred by this code
      const directRefs = await User.find({ referredBy: referralCode })
        .select('_id referralCode')
        .lean();
      
      if (directRefs.length > 0) {
        const nextLevel = level + 1;
        
        for (const ref of directRefs) {
          const refId = (ref._id as mongoose.Types.ObjectId).toString();
          
          // Add to generation map
          if (!generationMap.has(nextLevel)) {
            generationMap.set(nextLevel, []);
          }
          generationMap.get(nextLevel)!.push(refId);
          
          // Add to queue for next level
          queue.push({ referralCode: ref.referralCode, level: nextLevel });
        }
      }
    }

    return generationMap;
  }

/**
 * Calculate points based on exponential generation system
 * Generation 1 (direct): No points
 * Generation 2: 4 referrals = 1 point
 * Generation 3: 8 referrals = 1 point
 * Generation n: 2^n referrals = 1 point
 */
static calculatePoints(generationStats: Map<string, number>): number {
  let totalPoints = 0;

  for (const [generationStr, count] of generationStats.entries()) {
    const generation = parseInt(generationStr);
    
    // Skip generation 1 (direct referrals) - they don't give points
    if (generation === 1) {
      console.log(`[Points] Generation ${generation}: ${count} referrals = 0 points (direct referrals excluded)`);
      continue; // Skip to next iteration
    }
    
    // Calculate points for generation 2+
    const requiredForPoint = Math.pow(2, generation);
    const pointsFromGeneration = Math.floor(count / requiredForPoint);
    totalPoints += pointsFromGeneration;
    
    console.log(`[Points] Generation ${generation}: ${count} referrals, requires ${requiredForPoint} per point = ${pointsFromGeneration} points`);
  }

  return totalPoints;
}


  /**
   * Get all referrals (direct and indirect) for a user
   */
  static async getAllReferrals(userId: string): Promise<string[]> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const allReferrals: string[] = [];
    const queue: string[] = [user.referralCode];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const currentCode = queue.shift()!;
      
      if (visited.has(currentCode)) continue;
      visited.add(currentCode);
      
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

    // Get all referrals organized by generation
    const generationMap = await this.getReferralsByGeneration(userId);
    
    // Convert to plain object for storage - USE STRING KEYS
    const generationStats = new Map<string, number>(); // Changed from Map<number, number>
    let totalReferrals = 0;
    
    for (const [level, refs] of generationMap.entries()) {
      generationStats.set(level.toString(), refs.length); // Convert number to string!
      totalReferrals += refs.length;
    }

    // Calculate points - now we need to handle string keys
    const points = this.calculatePoints(generationStats);

    // Get direct referrals count
    const directReferrals = await User.find({ referredBy: user.referralCode });
    const allReferralIds = await this.getAllReferrals(userId);

    console.log(`[ReferralService] User ${user.username} has:`, {
      directReferrals: directReferrals.length,
      totalReferrals: allReferralIds.length,
      points,
      generationStats: Object.fromEntries(generationStats)
    });

    // Update or create stats for this user
// After updating ReferralStats, also update User model
const updatedStats = await ReferralStats.findOneAndUpdate(
  { userId: (user._id as mongoose.Types.ObjectId).toString() },
  {
    $set: {
      userId: (user._id as mongoose.Types.ObjectId).toString(),
      referralCode: user.referralCode,
      directReferrals: directReferrals.length,
      totalReferrals: allReferralIds.length,
      referralTree: allReferralIds,
      points,
      generationStats,
      lastUpdated: new Date(),
    }
  },
  { upsert: true, new: true, runValidators: true }
);

// SYNC POINTS TO USER MODEL
await User.findByIdAndUpdate(
  user._id,
  { $set: { points } }
);

console.log(`[ReferralService] Stats updated for ${user.username}:`, {
  direct: updatedStats?.directReferrals,
  total: updatedStats?.totalReferrals,
  points: updatedStats?.points
});


    console.log(`[ReferralService] Stats updated for ${user.username}:`, {
      direct: updatedStats?.directReferrals,
      total: updatedStats?.totalReferrals,
      points: updatedStats?.points
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
   * Get leaderboard sorted by points (or total referrals as fallback)
   */

/**
 * Get leaderboard sorted by points (or total referrals as fallback)
 */
static async getLeaderboard(limit: number = 100, skip: number = 0, sortBy: 'points' | 'referrals' = 'points') {
  // Fix: Use explicit type assertion or string keys with proper typing
  const sortCriteria = sortBy === 'points' 
    ? { points: -1 as const, totalReferrals: -1 as const, createdAt: 1 as const } 
    : { totalReferrals: -1 as const, points: -1 as const, createdAt: 1 as const };
  
  const leaderboard = await ReferralStats.find()
    .sort(sortCriteria)
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
    points: stat.points || 0,
    generationStats: stat.generationStats,
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
