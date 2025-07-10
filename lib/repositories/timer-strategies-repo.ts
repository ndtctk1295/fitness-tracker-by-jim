import connectToMongoDB from '@/lib/mongodb';
import TimerStrategy, { TimerStrategyDocument } from '@/lib/models/timer-strategy';
import mongoose from 'mongoose';
import { UserDocument } from '../models/user';

/**
 * Repository for TimerStrategy entity operations
 */
class TimerStrategiesRepository {
  /**
   * Get all timer strategies (admin only)
   */
  async findAll(
    sort: Record<string, 1 | -1> = { createdAt: -1 }
  ): Promise<TimerStrategyDocument[]> {
    try {
      await connectToMongoDB();
      return await TimerStrategy.find().sort(sort);
    } catch (error) {
      console.error('Error in TimerStrategiesRepository.findAll:', error);
      throw error;
    }
  }

  /**
   * Get all timer strategies for a specific user
   */
  async findAllByUserId(
    userId: string | UserDocument['_id'], 
    sort: Record<string, 1 | -1> = { name: 1 }
  ): Promise<TimerStrategyDocument[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId.toString())) {
        throw new Error('Invalid user ID format');
      }
      
      await connectToMongoDB();
      return await TimerStrategy.find({ userId }).sort(sort);
    } catch (error) {
      console.error(`Error in TimerStrategiesRepository.findAllByUserId(${userId}):`, error);
      throw error;
    }
  }

  /**
   * Get a timer strategy by ID
   */
  async findById(id: string): Promise<TimerStrategyDocument | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid timer strategy ID format');
      }
      
      await connectToMongoDB();
      return await TimerStrategy.findById(id);
    } catch (error) {
      console.error(`Error in TimerStrategiesRepository.findById(${id}):`, error);
      throw error;
    }
  }

  /**
   * Create a new timer strategy
   */
  async create(data: {
    userId: UserDocument['_id'] | string;
    name: string;
    color: string;
    restDuration: number;
    activeDuration: number;
  }): Promise<TimerStrategyDocument> {
    try {
      await connectToMongoDB();
      
      const timerStrategy = new TimerStrategy(data);
      await timerStrategy.save();
      
      return timerStrategy;
    } catch (error) {
      console.error('Error in TimerStrategiesRepository.create:', error);
      throw error;
    }
  }

  /**
   * Update an existing timer strategy
   */
  async update(
    id: string, 
    data: {
      name?: string;
      color?: string;
      restDuration?: number;
      activeDuration?: number;
    }
  ): Promise<TimerStrategyDocument | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid timer strategy ID format');
      }
      
      await connectToMongoDB();
      
      return await TimerStrategy.findByIdAndUpdate(
        id,
        { ...data },
        { new: true, runValidators: true }
      );
    } catch (error) {
      console.error(`Error in TimerStrategiesRepository.update(${id}):`, error);
      throw error;
    }
  }

  /**
   * Delete a timer strategy by ID
   */
  async delete(id: string): Promise<TimerStrategyDocument | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid timer strategy ID format');
      }
      
      await connectToMongoDB();
      return await TimerStrategy.findByIdAndDelete(id);
    } catch (error) {
      console.error(`Error in TimerStrategiesRepository.delete(${id}):`, error);
      throw error;
    }
  }
}

// Export singleton instance
const timerStrategiesRepo = new TimerStrategiesRepository();
export default timerStrategiesRepo;
