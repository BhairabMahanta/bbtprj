import { Router, Request, Response } from 'express';
import { ReferralService } from '../services/referralService';
import { User } from '../models/User';
import { ReferralStats } from '../models/ReferralStats';
import { Types } from 'mongoose';

const router = Router();

// Get user's referral stats
router.get('/stats/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const stats = await ReferralStats.findOne({ userId });
    if (!stats) {
      return res.status(404).json({ error: 'Stats not found' });
    }

    const user = await User.findById(userId);
    
    res.json({
      success: true,
      data: {
        userId: stats.userId,
        username: user?.username,
        referralCode: stats.referralCode,
        directReferrals: stats.directReferrals,
        totalReferrals: stats.totalReferrals,
        lastUpdated: stats.lastUpdated,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// Get full referral tree
router.get('/tree/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const tree = await ReferralService.getReferralTree(userId);
    
    res.json({
      success: true,
      data: tree,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    const leaderboard = await ReferralService.getLeaderboard(limit, skip);
    const total = await ReferralStats.countDocuments();
    
    res.json({
      success: true,
      data: leaderboard,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Validate referral code
router.get('/validate/:referralCode', async (req: Request, res: Response) => {
  try {
    const { referralCode } = req.params;
    const user = await User.findOne({ referralCode }).select('username referralCode');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        valid: false,
        error: 'Invalid referral code' 
      });
    }
    
    res.json({
      success: true,
      valid: true,
      data: {
        referrerName: user.username,
        referralCode: user.referralCode,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
// Add referral code to existing user (for users who missed it during signup)
router.post('/add-referrer/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { referralCode } = req.body;

    console.log(`[Add Referrer] User ${userId} wants to add referral code: ${referralCode}`);

    if (!referralCode) {
      return res.status(400).json({ error: 'Referral code is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log(`[Add Referrer] User ${userId} not found`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`[Add Referrer] Found user: ${user.username}`);

    // Check if user already has a referrer
    if (user.referredBy) {
      console.log(`[Add Referrer] User ${user.username} already has referrer: ${user.referredBy}`);
      return res.status(400).json({ error: 'You already have a referrer' });
    }

    // Check if trying to refer themselves
    if (user.referralCode === referralCode) {
      console.log(`[Add Referrer] User ${user.username} tried to refer themselves`);
      return res.status(400).json({ error: 'You cannot refer yourself' });
    }

    // Validate referral code exists
    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      console.log(`[Add Referrer] Referral code ${referralCode} not found`);
      return res.status(404).json({ error: 'Invalid referral code' });
    }

    console.log(`[Add Referrer] Found referrer: ${referrer.username} (ID: ${referrer._id})`);

    // Update user
    user.referredBy = referralCode;
    await user.save();
    console.log(`[Add Referrer] Updated user ${user.username}, referredBy is now: ${user.referredBy}`);

    // Update referrer's stats
    console.log(`[Add Referrer] Updating stats for referrer ${referrer.username}`);
    await ReferralService.updateReferralStats((referrer._id as Types.ObjectId).toString());
    console.log(`[Add Referrer] Stats update completed`);

    // Fetch and return updated stats
    const updatedStats = await ReferralStats.findOne({ userId: (referrer._id as Types.ObjectId).toString() });
    console.log(`[Add Referrer] Referrer's updated stats:`, {
      direct: updatedStats?.directReferrals,
      total: updatedStats?.totalReferrals
    });

    res.json({
      success: true,
      message: 'Referral code added successfully',
      referrerStats: {
        directReferrals: updatedStats?.directReferrals,
        totalReferrals: updatedStats?.totalReferrals
      }
    });
  } catch (error: any) {
    console.error('[Add Referrer] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get direct referrals with their stats (paginated)
router.get('/direct/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get direct referrals with pagination
    const directReferrals = await User.find({ referredBy: user.referralCode })
      .select('username email referralCode createdAt isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments({ referredBy: user.referralCode });

    // Get stats for each direct referral
    const referralsWithStats = await Promise.all(
      directReferrals.map(async (referral: any) => {
        const stats = await ReferralStats.findOne({ 
          userId: referral._id.toString() 
        });

        return {
          _id: referral._id,
          username: referral.username,
          email: referral.email,
          referralCode: referral.referralCode,
          createdAt: referral.createdAt,
          isVerified: referral.isVerified,
          // Stats for this referral
          directReferrals: stats?.directReferrals || 0,
          totalReferrals: stats?.totalReferrals || 0,
        };
      })
    );
    
    res.json({
      success: true,
      data: referralsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by referral code
router.get('/user/code/:referralCode', async (req: Request, res: Response) => {
  try {
    const { referralCode } = req.params;
    const user = await User.findOne({ referralCode });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        referralCode: user.referralCode,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Manually refresh stats (for admin or cron job)
router.post('/refresh-stats/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    await ReferralService.updateReferralStats(userId);
    
    res.json({
      success: true,
      message: 'Stats refreshed successfully',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


export default router;
