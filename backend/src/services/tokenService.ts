import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// Environment variables (should be in .env file)
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret_key_change_in_production';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_key_change_in_production';

export interface TokenPayload {
  userId: string;
  email: string;
}

class TokenService {
  generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '10d' });
    
    return {
      accessToken,
      refreshToken
    };
  }

  validateAccessToken(token: string) {
    try {
      return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  validateRefreshToken(token: string) {
    try {
      return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  generateVerificationToken() {
    // Generate a 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async saveToken(userId: string, refreshToken: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    user.refreshToken = refreshToken;
    await user.save();
    
    return refreshToken;
  }

  async removeToken(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    user.refreshToken = undefined;
    await user.save();
  }

  async findToken(refreshToken: string) {
    const user = await User.findOne({ refreshToken });
    return user;
  }
}

export default new TokenService();
