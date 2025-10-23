// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import tokenService from './tokenService';

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

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      res.status(401).json({ message: 'Unauthorized: No token provided' });
      return;
    }

    const userData = tokenService.validateAccessToken(token);
    if (!userData) {
      res.status(401).json({ message: 'Unauthorized: Invalid token' });
      return;
    }

    req.user = userData;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};