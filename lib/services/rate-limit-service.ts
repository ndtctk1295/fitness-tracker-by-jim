import LoginAttempt, { ILoginAttempt } from '@/lib/models/LoginAttempt';
import connectToMongoDB from '@/lib/mongodb';

export interface RateLimitConfig {
  maxAttempts: number;
  lockoutDuration: number; // in minutes
  progressiveDelays: number[]; // in seconds
}

export interface RateLimitResult {
  isLocked: boolean;
  remainingAttempts: number;
  lockoutUntil?: Date;
  nextAllowedAttempt?: Date;
  message?: string;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  lockoutDuration: 15, // 15 minutes
  progressiveDelays: [1, 2, 4, 8, 16], // Progressive delays in seconds
};

export class RateLimitService {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  /**
   * Check if an identifier (email/IP) is rate limited
   */
  async checkRateLimit(identifier: string, type: 'email' | 'ip' = 'email'): Promise<RateLimitResult> {
    await connectToMongoDB();

    const attempt = await LoginAttempt.findOne({ identifier, type });

    if (!attempt) {
      return {
        isLocked: false,
        remainingAttempts: this.config.maxAttempts,
      };
    }

    const now = new Date();

    // Check if currently locked
    if (attempt.lockedUntil && attempt.lockedUntil > now) {
      return {
        isLocked: true,
        remainingAttempts: 0,
        lockoutUntil: attempt.lockedUntil,
        message: `Account locked due to too many failed attempts. Try again after ${attempt.lockedUntil.toLocaleTimeString()}.`,
      };
    }

    // Check if we need to apply progressive delay
    if (attempt.failedAttempts > 0 && attempt.failedAttempts <= this.config.progressiveDelays.length) {
      const delaySeconds = this.config.progressiveDelays[attempt.failedAttempts - 1];
      const nextAllowedAttempt = new Date(attempt.lastAttempt.getTime() + delaySeconds * 1000);

      if (nextAllowedAttempt > now) {
        return {
          isLocked: false,
          remainingAttempts: this.config.maxAttempts - attempt.failedAttempts,
          nextAllowedAttempt,
          message: `Too many attempts. Please wait ${Math.ceil((nextAllowedAttempt.getTime() - now.getTime()) / 1000)} seconds before trying again.`,
        };
      }
    }

    const remainingAttempts = Math.max(0, this.config.maxAttempts - attempt.failedAttempts);

    return {
      isLocked: false,
      remainingAttempts,
    };
  }

  /**
   * Record a failed login attempt
   */
  async recordFailedAttempt(identifier: string, type: 'email' | 'ip' = 'email'): Promise<RateLimitResult> {
    await connectToMongoDB();

    const now = new Date();
    let attempt = await LoginAttempt.findOne({ identifier, type });

    if (!attempt) {
      attempt = new LoginAttempt({
        identifier,
        type,
        failedAttempts: 1,
        lastAttempt: now,
        attemptHistory: [now],
      });
    } else {
      attempt.failedAttempts += 1;
      attempt.lastAttempt = now;
      attempt.attemptHistory.push(now);

      // Keep only last 10 attempts in history
      if (attempt.attemptHistory.length > 10) {
        attempt.attemptHistory = attempt.attemptHistory.slice(-10);
      }
    }

    // Check if we should lock the account
    if (attempt.failedAttempts >= this.config.maxAttempts) {
      attempt.lockedUntil = new Date(now.getTime() + this.config.lockoutDuration * 60 * 1000);
    }

    await attempt.save();

    return this.checkRateLimit(identifier, type);
  }

  /**
   * Record a successful login (clears failed attempts)
   */
  async recordSuccessfulAttempt(identifier: string, type: 'email' | 'ip' = 'email'): Promise<void> {
    await connectToMongoDB();
    await LoginAttempt.deleteOne({ identifier, type });
  }

  /**
   * Reset rate limit for an identifier (admin function)
   */
  async resetRateLimit(identifier: string, type: 'email' | 'ip' = 'email'): Promise<void> {
    await connectToMongoDB();
    await LoginAttempt.deleteOne({ identifier, type });
  }

  /**
   * Get rate limit status for an identifier
   */
  async getRateLimitStatus(identifier: string, type: 'email' | 'ip' = 'email'): Promise<ILoginAttempt | null> {
    await connectToMongoDB();
    return LoginAttempt.findOne({ identifier, type });
  }

  /**
   * Clean up expired rate limit records (can be used in cron jobs)
   */
  async cleanupExpiredRecords(): Promise<number> {
    await connectToMongoDB();
    const result = await LoginAttempt.deleteMany({
      $or: [
        { lockedUntil: { $lte: new Date() } },
        { lastAttempt: { $lte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, // 24 hours old
      ],
    });
    return result.deletedCount;
  }
}

// Export singleton instance
export const rateLimitService = new RateLimitService();
