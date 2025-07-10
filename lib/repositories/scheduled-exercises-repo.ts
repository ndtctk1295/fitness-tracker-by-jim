import connectToMongoDB from '@/lib/mongodb';
import ScheduledExercise, { ScheduledExerciseDocument } from '@/lib/models/scheduled-exercise';
import mongoose from 'mongoose';
import { UserDocument } from '../models/user';
import { ExerciseDocument } from '../models/exercise';
import { CategoryDocument } from '../models/category';
import User from '../models/user';

/**
 * Optimized Repository for ScheduledExercise entity operations
 */
class ScheduledExercisesRepository {
  /**
   * Get all scheduled exercises (admin only) - Optimized with lean queries
   */
  async findAll(
    sort: Record<string, 1 | -1> = { date: -1, createdAt: -1 }
  ): Promise<ScheduledExerciseDocument[]> {
    try {
      await connectToMongoDB();
      return await ScheduledExercise
        .find()
        .lean() // Return plain objects for better performance
        .sort(sort)
        .exec();
    } catch (error) {
      console.error('Error in ScheduledExercisesRepository.findAll:', error);
      throw error;
    }
  }

  /**
   * Get all scheduled exercises by user - Optimized for performance
   */
  async findAllByUser(userId: string): Promise<ScheduledExerciseDocument[]> {
    try {
      await connectToMongoDB();
      return await ScheduledExercise
        .find({ userId })
        .select('userId exerciseId categoryId workoutPlanId date sets reps weight orderIndex notes completed completedAt weightPlates createdAt updatedAt')
        .lean()
        .sort({ date: -1, orderIndex: 1 }) // Most recent first, then by order
        .exec();
    } catch (error) {
      console.error('Error in ScheduledExercisesRepository.findAllByUser:', error);
      throw error;
    }
  }

  /**
   * Get exercises by user and date - Highly optimized for daily views
   */
  async findByUserAndDate(userId: string, date: string): Promise<ScheduledExerciseDocument[]> {
    try {
      await connectToMongoDB();
      return await ScheduledExercise
        .find({ userId, date })
        .select('userId exerciseId categoryId workoutPlanId date sets reps weight orderIndex notes completed completedAt weightPlates')
        .lean()
        .sort({ orderIndex: 1, createdAt: 1 })
        .exec();
    } catch (error) {
      console.error('Error in ScheduledExercisesRepository.findByUserAndDate:', error);
      throw error;
    }
  }

  /**
   * Get exercises by user and date range - Optimized for history views
   */
  async findByUserAndDateRange(userId: string, startDate: string, endDate: string): Promise<ScheduledExerciseDocument[]> {
    try {
      await connectToMongoDB();
      return await ScheduledExercise
        .find({
          userId,
          date: { $gte: startDate, $lte: endDate }
        })
        .select('userId exerciseId categoryId workoutPlanId date sets reps weight completed completedAt')
        .lean()
        .sort({ date: -1 })
        .exec();
    } catch (error) {
      console.error('Error in ScheduledExercisesRepository.findByUserAndDateRange:', error);
      throw error;
    }
  }

  /**
   * Get completed exercises by user - Optimized for progress tracking
   */
  async findCompletedByUser(userId: string, limit: number = 50): Promise<ScheduledExerciseDocument[]> {
    try {
      await connectToMongoDB();
      return await ScheduledExercise
        .find({ userId, completed: true })
        .select('exerciseId categoryId workoutPlanId date sets reps weight completedAt')
        .lean()
        .sort({ completedAt: -1 })
        .limit(limit)
        .exec();
    } catch (error) {
      console.error('Error in ScheduledExercisesRepository.findCompletedByUser:', error);
      throw error;
    }
  }  /**
   * Get all scheduled exercises with user data (admin only) - Optimized
   */
  async findAllWithUserData(): Promise<any[]> {
    try {
      await connectToMongoDB();
      const exercises = await ScheduledExercise
        .find()
        .select('userId exerciseId categoryId workoutPlanId date sets reps weight completed completedAt createdAt')
        .lean()
        .sort({ date: -1 })
        .exec();
      
      // Get unique user IDs
      const uniqueUserIds = [...new Set(exercises.map(exercise => exercise.userId.toString()))];
      
      // Fetch users in a single optimized query
      const users = await User
        .find({ _id: { $in: uniqueUserIds } })
        .select('_id name')
        .lean()
        .exec();
        
      const userMap = users.reduce((acc, user) => {
        acc[user._id.toString()] = user.name;
        return acc;
      }, {} as Record<string, string>);
      
      // Add userName to each exercise
      return exercises.map(exercise => ({
        ...exercise,
        userName: userMap[exercise.userId.toString()] || 'Unknown User'
      }));
    } catch (error) {      console.error('Error in ScheduledExercisesRepository.findAllWithUserData:', error);
      throw error;
    }
  }

  /**
   * Get a scheduled exercise by ID - Optimized
   */
  async findById(id: string): Promise<ScheduledExerciseDocument | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid scheduled exercise ID format');
      }
      
      await connectToMongoDB();
      return await ScheduledExercise
        .findById(id)
        .lean()
        .exec();
    } catch (error) {
      console.error(`Error in ScheduledExercisesRepository.findById(${id}):`, error);
      throw error;
    }
  }

  /**
   * Get a specific scheduled exercise with user data (admin only)
   */
  async findByIdWithUserData(id: string): Promise<any> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid scheduled exercise ID format');
      }
      
      await connectToMongoDB();
      const exercise = await ScheduledExercise.findById(id);
      
      if (!exercise) {
        return null;
      }
      
      // Get user information
      const user = await User.findById(exercise.userId);
      
      // Return exercise with user data
      const plainExercise = exercise.toObject();
      return {
        ...plainExercise,
        userName: user?.name || 'Unknown User'
      };
    } catch (error) {
      console.error(`Error in ScheduledExercisesRepository.findByIdWithUserData(${id}):`, error);
      throw error;
    }
  }  /**
   * Create a new scheduled exercise
   */  async create(data: {
    userId: UserDocument['_id'] | string;
    exerciseId: ExerciseDocument['_id'] | string;
    categoryId: CategoryDocument['_id'] | string;
    workoutPlanId?: string;
    date: string;
    sets: number;
    reps: number;
    weight: number;
    weightPlates?: Record<string, number>;
    orderIndex?: number;
    notes?: string;
    completed?: boolean;
  }): Promise<ScheduledExerciseDocument> {
    try {      
      await connectToMongoDB();      // Create a formatted data object with copying basic fields
      const formattedData: Record<string, any> = {
        date: data.date,
        sets: data.sets,
        reps: data.reps,
        weight: data.weight,
        orderIndex: data.orderIndex,
        notes: data.notes || '',
        completed: data.completed || false,
      };
      
      // Process userId
      if (typeof data.userId === 'string') {
        if (mongoose.Types.ObjectId.isValid(data.userId)) {
          formattedData.userId = new mongoose.Types.ObjectId(data.userId);
        } else {
          throw new Error(`Invalid userId format: ${data.userId}`);
        }
      } else {
        formattedData.userId = data.userId;
      }
      
      // Process exerciseId
      if (typeof data.exerciseId === 'string') {
        if (mongoose.Types.ObjectId.isValid(data.exerciseId)) {
          formattedData.exerciseId = new mongoose.Types.ObjectId(data.exerciseId);
        } else {
          throw new Error(`Invalid exerciseId format: ${data.exerciseId}`);
        }
      } else {
        formattedData.exerciseId = data.exerciseId;
      }
      
      // Process categoryId
      if (typeof data.categoryId === 'string') {
        if (mongoose.Types.ObjectId.isValid(data.categoryId)) {
          formattedData.categoryId = new mongoose.Types.ObjectId(data.categoryId);
        } else {
          throw new Error(`Invalid categoryId format: ${data.categoryId}`);
        }      } else {
        formattedData.categoryId = data.categoryId;
      }

      // Process workoutPlanId
      if (data.workoutPlanId) {
        if (mongoose.Types.ObjectId.isValid(data.workoutPlanId)) {
          formattedData.workoutPlanId = new mongoose.Types.ObjectId(data.workoutPlanId);
          formattedData.isManual = false; // This is from a workout plan
        } else {
          throw new Error(`Invalid workoutPlanId format: ${data.workoutPlanId}`);
        }
      } else {
        formattedData.isManual = true; // This is a manual exercise
      }

      // Store weightPlates directly as an object
      if (data.weightPlates) {
        // If it's a Map, convert to object
        if (data.weightPlates instanceof Map) {
          const plainObject: Record<string, number> = {};
          data.weightPlates.forEach((value, key) => {
            plainObject[key] = value;
          });
          formattedData.weightPlates = plainObject;
        } else {
          // Already an object
          formattedData.weightPlates = data.weightPlates;
        }
      }
      
      const scheduledExercise = new ScheduledExercise(formattedData);
      await scheduledExercise.save();
      
      return scheduledExercise;
    } catch (error) {
      console.error('Error in ScheduledExercisesRepository.create:', error);
      throw error;
    }
  }  /**
   * Update an existing scheduled exercise - Optimized
   */
  async update(
    id: string, 
    data: {
      userId?: string | mongoose.Types.ObjectId;
      exerciseId?: string | mongoose.Types.ObjectId;
      categoryId?: string | mongoose.Types.ObjectId;
      date?: string;
      sets?: number;
      reps?: number;
      weight?: number;
      weightPlates?: Record<string, number>;
      orderIndex?: number;
      notes?: string;
      completed?: boolean;
      completedAt?: string | Date;
    }
  ): Promise<ScheduledExerciseDocument | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid scheduled exercise ID format');
      }
      
      await connectToMongoDB();
      
      // Prepare optimized update data
      const updateData: Record<string, any> = {};
      
      // Handle ObjectId fields with proper validation
      if (data.userId !== undefined) {
        updateData.userId = typeof data.userId === 'string' 
          ? new mongoose.Types.ObjectId(data.userId) 
          : data.userId;
      }
      
      if (data.exerciseId !== undefined) {
        updateData.exerciseId = typeof data.exerciseId === 'string' 
          ? new mongoose.Types.ObjectId(data.exerciseId) 
          : data.exerciseId;
      }
      
      if (data.categoryId !== undefined) {
        updateData.categoryId = typeof data.categoryId === 'string' 
          ? new mongoose.Types.ObjectId(data.categoryId) 
          : data.categoryId;
      }
      
      // Handle primitive fields efficiently
      const primitiveFields = ['date', 'sets', 'reps', 'weight', 'orderIndex', 'notes', 'completed'];
      primitiveFields.forEach(field => {
        if (data[field as keyof typeof data] !== undefined) {
          updateData[field] = data[field as keyof typeof data];
        }
      });
      
      // Handle completedAt with proper date conversion
      if (data.completedAt !== undefined) {
        updateData.completedAt = data.completedAt === null 
          ? null 
          : typeof data.completedAt === 'string' 
            ? new Date(data.completedAt) 
            : data.completedAt;
      }
      
      // Handle weightPlates efficiently
      if (data.weightPlates !== undefined) {
        updateData.weightPlates = data.weightPlates instanceof Map
          ? Object.fromEntries(data.weightPlates)
          : data.weightPlates;
      }
      
      // Use lean() for better performance and return updated document
      return await ScheduledExercise
        .findByIdAndUpdate(id, updateData, { 
          new: true, 
          runValidators: true,
          lean: true 
        })
        .exec();
    } catch (error) {
      console.error(`Error in ScheduledExercisesRepository.update(${id}):`, error);
      throw error;
    }
  }

  /**
   * Get user statistics with analytics aggregation - Optimized for dashboards
   */
  async getUserStats(userId: string, days: number = 30): Promise<{
    totalExercises: number;
    completedExercises: number;
    completionRate: number;
    totalVolume: number;
    averageWeight: number;
    exercisesByCategory: Array<{ _id: string; count: number; }>;
    recentActivity: Array<{ date: string; completed: number; total: number; }>;
  }> {
    try {
      await connectToMongoDB();
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const dateFilter = startDate.toISOString().split('T')[0];
      
      // Run aggregation pipeline for comprehensive stats
      const [statsResult] = await ScheduledExercise.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: dateFilter }
          }
        },
        {
          $facet: {
            // Basic counts and completion stats
            overview: [
              {
                $group: {
                  _id: null,
                  totalExercises: { $sum: 1 },
                  completedExercises: { $sum: { $cond: ['$completed', 1, 0] } },
                  totalVolume: { $sum: { $multiply: ['$sets', '$reps', '$weight'] } },
                  totalWeight: { $sum: '$weight' },
                  weightCount: { $sum: { $cond: [{ $gt: ['$weight', 0] }, 1, 0] } }
                }
              }
            ],
            
            // Exercises grouped by category
            byCategory: [
              {
                $group: {
                  _id: '$categoryId',
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } }
            ],
            
            // Daily activity for recent days
            dailyActivity: [
              {
                $group: {
                  _id: '$date',
                  completed: { $sum: { $cond: ['$completed', 1, 0] } },
                  total: { $sum: 1 }
                }
              },
              { $sort: { _id: -1 } },
              { $limit: 7 }
            ]
          }
        }
      ]);
      
      const overview = statsResult.overview[0] || {
        totalExercises: 0,
        completedExercises: 0,
        totalVolume: 0,
        totalWeight: 0,
        weightCount: 0
      };
      
      const completionRate = overview.totalExercises > 0 
        ? Math.round((overview.completedExercises / overview.totalExercises) * 100) 
        : 0;
        
      const averageWeight = overview.weightCount > 0 
        ? Math.round(overview.totalWeight / overview.weightCount) 
        : 0;
      
      return {
        totalExercises: overview.totalExercises,
        completedExercises: overview.completedExercises,
        completionRate,
        totalVolume: overview.totalVolume,
        averageWeight,
        exercisesByCategory: statsResult.byCategory || [],
        recentActivity: (statsResult.dailyActivity || []).map((day: any) => ({
          date: day._id,
          completed: day.completed,
          total: day.total
        }))
      };
    } catch (error) {
      console.error(`Error in ScheduledExercisesRepository.getUserStats(${userId}):`, error);
      throw error;
    }
  }

  /**
   * Delete a scheduled exercise by ID
   */
  async delete(id: string): Promise<ScheduledExerciseDocument | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid scheduled exercise ID format');
      }
      
      await connectToMongoDB();
      return await ScheduledExercise.findByIdAndDelete(id);
    } catch (error) {
      console.error(`Error in ScheduledExercisesRepository.delete(${id}):`, error);
      throw error;
    }
  }
  
  /**
   * Delete all scheduled exercises for a specific date and user
   */
  async deleteByUserAndDate(userId: string, date: string): Promise<number> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID format');
      }
      
      await connectToMongoDB();
      const result = await ScheduledExercise.deleteMany({ userId, date });
      
      return result.deletedCount || 0;
    } catch (error) {
      console.error(`Error in ScheduledExercisesRepository.deleteByUserAndDate(${userId}, ${date}):`, error);
      throw error;
    }
  }

  /**
   * Get a scheduled exercise by ID and user ID - Ensures user can only access their own exercises
   */
  async findByIdAndUser(id: string, userId: string): Promise<ScheduledExerciseDocument | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid ID format');
      }
      
      await connectToMongoDB();
      return await ScheduledExercise
        .findOne({
          _id: id,
          userId: new mongoose.Types.ObjectId(userId)
        })
        .lean()
        .exec();
    } catch (error) {
      console.error(`Error in ScheduledExercisesRepository.findByIdAndUser(${id}, ${userId}):`, error);
      throw error;
    }
  }

  /**
   * Update a scheduled exercise by ID, ensuring it belongs to the specified user
   */
  async updateByIdAndUser(
    id: string, 
    userId: string,
    data: {
      exerciseId?: string | mongoose.Types.ObjectId;
      categoryId?: string | mongoose.Types.ObjectId;
      date?: string;
      sets?: number;
      reps?: number;
      weight?: number;
      weightPlates?: Record<string, number>;
      orderIndex?: number;
      notes?: string;
      completed?: boolean;
      completedAt?: string | Date;
      isHidden?: boolean;
    }
  ): Promise<ScheduledExerciseDocument | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid ID format');
      }
      
      await connectToMongoDB();
      
      // Prepare optimized update data
      const updateData: Record<string, any> = {};
      
      // Handle ObjectId fields with proper validation
      if (data.exerciseId !== undefined) {
        updateData.exerciseId = typeof data.exerciseId === 'string' 
          ? new mongoose.Types.ObjectId(data.exerciseId) 
          : data.exerciseId;
      }
      
      if (data.categoryId !== undefined) {
        updateData.categoryId = typeof data.categoryId === 'string' 
          ? new mongoose.Types.ObjectId(data.categoryId) 
          : data.categoryId;
      }
      
      // Handle primitive fields efficiently
      const primitiveFields = ['date', 'sets', 'reps', 'weight', 'orderIndex', 'notes', 'completed', 'isHidden'];
      primitiveFields.forEach(field => {
        if (data[field as keyof typeof data] !== undefined) {
          updateData[field] = data[field as keyof typeof data];
        }
      });
      
      // Handle completedAt with proper date conversion
      if (data.completedAt !== undefined) {
        updateData.completedAt = data.completedAt === null 
          ? null 
          : typeof data.completedAt === 'string' 
            ? new Date(data.completedAt) 
            : data.completedAt;
      }
      
      // Handle weightPlates efficiently
      if (data.weightPlates !== undefined) {
        updateData.weightPlates = data.weightPlates instanceof Map
          ? Object.fromEntries(data.weightPlates)
          : data.weightPlates;
      }
      
      // Use lean() for better performance and return updated document
      // Only update if the document belongs to the specified user
      return await ScheduledExercise
        .findOneAndUpdate(
          { 
            _id: id, 
            userId: new mongoose.Types.ObjectId(userId) 
          }, 
          updateData, 
          { 
            new: true, 
            runValidators: true,
            lean: true 
          }
        )
        .exec();
    } catch (error) {
      console.error(`Error in ScheduledExercisesRepository.updateByIdAndUser(${id}, ${userId}):`, error);
      throw error;
    }
  }

  /**
   * Delete a scheduled exercise by ID, ensuring it belongs to the specified user
   */
  async deleteByIdAndUser(id: string, userId: string): Promise<boolean> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid ID format');
      }
      
      await connectToMongoDB();
      const result = await ScheduledExercise.deleteOne({
        _id: id,
        userId: new mongoose.Types.ObjectId(userId)
      });
      
      return result.deletedCount === 1;
    } catch (error) {
      console.error(`Error in ScheduledExercisesRepository.deleteByIdAndUser(${id}, ${userId}):`, error);
      throw error;
    }
  }
}

// Export singleton instance
const scheduledExercisesRepo = new ScheduledExercisesRepository();
export default scheduledExercisesRepo;
