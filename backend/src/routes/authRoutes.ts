import { Router } from 'express';
import {
  register,
  verifyEmail,
  resendVerification,
  login,
  refresh,
  logout,
  updateSettings,
  requestPasswordReset,
  verifyPasswordResetOTP,
  resetPassword,
  getCurrentUser // Add this import
} from '../controllers/authControllers';
import { authenticateToken } from '../services/authMiddleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Password reset routes
router.post('/request-password-reset', requestPasswordReset);
router.post('/verify-reset-otp', verifyPasswordResetOTP);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser); // Add this line
router.put('/settings', authenticateToken, updateSettings);

export default router;
