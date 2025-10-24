import { Request, Response } from 'express';
import { User } from '../models/User';
import tokenService from '../services/tokenService';
import emailService from '../services/emailService';
import { ReferralService } from '../services/referralService';
import { Types } from 'mongoose';

// Extend Request interface for authenticated routes
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, referralCode } = req.body;
    console.log("username, email, password, referralCode", username, email, password, referralCode);

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
      return;
    }

    // Validate referral code if provided
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (!referrer) {
        res.status(400).json({ message: 'Invalid referral code' });
        return;
      }
    }

    // Generate verification token (OTP)
    const verificationToken = tokenService.generateVerificationToken();

    // Create new user with referral code
    const newUser = new User({
      username,
      email,
      password,
      verificationToken,
      isVerified: false,
      referredBy: referralCode || null,
    });

    await newUser.save();

    // Initialize referral stats for new user
    await ReferralService.initializeUserStats((newUser._id as Types.ObjectId).toString(), newUser.referralCode);

    // Update referrer's stats if applicable
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        await ReferralService.updateReferralStats((referrer._id as Types.ObjectId).toString());
      }
    }

    // Send verification email
    await emailService.sendVerificationEmail(
      email,
      username,
      verificationToken
    );

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      userId: newUser._id,
      referralCode: newUser.referralCode
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

// Verify email with OTP
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email, verificationToken: otp });
    if (!user) {
      res.status(400).json({ message: 'Invalid verification code' });
      return;
    }

    // Update user status
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Generate tokens
    const tokens = tokenService.generateTokens({ 
      userId: (user._id as Types.ObjectId).toString(), 
      email: user.email 
    });

    // Save refresh token
    await tokenService.saveToken((user._id as Types.ObjectId).toString(), tokens.refreshToken);

    res.status(200).json({
      message: 'Email verified successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        referralCode: user.referralCode,
        settings: user.settings
      },
      ...tokens
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
};

// Resend verification email
export const resendVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, isVerified: false });
    if (!user) {
      res.status(400).json({ 
        message: 'User not found or already verified' 
      });
      return;
    }

    // Generate new verification token
    const verificationToken = tokenService.generateVerificationToken();
    user.verificationToken = verificationToken;
    await user.save();

    // Send verification email
    await emailService.sendVerificationEmail(
      email,
      user.username,
      verificationToken
    );

    res.status(200).json({
      message: 'Verification email resent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Failed to resend verification email' });
  }
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check if user is verified
    if (!user.isVerified) {
      res.status(403).json({ 
        message: 'Email not verified. Please verify your email first.',
        needsVerification: true
      });
      return;
    }

    // Generate tokens
    const tokens = tokenService.generateTokens({ 
      userId: (user._id as Types.ObjectId).toString(), 
      email: user.email 
    });

    // Save refresh token
    await tokenService.saveToken((user._id as Types.ObjectId).toString(), tokens.refreshToken);

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        referralCode: user.referralCode,
        settings: user.settings
      },
      ...tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

// Refresh token
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Validate refresh token
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDb) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userData.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Generate new tokens
    const tokens = tokenService.generateTokens({ 
      userId: (user._id as Types.ObjectId).toString(), 
      email: user.email 
    });

    // Save new refresh token
    await tokenService.saveToken((user._id as Types.ObjectId).toString(), tokens.refreshToken);

    res.status(200).json({
      ...tokens,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        referralCode: user.referralCode,
        settings: user.settings
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Token refresh failed' });
  }
};

// Logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh token is required' });
      return;
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    if (userData) {
      await tokenService.removeToken(userData.userId);
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
};

// Update user settings
export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { soundVolume } = req.body;
    
    // Validation
    if (soundVolume !== undefined && (soundVolume < 0 || soundVolume > 1)) {
      res.status(400).json({ error: 'Volume must be between 0 and 1' });
      return;
    }

    // Check if user is authenticated
    if (!req.user?.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Update user settings
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { 'settings.soundVolume': soundVolume } },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ settings: user.settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Security: Don't reveal if email exists
      res.status(200).json({ 
        message: 'If this email exists, you will receive a password reset code.' 
      });
      return;
    }

    // Generate 6-digit OTP
    const resetToken = tokenService.generateVerificationToken();
    
    // Store OTP with 15-minute expiration
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Send password reset email
    await emailService.sendPasswordResetEmail(
      email,
      user.username,
      resetToken
    );

    res.status(200).json({
      message: 'Password reset code sent to your email'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Failed to process password reset request' });
  }
};

export const verifyPasswordResetOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ 
      email, 
      passwordResetToken: otp,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired reset code' });
      return;
    }

    res.status(200).json({
      message: 'Reset code verified. You can now reset your password.',
      email: user.email
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    // Validate password
    if (newPassword.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    const user = await User.findOne({ 
      email, 
      passwordResetToken: otp,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired reset code' });
      return;
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Password reset failed' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
console.log("Fetched user data for /me:", user);
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      isAdmin: user.isAdmin, // Make sure this is included!
      settings: user.settings,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};