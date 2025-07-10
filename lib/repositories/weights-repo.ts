import connectToMongoDB from '@/lib/mongodb';
import WeightPlate, { WeightPlateDocument } from '@/lib/models/weight-plate';
import mongoose from 'mongoose';
import { UserDocument } from '../models/user';

/**
 * Repository for WeightPlate entity operations
 */
class WeightsRepository {
  /**
   * Get all weight plates (admin only)
   */
  async findAll(
    sort: Record<string, 1 | -1> = { createdAt: -1 }
  ): Promise<WeightPlateDocument[]> {
    try {
      await connectToMongoDB();
      return await WeightPlate.find().sort(sort);
    } catch (error) {
      console.error('Error in WeightsRepository.findAll:', error);
      throw error;
    }
  }

  /**
   * Get all weight plates for a specific user
   */
  async findAllByUserId(
    userId: string | UserDocument['_id'], 
    sort: Record<string, 1 | -1> = { value: 1 }
  ): Promise<WeightPlateDocument[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId.toString())) {
        throw new Error('Invalid user ID format');
      }
      
      await connectToMongoDB();
      return await WeightPlate.find({ userId }).sort(sort);
    } catch (error) {
      console.error(`Error in WeightsRepository.findAllByUserId(${userId}):`, error);
      throw error;
    }
  }

  /**
   * Get a weight plate by ID
   */
  async findById(id: string): Promise<WeightPlateDocument | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid weight plate ID format');
      }
      
      await connectToMongoDB();
      return await WeightPlate.findById(id);
    } catch (error) {
      console.error(`Error in WeightsRepository.findById(${id}):`, error);
      throw error;
    }
  }

  /**
   * Create a new weight plate
   */
  async create(data: {
    userId: UserDocument['_id'] | string;
    value: number;
    color: string;
  }): Promise<WeightPlateDocument> {
    try {
      await connectToMongoDB();
      
      const weightPlate = new WeightPlate(data);
      await weightPlate.save();
      
      return weightPlate;
    } catch (error) {
      console.error('Error in WeightsRepository.create:', error);
      throw error;
    }
  }

  /**
   * Update an existing weight plate
   */
  async update(
    id: string, 
    data: {
      value?: number;
      color?: string;
    }
  ): Promise<WeightPlateDocument | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid weight plate ID format');
      }
      
      await connectToMongoDB();
      
      return await WeightPlate.findByIdAndUpdate(
        id,
        { ...data },
        { new: true, runValidators: true }
      );
    } catch (error) {
      console.error(`Error in WeightsRepository.update(${id}):`, error);
      throw error;
    }
  }

  /**
   * Delete a weight plate by ID
   */
  async delete(id: string): Promise<WeightPlateDocument | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid weight plate ID format');
      }
      
      await connectToMongoDB();
      return await WeightPlate.findByIdAndDelete(id);
    } catch (error) {
      console.error(`Error in WeightsRepository.delete(${id}):`, error);
      throw error;
    }
  }
}

// Export singleton instance
const weightsRepo = new WeightsRepository();
export default weightsRepo;
