import bcrypt from 'bcrypt';
import User, { UserDocument } from '../../models/user';
import { UserResponse } from '@/lib/types';
import connectToMongoDB from '@/lib/mongodb';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'user' | 'admin';
  image?: string;
}

// Helper function to convert mongoose document to response object
const formatUserResponse = (user: UserDocument): UserResponse => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  image: user.image,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const createUser = async (userData: CreateUserData): Promise<UserResponse> => {
  try {
    await connectToMongoDB();
    
    // Check if user with email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Create new user with hashed password
    const newUser = await User.create({
      ...userData,
      password: hashedPassword,
    });
    
    return formatUserResponse(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<UserResponse | null> => {
  try {
    await connectToMongoDB();
    
    const user = await User.findById(userId);
    if (!user) return null;
    
    return formatUserResponse(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const getUserByEmail = async (email: string): Promise<UserResponse | null> => {
  try {
    await connectToMongoDB();
    
    const user = await User.findOne({ email });
    if (!user) return null;
    
    return formatUserResponse(user);
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, updateData: UpdateUserData): Promise<UserResponse | null> => {
  try {
    await connectToMongoDB();
    
    // If password is being updated, hash it
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );
    
    if (!updatedUser) return null;
    
    return formatUserResponse(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    await connectToMongoDB();
    
    const result = await User.findByIdAndDelete(userId);
    return !!result;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const validateCredentials = async (email: string, password: string): Promise<UserResponse | null> => {
  try {
    await connectToMongoDB();
    
    const user = await User.findOne({ email });
    if (!user || !user.password) return null;
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;
    
    return formatUserResponse(user);
  } catch (error) {
    console.error('Error validating credentials:', error);
    throw error;
  }
};
