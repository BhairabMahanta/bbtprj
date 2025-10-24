import { User } from '../models/User';
import { ReferralStats } from '../models/ReferralStats';
import { ReferralService } from './referralService';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

export class AdminService {
  /**
   * Calculate total users that will be created
   */
  static calculateTotalUsers(levels: number, usersPerLevel: number): number {
    let total = 0;
    for (let i = 1; i <= levels; i++) {
      total += Math.pow(usersPerLevel, i);
    }
    return total;
  }

  /**
   * Generate test referral tree
   * @param rootUserId - The user to build the tree under
   * @param levels - How many generation levels to create
   * @param usersPerLevel - How many users per parent at each level
   */
  static async generateTestData(
    rootUserId: string,
    levels: number = 3,
    usersPerLevel: number = 2
  ): Promise<{ created: number; message: string }> {
    try {
      const rootUser = await User.findById(rootUserId);
      if (!rootUser) {
        throw new Error('Root user not found');
      }

      let totalCreated = 0;
      const hashedPassword = await bcrypt.hash('TestPass123!', 10);

      // Build tree level by level
      const buildLevel = async (
        parentReferralCode: string,
        currentLevel: number,
        maxLevel: number
      ): Promise<void> => {
        if (currentLevel > maxLevel) return;

        for (let i = 0; i < usersPerLevel; i++) {
          const username = `test_L${currentLevel}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          const email = `${username}@testuser.local`;

          // Create test user
          const testUser = await User.create({
            username,
            email,
            password: hashedPassword,
            isVerified: true,
            referredBy: parentReferralCode,
          });

          totalCreated++;

          // Initialize stats for test user
          await ReferralService.initializeUserStats(
            (testUser._id as mongoose.Types.ObjectId).toString(),
            testUser.referralCode
          );

          console.log(`[AdminService] Created test user: ${username} (Level ${currentLevel}) - Total: ${totalCreated}`);

          // Recursively create children
          await buildLevel(testUser.referralCode, currentLevel + 1, maxLevel);
        }
      };

      // Start building from root user's referral code
      await buildLevel(rootUser.referralCode, 1, levels);

      // Update stats for root user and all ancestors
      console.log('[AdminService] Updating stats for root user and all test users...');
      try {
        await ReferralService.updateReferralStats(rootUserId);
        console.log('[AdminService] Stats update completed successfully');
      } catch (statsError) {
        console.error('[AdminService] Error updating stats:', statsError);
        // Don't throw - users were created successfully
      }

      return {
        created: totalCreated,
        message: `Successfully created ${totalCreated} test users across ${levels} levels`,
      };
    } catch (error) {
      console.error('[AdminService] Error generating test data:', error);
      throw error;
    }
  }

  /**
   * Delete all test users
   */
  static async deleteTestData(): Promise<{ deleted: number; message: string }> {
    try {
      console.log('[AdminService] Starting test data deletion...');
      
      // First, find all test users to get their IDs
      const testUsers = await User.find({
        email: { $regex: '@testuser\\.local$' },
      }).select('_id');

      const testUserIds = testUsers.map((u) =>
        (u._id as mongoose.Types.ObjectId).toString()
      );

      console.log(`[AdminService] Found ${testUserIds.length} test users to delete`);

      // Delete their stats first
      const deletedStats = await ReferralStats.deleteMany({
        userId: { $in: testUserIds },
      });

      console.log(`[AdminService] Deleted ${deletedStats.deletedCount} test user stats`);

      // Then delete the users
      const deletedUsers = await User.deleteMany({
        email: { $regex: '@testuser\\.local$' },
      });

      console.log(`[AdminService] Deleted ${deletedUsers.deletedCount} test users`);

      // Refresh stats for all remaining users to fix any broken references
      console.log('[AdminService] Refreshing stats for all remaining users...');
      const allRemainingUsers = await User.find({
        email: { $not: { $regex: '@testuser\\.local$' } }
      }).select('_id');

      let refreshed = 0;
      for (const user of allRemainingUsers) {
        try {
          await ReferralService.updateReferralStats(
            (user._id as mongoose.Types.ObjectId).toString()
          );
          refreshed++;
        } catch (err) {
          console.error(`Failed to refresh stats for user ${user._id}:`, err);
        }
      }

      console.log(`[AdminService] Refreshed stats for ${refreshed} users`);

      return {
        deleted: deletedUsers.deletedCount || 0,
        message: `Deleted ${deletedUsers.deletedCount} test users, ${deletedStats.deletedCount} stats, and refreshed ${refreshed} user stats`,
      };
    } catch (error) {
      console.error('[AdminService] Error deleting test data:', error);
      throw error;
    }
  }

  /**
   * Refresh stats for all users
   */
  static async refreshAllStats(): Promise<{ updated: number; message: string }> {
    try {
      const allUsers = await User.find().select('_id');
      let updated = 0;
      let failed = 0;

      console.log(`[AdminService] Starting stats refresh for ${allUsers.length} users...`);

      for (const user of allUsers) {
        try {
          await ReferralService.updateReferralStats(
            (user._id as mongoose.Types.ObjectId).toString()
          );
          updated++;
          
          // Log progress every 10 users
          if (updated % 10 === 0) {
            console.log(`[AdminService] Progress: ${updated}/${allUsers.length} users updated`);
          }
        } catch (err) {
          failed++;
          console.error(`Failed to update stats for user ${user._id}:`, err);
        }
      }

      console.log(`[AdminService] Completed: ${updated} succeeded, ${failed} failed`);

      return {
        updated,
        message: `Successfully updated stats for ${updated} users${failed > 0 ? `, ${failed} failed` : ''}`,
      };
    } catch (error) {
      console.error('[AdminService] Error refreshing all stats:', error);
      throw error;
    }
  }

  /**
   * Get admin dashboard stats
   */
  static async getDashboardStats() {
    try {
      const totalUsers = await User.countDocuments();
      const verifiedUsers = await User.countDocuments({ isVerified: true });
      const testUsers = await User.countDocuments({ email: { $regex: '@testuser\\.local$' } });
      
      const totalReferrals = await ReferralStats.aggregate([
        { $group: { _id: null, total: { $sum: '$totalReferrals' } } },
      ]);

      const topReferrer = await ReferralStats.findOne()
        .sort('-totalReferrals');

      let topReferrerData = null;
      if (topReferrer) {
        const topUser = await User.findById(topReferrer.userId).select('username');
        topReferrerData = {
          username: topUser?.username || 'Unknown',
          referrals: topReferrer.totalReferrals,
        };
      }

      return {
        totalUsers,
        verifiedUsers,
        testUsers,
        realUsers: totalUsers - testUsers,
        totalReferrals: totalReferrals[0]?.total || 0,
        topReferrer: topReferrerData,
      };
    } catch (error) {
      console.error('[AdminService] Error getting dashboard stats:', error);
      throw error;
    }
  }
}
