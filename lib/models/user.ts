import mongoose, { Schema, Document, Model } from 'mongoose';

export interface UserDocument extends Document {
  _id: string;
  name: string;
  email: string;
  password?: string;
  image?: string;
  emailVerified?: Date;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { 
      type: String, 
      required: true 
    },    email: { 
      type: String, 
      required: true
    },
    password: String,
    image: String,
    emailVerified: Date,
    role: { 
      type: String, 
      enum: ['user', 'admin'], 
      default: 'user',
      required: true 
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Performance Indexes
UserSchema.index({ email: 1 }, { unique: true }); // Unique index for email (login)
UserSchema.index({ role: 1 }); // Index for role-based queries
UserSchema.index({ createdAt: 1 }); // Index for date-based queries
UserSchema.index({ emailVerified: 1 }, { sparse: true }); // Sparse index for verified users

// Use existing model if it exists, otherwise create a new one
// This prevents model redefinition errors in development with hot reload
const User = (mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema)) as Model<UserDocument>;

export default User;
