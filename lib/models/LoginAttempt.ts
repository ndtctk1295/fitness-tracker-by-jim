import mongoose, { Schema, Document } from 'mongoose';

export interface ILoginAttempt extends Document {
  identifier: string; // email or IP address
  type: 'email' | 'ip';
  failedAttempts: number;
  lastAttempt: Date;
  lockedUntil?: Date;
  attemptHistory: Date[];
}

const LoginAttemptSchema = new Schema<ILoginAttempt>({
  identifier: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['email', 'ip'],
    required: true,
  },
  failedAttempts: {
    type: Number,
    default: 0,
  },
  lastAttempt: {
    type: Date,
    default: Date.now,
  },
  lockedUntil: {
    type: Date,
    index: { expires: 0 }, // Auto-delete when lock expires
  },
  attemptHistory: [{
    type: Date,
    default: Date.now,
  }],
}, {
  timestamps: true,
});

// Compound index for efficient queries
LoginAttemptSchema.index({ identifier: 1, type: 1 }, { unique: true });

// TTL index to automatically clean up old records after 24 hours
LoginAttemptSchema.index({ lastAttempt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.models.LoginAttempt || mongoose.model<ILoginAttempt>('LoginAttempt', LoginAttemptSchema);
