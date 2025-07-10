import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserDocument } from './user';
import { ExerciseDocument } from './exercise';

export interface UserExercisePreferenceDocument extends Document {
  userId: mongoose.Types.ObjectId;
  exerciseId: mongoose.Types.ObjectId;
  status: 'favorite';
  addedAt: Date;
  lastUsed?: Date;
  notes?: string;
  customSettings?: {
    defaultSets?: number;
    defaultReps?: number;
    defaultWeight?: number;
    restTime?: number; // in seconds
    progressNotes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserExercisePreferenceSchema = new Schema<UserExercisePreferenceDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true
    },    status: {
      type: String,
      enum: ['favorite'],
      default: 'favorite',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now,
      required: true
    },
    lastUsed: {
      type: Date
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500
    },
    customSettings: {
      defaultSets: {
        type: Number,
        min: 1,
        max: 20
      },
      defaultReps: {
        type: Number,
        min: 1,
        max: 100
      },
      defaultWeight: {
        type: Number,
        min: 0,
        max: 1000
      },
      restTime: {
        type: Number,
        min: 0,
        max: 600 // 10 minutes max
      },
      progressNotes: {
        type: String,
        trim: true,
        maxlength: 200
      }
    }
  },
  {
    timestamps: true,
    collection: 'user_exercise_preferences',
  }
);

// Ensure unique combination of user and exercise
UserExercisePreferenceSchema.index({ userId: 1, exerciseId: 1 }, { unique: true });

// Performance Indexes
UserExercisePreferenceSchema.index({ userId: 1 }); // Index for user's preferences
UserExercisePreferenceSchema.index({ exerciseId: 1 }); // Index for exercise popularity
UserExercisePreferenceSchema.index({ userId: 1, status: 1 }); // Index for user's preferences by status
UserExercisePreferenceSchema.index({ userId: 1, lastUsed: -1 }); // Index for recent activity
UserExercisePreferenceSchema.index({ status: 1 }); // Index for status filtering
UserExercisePreferenceSchema.index({ addedAt: -1 }); // Index for recent additions

// Middleware to update lastUsed when status changes to 'favorite'
UserExercisePreferenceSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'favorite') {
    this.lastUsed = new Date();
  }
  next();
});

const UserExercisePreference = (mongoose.models.UserExercisePreference || 
  mongoose.model<UserExercisePreferenceDocument>('UserExercisePreference', UserExercisePreferenceSchema)) as Model<UserExercisePreferenceDocument>;

export default UserExercisePreference;
