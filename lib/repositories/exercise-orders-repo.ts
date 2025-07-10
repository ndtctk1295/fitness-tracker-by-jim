import  connectToMongoDB  from '@/lib/mongodb';
import ExerciseOrder, { ExerciseOrderDocument } from '@/lib/models/exercise-order';
import mongoose from 'mongoose';

class ExerciseOrdersRepository {
  /**
   * Find exercise order by date for a specific user
   */
  async findByDate(userId: string, date: string): Promise<ExerciseOrderDocument | null> {
    try {
      await connectToMongoDB();
      return await ExerciseOrder.findOne({ userId, date });
    } catch (error) {
      console.error('Error in ExerciseOrdersRepository.findByDate:', error);
      throw error;
    }
  }

  /**
   * Find exercise orders within a date range for a user
   */
  async findByDateRange(userId: string, startDate: string, endDate: string): Promise<ExerciseOrderDocument[]> {
    try {
      await connectToMongoDB();
      return await ExerciseOrder.find({
        userId,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 });
    } catch (error) {
      console.error('Error in ExerciseOrdersRepository.findByDateRange:', error);
      throw error;
    }
  }

  /**
   * Create or update an exercise order for a specific date
   */  async createOrUpdate(userId: string, date: string, orderedExerciseIds: string[]): Promise<ExerciseOrderDocument | null> {
    try {
      await connectToMongoDB();
      
      const update = {
        userId,
        date,
        orderedExerciseIds
      };

      const options = { 
        new: true, 
        upsert: true, 
        setDefaultsOnInsert: true 
      };

      return await ExerciseOrder.findOneAndUpdate(
        { userId, date },
        update,
        options
      );
    } catch (error) {
      console.error('Error in ExerciseOrdersRepository.createOrUpdate:', error);
      throw error;
    }
  }

  /**
   * Delete an exercise order for a specific date
   */
  async delete(userId: string, date: string): Promise<boolean> {
    try {
      await connectToMongoDB();
      const result = await ExerciseOrder.deleteOne({ userId, date });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error in ExerciseOrdersRepository.delete:', error);
      throw error;
    }
  }

  /**
   * Delete all exercise orders for a user
   */
  async deleteAllForUser(userId: string): Promise<number> {
    try {
      await connectToMongoDB();
      const result = await ExerciseOrder.deleteMany({ userId });
      return result.deletedCount;
    } catch (error) {
      console.error('Error in ExerciseOrdersRepository.deleteAllForUser:', error);
      throw error;
    }
  }
}

const exerciseOrdersRepo = new ExerciseOrdersRepository();
export default exerciseOrdersRepo;
