import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserDocument } from './user';
import { ExerciseDocument } from './exercise';
import { CategoryDocument } from './category';

export interface ScheduledExerciseDocument extends Document {
  userId: mongoose.Types.ObjectId;
  exerciseId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  workoutPlanId?: mongoose.Types.ObjectId; // Optional reference to workout plan
  date: string;
  sets: number;
  reps: number;
  weight: number;
  weightPlates?: Record<string, number>;
  orderIndex?: number; // Add order field for maintaining exercise order
  notes?: string; // Add notes field
  completed?: boolean; // Add completed field
  completedAt?: Date; // Add completion timestamp
  isManual?: boolean; // Indicates if exercise was manually added (not from workout plan)
  isTemporaryChange?: boolean; // Indicates if this is a temporary override of the workout plan
  isHidden?: boolean; // Indicates if this exercise should be hidden (used for template overrides)
  // Generation tracking fields
  generatedAt?: Date; // When this exercise was generated from a template
  modifiedByUser?: boolean; // Whether the user has modified this scheduled exercise
  generationBatchId?: string; // ID to group exercises generated in the same batch
  createdAt: Date;
  updatedAt: Date;
}

const ScheduledExerciseSchema = new Schema<ScheduledExerciseDocument>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true,
    },
    exerciseId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Exercise',
      required: true 
    },
    categoryId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Category',
      required: true 
    },    workoutPlanId: {
      type: Schema.Types.ObjectId,
      ref: 'WorkoutPlan',
    },
    date: { 
      type: String, 
      required: true 
    },
    sets: { 
      type: Number, 
      default: 3,
      required: true 
    },
    reps: { 
      type: Number, 
      default: 10,
      required: true
    },
    weight: { 
      type: Number, 
      default: 0,
      required: true 
    },
    orderIndex: {
      type: Number,
      default: 0,
    },
    weightPlates: { 
      type: Object,
      default: {},
    },
    notes: {
      type: String,
      default: '',
    },    completed: {
      type: Boolean,
      default: false,
    },    completedAt: {
      type: Date,
    },
    isManual: {
      type: Boolean,
      default: true, // Default to manual for backward compatibility
      index: true,
    },    isTemporaryChange: {
      type: Boolean,
      default: false,
      index: true,
    },
    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Generation tracking fields
    generatedAt: {
      type: Date,
    },
    modifiedByUser: {
      type: Boolean,
      default: false,
      index: true,
    },
    generationBatchId: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'scheduledExercises',
  }
);

// Performance Indexes - Critical for fitness tracker queries
ScheduledExerciseSchema.index({ userId: 1, date: 1 }); // User's exercises by date (most common query)
ScheduledExerciseSchema.index({ userId: 1, completed: 1 }); // User's completion status
ScheduledExerciseSchema.index({ userId: 1, date: -1 }); // User's recent exercises (descending date)
ScheduledExerciseSchema.index({ userId: 1, exerciseId: 1, date: 1 }); // Specific exercise history
ScheduledExerciseSchema.index({ userId: 1, categoryId: 1, date: 1 }); // Category-based workout history
ScheduledExerciseSchema.index({ date: 1, completed: 1 }); // Global completion tracking
ScheduledExerciseSchema.index({ completedAt: 1 }, { sparse: true }); // Completion timestamps (sparse for null values)
ScheduledExerciseSchema.index({ exerciseId: 1 }); // Exercise-based queries
ScheduledExerciseSchema.index({ categoryId: 1 }); // Category-based queries
ScheduledExerciseSchema.index({ userId: 1, workoutPlanId: 1, date: 1 }); // Workout plan exercises by date
ScheduledExerciseSchema.index({ workoutPlanId: 1 }, { sparse: true }); // Workout plan exercise queries
ScheduledExerciseSchema.index({ userId: 1, isManual: 1, date: 1 }); // Manual vs plan-based exercises
ScheduledExerciseSchema.index({ userId: 1, isTemporaryChange: 1, date: 1 }); // Temporary changes tracking

const ScheduledExercise = (mongoose.models.ScheduledExercise || 
  mongoose.model<ScheduledExerciseDocument>('ScheduledExercise', ScheduledExerciseSchema)) as Model<ScheduledExerciseDocument>;

export default ScheduledExercise;
