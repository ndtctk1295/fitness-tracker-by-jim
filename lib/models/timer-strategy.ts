import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserDocument } from './user';

export interface TimerStrategyDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  color: string;
  restDuration: number;
  activeDuration: number;
  createdAt: Date;
  updatedAt: Date;
}

const TimerStrategySchema = new Schema<TimerStrategyDocument>(
  {    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true,
    },
    name: { 
      type: String, 
      required: true,
      trim: true,
    },
    color: { 
      type: String, 
      required: true,
      default: '#f59e0b', // Default amber color
    },
    restDuration: { 
      type: Number, 
      required: true,
      default: 90, // Default 90 seconds
    },
    activeDuration: { 
      type: Number, 
      required: true,
      default: 60, // Default 60 seconds
    },
  },
  {
    timestamps: true,
    collection: 'timerStrategies',  }
);

// Performance Indexes
TimerStrategySchema.index({ userId: 1 }); // Index for user's timer strategies
TimerStrategySchema.index({ userId: 1, name: 1 }); // Compound index for user's strategies by name

const TimerStrategy = (mongoose.models.TimerStrategy ||
  mongoose.model<TimerStrategyDocument>('TimerStrategy', TimerStrategySchema)) as Model<TimerStrategyDocument>;

export default TimerStrategy;
