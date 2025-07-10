import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserDocument } from './user';

export interface ExerciseOrderDocument extends Document {
  userId: mongoose.Types.ObjectId;
  date: string;
  orderedExerciseIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseOrderSchema = new Schema<ExerciseOrderDocument>(
  {    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true,
    },
    date: { 
      type: String, 
      required: true 
    },
    orderedExerciseIds: [{ 
      type: String, 
      required: true 
    }],
  },
  {
    timestamps: true,
    collection: 'exerciseOrders',
  }
);

// Create compound index for efficient querying by user and date
ExerciseOrderSchema.index({ userId: 1, date: 1 }, { unique: true });

const ExerciseOrder = (mongoose.models.ExerciseOrder || 
  mongoose.model<ExerciseOrderDocument>('ExerciseOrder', ExerciseOrderSchema)) as Model<ExerciseOrderDocument>;

export default ExerciseOrder;
