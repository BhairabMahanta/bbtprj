import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

interface UserSettings {
  soundVolume: number;
}

export interface IUser extends Document {
  // Auth fields
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationToken?: string;
  refreshToken?: string;
  
  // Password reset fields
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  
  // Profile fields
  avatarUrl?: string;
  settings: UserSettings;
  
  // Referral system fields
  referralCode: string;
  referredBy: string | null;
  points: number; // ADD THIS - Track points in User model too
  // Admin field
  isAdmin: boolean; // ADD THIS
    
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String
    },
    refreshToken: {
      type: String
    },
    passwordResetToken: {
      type: String
    },
    passwordResetExpires: {
      type: Date
    },
    avatarUrl: {
      type: String,
      default: function() {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=akaimnky`;
      }
    },
    // ADD THIS FIELD
    points: {
      type: Number,
      default: 0,
      index: true, // For leaderboard queries
    },
    
    settings: {
      type: {
        soundVolume: {
          type: Number,
          default: 0.7,
          min: 0,
          max: 1
        }
      },
      default: () => ({ soundVolume: 0.7 })
    },
    // Referral system fields
    referralCode: {
      type: String,
      unique: true,
      default: () => nanoid(10),
      index: true,
    },
    referredBy: {
      type: String,
      default: null,
      index: true,
    },
    // ADD THIS FIELD
    isAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },
    highestScore: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance
UserSchema.index({ createdAt: -1 });
UserSchema.index({ email: 1, username: 1 });

// Hash password before saving
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('RefUser', UserSchema);
