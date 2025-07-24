// import { connectToMongoDB } from '@/lib/mongodb';
import connectToMongoDB from '@/lib/mongodb';
import User, { UserDocument } from '@/lib/models/user';
import { UserResponse } from '@/lib/types';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
  image?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'user' | 'admin';
  image?: string;
}

class UsersRepository {
  /**
   * Format user document to response object without sensitive data
   */
  formatUserResponse(user: UserDocument): UserResponse {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role as 'user' | 'admin',
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
  /**
   * Find all users - Optimized with lean queries
   */
  async findAll(): Promise<UserDocument[]> {
    try {
      await connectToMongoDB();
      return await User
        .find()
        .select('_id name email role image createdAt updatedAt')
        .lean()
        .sort({ name: 1 })
        .exec();
    } catch (error) {
      console.error('Error in UsersRepository.findAll:', error);
      throw error;
    }
  }

  /**
   * Find user by ID - Optimized
   */
  async findById(id: string): Promise<UserDocument | null> {
    try {
      await connectToMongoDB();

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      return await User
        .findById(id)
        .select('_id name email role image createdAt updatedAt')
        .lean()
        .exec();
    } catch (error) {
      console.error('Error in UsersRepository.findById:', error);
      throw error;
    }
  }

  /**
   * Find user by email - Optimized for authentication
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    try {
      await connectToMongoDB();
      return await User
        .findOne({ email })
        .lean()
        .exec();
    } catch (error) {
      console.error('Error in UsersRepository.findByEmail:', error);
      throw error;
    }
  }

  /**
   * Find users by role - Optimized with projections
   */
  async findByRole(role: 'user' | 'admin'): Promise<UserDocument[]> {
    try {
      await connectToMongoDB();
      return await User
        .find({ role })
        .select('_id name email role image createdAt')
        .lean()
        .sort({ name: 1 })
        .exec();
    } catch (error) {
      console.error('Error in UsersRepository.findByRole:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async create(userData: CreateUserData): Promise<UserDocument> {
    try {
      await connectToMongoDB();
      // if (await User.findOne({ email: userData.email })) {
      //   throw 'Email "' + userData.email + '" is already taken';
      // }
      // Hash the password
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        userData.password = hashedPassword;
      }
      
      return await User.create(userData);
    } catch (error) {
      console.error('Error in UsersRepository.create:', error);
      throw error;
    }
  }
  /**
   * Update an existing user - Optimized
   */
  async update(id: string, updateData: UpdateUserData): Promise<UserDocument | null> {
    try {
      await connectToMongoDB();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }
      
      // Hash the password if it's being updated
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      }
      
      return await User
        .findByIdAndUpdate(id, { $set: updateData }, { 
          new: true, 
          runValidators: true,
          lean: true 
        })
        .select('_id name email role image createdAt updatedAt')
        .exec();
    } catch (error) {
      console.error('Error in UsersRepository.update:', error);
      throw error;
    }
  }

  /**
   * Validate user credentials - Optimized for authentication
   */
  async validateCredentials(email: string, password: string): Promise<UserDocument | null> {
    try {
      await connectToMongoDB();
      const user = await User
        .findOne({ email })
        .select('_id name email role image password createdAt updatedAt')
        .exec(); // Don't use lean() here as we need the full document
      
      if (!user || !user.password) return null;
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return null;
      
      return user;
    } catch (error) {
      console.error('Error in UsersRepository.validateCredentials:', error);
      throw error;
    }
  }

  /**
   * Change user password after verifying current password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<UserDocument | null> {
    try {
      await connectToMongoDB();
      
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return null;
      }
      
      // Get user with password
      const user = await User.findById(userId);
      if (!user || !user.password) return null;
      
      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) return null;
      
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update the password
      user.password = hashedPassword;
      await user.save();
      
      return user;
    } catch (error) {
      console.error('Error in UsersRepository.changePassword:', error);
      throw error;
    }
  }
  /**
   * Delete a user
   */
  async delete(id: string): Promise<boolean> {
    try {
      await connectToMongoDB();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return false;
      }
      
      const result = await User.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error in UsersRepository.delete:', error);
      throw error;
    }
  }
}

const usersRepo = new UsersRepository();
export default usersRepo;
