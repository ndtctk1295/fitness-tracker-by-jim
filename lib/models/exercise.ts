import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserDocument } from './user';
import { CategoryDocument } from './category';

export interface ExerciseDocument extends Document {
  name: string;
  categoryId: mongoose.Types.ObjectId;
  description?: string;
  imageUrl?: string;
  // Admin-controlled fields
  isActive: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  muscleGroups: string[];
  equipment?: string[];
  instructions: string[];
  tips?: string[];
  createdBy: mongoose.Types.ObjectId; 
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new Schema<ExerciseDocument>(
  {
    name: { 
      type: String, 
      required: true,
      trim: true,
    },
    categoryId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Category',
      required: true 
    },
    description: { 
      type: String,
      trim: true 
    },
    imageUrl: { 
      type: String 
    },
    // Admin-controlled fields
    isActive: {
      type: Boolean,
      default: true,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
      required: true
    },
    muscleGroups: {
      type: [String],
      default: [],
      required: true
    },
    equipment: {
      type: [String],
      default: []
    },
    instructions: {
      type: [String],
      default: [],
      required: true
    },
    tips: {
      type: [String],
      default: []
    },
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    updatedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
  },
  {
    timestamps: true,
    collection: 'exercises',
  }
);

// Performance Indexes
ExerciseSchema.index({ name: 1 }); // Index for exercise name searches
ExerciseSchema.index({ categoryId: 1 }); // Index for category-based queries
ExerciseSchema.index({ createdBy: 1 }); // Index for user's exercises
ExerciseSchema.index({ createdBy: 1, categoryId: 1 }); // Compound index for user's exercises by category
ExerciseSchema.index({ createdBy: 1, name: 1 }); // Compound index for user's exercises by name
ExerciseSchema.index({ isActive: 1 }); // Index for active exercises
ExerciseSchema.index({ difficulty: 1 }); // Index for difficulty filtering
ExerciseSchema.index({ muscleGroups: 1 }); // Index for muscle group filtering
ExerciseSchema.index({ isActive: 1, difficulty: 1 }); // Compound index for active exercises by difficulty

const Exercise = (mongoose.models.Exercise || 
  mongoose.model<ExerciseDocument>('Exercise', ExerciseSchema)) as Model<ExerciseDocument>;

export default Exercise;
