import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserDocument } from './user';

export interface WeightPlateDocument extends Document {
  userId: mongoose.Types.ObjectId;
  value: number;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const WeightPlateSchema = new Schema<WeightPlateDocument>(
  {    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true,
    },
    value: { 
      type: Number, 
      required: true 
    },
    color: { 
      type: String, 
      required: true 
    }
  },
  {
    timestamps: true,
    collection: 'weightPlates',
  }
);

// Performance Indexes
WeightPlateSchema.index({ userId: 1 }); // Index for user's weight plates
WeightPlateSchema.index({ userId: 1, value: 1 }); // Compound index for user's plates by value
WeightPlateSchema.index({ value: 1 }); // Index for value-based queries

const WeightPlate = (mongoose.models.WeightPlate || 
  mongoose.model<WeightPlateDocument>('WeightPlate', WeightPlateSchema)) as Model<WeightPlateDocument>;

export default WeightPlate;
