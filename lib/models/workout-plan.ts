import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserDocument } from './user';
import { ExerciseGenerationPolicy, ExerciseGenerationPolicySchema, DEFAULT_GENERATION_POLICY } from './exercise-generation-policy';

// TypeScript interfaces
export type WorkoutPlanLevel = 'beginner' | 'intermediate' | 'advanced';
export type WorkoutPlanMode = 'ongoing' | 'dated';

export interface ExerciseTemplate {
  exerciseId: mongoose.Types.ObjectId;
  sets: number;
  reps: number;
  weight: number;
  weightPlates?: Record<string, number>;
  notes?: string;
  orderIndex: number;
}

export interface DayTemplate {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0, Saturday = 6
  name?: string; // e.g., "Push Day", "Pull Day", "Rest"
  exerciseTemplates: ExerciseTemplate[];
}

export interface WorkoutPlanDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  level: WorkoutPlanLevel;
  duration?: number; // Optional duration in weeks
  isActive: boolean; // Only one can be true per user
  mode: WorkoutPlanMode;
  startDate?: Date; // Required for dated mode
  endDate?: Date; // Required for dated mode
  weeklyTemplate: DayTemplate[];
  generationPolicy?: ExerciseGenerationPolicy; // Add generation policy
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// MongoDB Schema
const ExerciseTemplateSchema = new Schema<ExerciseTemplate>({
  exerciseId: {
    type: Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true,
  },
  sets: {
    type: Number,
    required: true,
    min: 1,
    max: 20,
  },
  reps: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
  },
  weightPlates: {
    type: Object,
    default: {},
  },
  notes: {
    type: String,
    default: '',
    maxlength: 500,
  },
  orderIndex: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const DayTemplateSchema = new Schema<DayTemplate>({
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6,
  },
  name: {
    type: String,
    maxlength: 50,
  },
  exerciseTemplates: {
    type: [ExerciseTemplateSchema],
    default: [],
  },
}, { _id: false });

const WorkoutPlanSchema = new Schema<WorkoutPlanDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    duration: {
      type: Number,
      min: 1,
      max: 52, // Max 1 year
    },    isActive: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      enum: ['ongoing', 'dated'],
      required: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    weeklyTemplate: {
      type: [DayTemplateSchema],
      required: true,
      validate: {
        validator: function(templates: DayTemplate[]) {
          // Ensure we have exactly 7 days (0-6)
          const days = templates.map(t => t.dayOfWeek);
          const uniqueDays = new Set(days);
          return uniqueDays.size === 7 && days.every(day => day >= 0 && day <= 6);
        },
        message: 'Weekly template must contain exactly 7 days (0-6)',
      },
    },
    generationPolicy: {
      type: ExerciseGenerationPolicySchema,
      default: DEFAULT_GENERATION_POLICY,
    },
    createdBy: {
      type: String,
      maxlength: 100,
    },
    updatedBy: {
      type: String,
      maxlength: 100,
    },
  },
  {
    timestamps: true,
    collection: 'workoutPlans',
  }
);

// Validation middleware
WorkoutPlanSchema.pre('save', function(next) {
  // Validate dated mode requirements
  if (this.mode === 'dated') {
    if (!this.startDate || !this.endDate) {
      return next(new Error('Start date and end date are required for dated workout plans'));
    }
    if (this.endDate <= this.startDate) {
      return next(new Error('End date must be after start date'));
    }
  }

  // Validate duration consistency
  if (this.mode === 'dated' && this.duration) {
    const expectedEndDate = new Date(this.startDate!);
    expectedEndDate.setDate(expectedEndDate.getDate() + (this.duration * 7));
    
    // Allow some flexibility (±1 day) for end date calculation
    const timeDiff = Math.abs(expectedEndDate.getTime() - this.endDate!.getTime());
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    
    if (daysDiff > 1) {
      return next(new Error('Duration does not match the date range'));
    }
  }

  next();
});

// Ensure only one active plan per user
WorkoutPlanSchema.pre('save', async function(next) {
  if (this.isModified('isActive') && this.isActive) {
    try {
      // Deactivate all other plans for this user
      await mongoose.model('WorkoutPlan').updateMany(
        { 
          userId: this.userId, 
          _id: { $ne: this._id },
          isActive: true 
        },
        { isActive: false }
      );
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

// Performance indexes
WorkoutPlanSchema.index({ userId: 1, isActive: 1 }); // Find user's active plan
WorkoutPlanSchema.index({ userId: 1, createdAt: -1 }); // User's plans by creation date
WorkoutPlanSchema.index({ userId: 1, mode: 1 }); // User's plans by mode
WorkoutPlanSchema.index({ userId: 1, level: 1 }); // User's plans by level
WorkoutPlanSchema.index({ mode: 1, startDate: 1, endDate: 1 }); // Date range queries for dated plans
WorkoutPlanSchema.index({ isActive: 1 }); // Global active plans
WorkoutPlanSchema.index({ 'weeklyTemplate.exerciseTemplates.exerciseId': 1 }); // Exercise usage tracking

// Compound index for conflict detection in dated plans
WorkoutPlanSchema.index({ 
  userId: 1, 
  mode: 1, 
  startDate: 1, 
  endDate: 1 
});

// Static methods for conflict detection
WorkoutPlanSchema.statics.findConflictingPlans = async function(
  userId: mongoose.Types.ObjectId,
  startDate: Date,
  endDate: Date,
  excludeId?: mongoose.Types.ObjectId
) {
  const query: any = {
    userId,
    mode: 'dated',
    $or: [
      // New plan starts during existing plan
      { startDate: { $lte: startDate }, endDate: { $gte: startDate } },
      // New plan ends during existing plan  
      { startDate: { $lte: endDate }, endDate: { $gte: endDate } },
      // New plan completely contains existing plan
      { startDate: { $gte: startDate }, endDate: { $lte: endDate } },
      // Existing plan completely contains new plan
      { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
    ]
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return this.find(query);
};

// Add checkConflicts static method
WorkoutPlanSchema.statics.checkConflicts = async function(
  workoutPlanId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  startDate?: Date,
  endDate?: Date
) {  // If no date range provided, get the plan's date range
  let planStartDate = startDate;
  let planEndDate = endDate;
  
  if (!planStartDate || !planEndDate) {
    const plan = await this.findById(workoutPlanId);
    if (!plan) return [];
    planStartDate = plan.startDate;
    planEndDate = plan.endDate;
  }
  
  // Only check conflicts for dated plans
  if (!planStartDate || !planEndDate) return [];
  
  return await (this as any).findConflictingPlans(userId, planStartDate, planEndDate, workoutPlanId);
};

// Add resolveConflicts static method
WorkoutPlanSchema.statics.resolveConflicts = async function(
  workoutPlanId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  conflictIds: string[],
  resolution: 'replace' | 'keep_existing' | 'merge',
  startDate?: Date,
  endDate?: Date
) {
  if (resolution === 'replace') {
    // Deactivate conflicting plans
    await this.updateMany(
      { 
        _id: { $in: conflictIds.map(id => new mongoose.Types.ObjectId(id)) },
        userId 
      },
      { isActive: false, updatedAt: new Date() }
    );
    
    return { resolved: conflictIds.length, method: 'deactivated' };
  } else if (resolution === 'keep_existing') {
    // Keep existing plans, don't activate the new one
    await this.findByIdAndUpdate(
      workoutPlanId,
      { isActive: false, updatedAt: new Date() }
    );
    
    return { resolved: 1, method: 'new_plan_deactivated' };
  } else if (resolution === 'merge') {
    // For now, merge is not implemented - just return info
    return { resolved: 0, method: 'merge_not_implemented' };
  }
  
  return { resolved: 0, method: 'unknown' };
};

const WorkoutPlan = (mongoose.models.WorkoutPlan || 
  mongoose.model<WorkoutPlanDocument>('WorkoutPlan', WorkoutPlanSchema)) as Model<WorkoutPlanDocument> & {
  findConflictingPlans: (
    userId: mongoose.Types.ObjectId,
    startDate: Date,
    endDate: Date,
    excludeId?: mongoose.Types.ObjectId
  ) => Promise<WorkoutPlanDocument[]>;
  checkConflicts: (
    workoutPlanId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    startDate?: Date,
    endDate?: Date
  ) => Promise<WorkoutPlanDocument[]>;
  resolveConflicts: (
    workoutPlanId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    conflictIds: string[],
    resolution: 'replace' | 'keep_existing' | 'merge',
    startDate?: Date,
    endDate?: Date
  ) => Promise<{ resolved: number; method: string }>;
};

export default WorkoutPlan;
