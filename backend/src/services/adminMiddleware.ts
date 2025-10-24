import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Unauthorized: Authentication required' });
      return;
    }

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!user.isAdmin) {
      res.status(403).json({ message: 'Forbidden: Admin access required' });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
