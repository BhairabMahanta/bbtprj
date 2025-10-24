import { Router, Request, Response } from 'express';
import { authenticateToken } from '../services/authMiddleware';
import { requireAdmin } from '../services/adminMiddleware';
import { AdminService } from '../services/adminService';

const router = Router();

// All routes require authentication AND admin access
router.use(authenticateToken);
router.use(requireAdmin);

// Get dashboard stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await AdminService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('[Admin] Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate test data
router.post('/generate-test-data', async (req: Request, res: Response) => {
  try {
    const { userId, levels = 3, usersPerLevel = 2 } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    console.log(`[Admin] Generating test data: ${levels} levels, ${usersPerLevel} users per level`);
    
    const result = await AdminService.generateTestData(userId, levels, usersPerLevel);
    
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[Admin] Error generating test data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete test data
router.delete('/delete-test-data', async (req: Request, res: Response) => {
  try {
    console.log('[Admin] Deleting all test data...');
    
    const result = await AdminService.deleteTestData();
    
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[Admin] Error deleting test data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Refresh all stats
router.post('/refresh-all-stats', async (req: Request, res: Response) => {
  try {
    console.log('[Admin] Refreshing all user stats...');
    
    const result = await AdminService.refreshAllStats();
    
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[Admin] Error refreshing stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
