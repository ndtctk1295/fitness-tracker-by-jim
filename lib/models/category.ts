import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserDocument } from './user';

export interface CategoryDocument extends Document {
  name: string;
  color: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<CategoryDocument>(
  {
    name: { 
      type: String, 
      required: true,
      trim: true,
    },
    color: { 
      type: String, 
      required: true,
      default: '#ef4444', // Default red color 
    },
    description: { 
      type: String,
      trim: true 
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
    collection: 'categories',
  }
);

// Performance Indexes
CategorySchema.index({ name: 1 }); // Index for category name searches
CategorySchema.index({ createdBy: 1 }); // Index for user's categories
CategorySchema.index({ createdBy: 1, name: 1 }); // Compound index for user's categories by name
CategorySchema.index({ color: 1 }); // Index for color-based queries

const Category = (mongoose.models.Category || 
  mongoose.model<CategoryDocument>('Category', CategorySchema)) as Model<CategoryDocument>;

export default Category;
