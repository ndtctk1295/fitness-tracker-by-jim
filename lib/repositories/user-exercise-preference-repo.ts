import connectToMongoDB from '@/lib/mongodb';
import UserExercisePreference, { UserExercisePreferenceDocument } from '@/lib/models/user-exercise-preference';
import mongoose from 'mongoose';

/**
 * Repository for UserExercisePreference entity operations
 */
class UserExercisePreferenceRepository {
  /**
   * Get all user exercise preferences with optional filtering
   */  async findByUserId(
    userId: string,
    options: {
      status?: 'favorite';
      sort?: Record<string, 1 | -1>;
      limit?: number;
    } = {}
  ): Promise<UserExercisePreferenceDocument[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID format');
      }

      await connectToMongoDB();
      
      const { status, sort = { addedAt: -1 }, limit } = options;
      const query: any = { userId: new mongoose.Types.ObjectId(userId) };
      
      if (status) {
        query.status = status;
      }

      let queryBuilder = UserExercisePreference
        .find(query)
        .populate('exerciseId', 'name description imageUrl difficulty muscleGroups equipment')
        .lean()
        .sort(sort);

      if (limit) {
        queryBuilder = queryBuilder.limit(limit);
      }

      return await queryBuilder.exec();
    } catch (error) {
      console.error('Error in UserExercisePreferenceRepository.findByUserId:', error);
      throw error;
    }
  }  /**
   * Get user's favorite exercises
   */
  async findFavoriteExercises(userId: string): Promise<UserExercisePreferenceDocument[]> {
    return this.findByUserId(userId, { status: 'favorite', sort: { addedAt: -1 } });
  }

  /**
   * Check if user has a specific exercise preference
   */
  async findByUserAndExercise(
    userId: string,
    exerciseId: string
  ): Promise<UserExercisePreferenceDocument | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(exerciseId)) {
        throw new Error('Invalid user ID or exercise ID format');
      }

      await connectToMongoDB();
      
      return await UserExercisePreference
        .findOne({
          userId: new mongoose.Types.ObjectId(userId),
          exerciseId: new mongoose.Types.ObjectId(exerciseId)
        })
        .populate('exerciseId', 'name description difficulty')
        .lean()
        .exec();
    } catch (error) {
      console.error('Error in UserExercisePreferenceRepository.findByUserAndExercise:', error);
      throw error;
    }
  }

  /**
   * Create a new user exercise preference
   */  async create(data: {
    userId: string;
    exerciseId: string;
    status: 'favorite';
    notes?: string;
    lastUsed?: Date;
    customSettings?: {
      defaultSets?: number;
      defaultReps?: number;
      defaultWeight?: number;
      restTime?: number;
      progressNotes?: string;
    };
  }): Promise<UserExercisePreferenceDocument> {
    try {
      if (!mongoose.Types.ObjectId.isValid(data.userId) || !mongoose.Types.ObjectId.isValid(data.exerciseId)) {
        throw new Error('Invalid user ID or exercise ID format');
      }

      await connectToMongoDB();

      const preference = new UserExercisePreference({
        userId: new mongoose.Types.ObjectId(data.userId),
        exerciseId: new mongoose.Types.ObjectId(data.exerciseId),
        status: data.status,
        notes: data.notes,
        customSettings: data.customSettings,
        lastUsed: data.lastUsed || new Date(),
        addedAt: new Date()
      });      return await preference.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('User already has a preference for this exercise');
      }
      console.error('Error in UserExercisePreferenceRepository.create:', error);
      throw error;
    }
  }

  /**
   * Update an existing user exercise preference
   */  async update(
    userId: string,
    exerciseId: string,
    updates: {
      status?: 'favorite';
      notes?: string;
      customSettings?: {
        defaultSets?: number;
        defaultReps?: number;
        defaultWeight?: number;
        restTime?: number;
        progressNotes?: string;
      };
    }
  ): Promise<UserExercisePreferenceDocument | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(exerciseId)) {
        throw new Error('Invalid user ID or exercise ID format');
      }

      await connectToMongoDB();      const updateData: any = { ...updates };
      
      // Always update the lastUsed timestamp when updating status
      if (updates.status) {
        updateData.lastUsed = new Date();
      }

      return await UserExercisePreference
        .findOneAndUpdate(
          {
            userId: new mongoose.Types.ObjectId(userId),
            exerciseId: new mongoose.Types.ObjectId(exerciseId)
          },
          updateData,
          { new: true, lean: true }
        )
        .populate('exerciseId', 'name description difficulty')
        .exec();
    } catch (error) {
      console.error('Error in UserExercisePreferenceRepository.update:', error);
      throw error;
    }
  }

  /**
   * Delete a user exercise preference
   */
  async delete(userId: string, exerciseId: string): Promise<boolean> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(exerciseId)) {
        throw new Error('Invalid user ID or exercise ID format');
      }

      await connectToMongoDB();

      const result = await UserExercisePreference
        .deleteOne({
          userId: new mongoose.Types.ObjectId(userId),
          exerciseId: new mongoose.Types.ObjectId(exerciseId)
        })
        .exec();

      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error in UserExercisePreferenceRepository.delete:', error);
      throw error;
    }
  }

  /**
   * Get exercise popularity stats (for admin insights)
   */  async getExercisePopularityStats(): Promise<Array<{
    exerciseId: string;
    favoriteCount: number;
    totalCount: number;
  }>> {
    try {
      await connectToMongoDB();

      return await UserExercisePreference
        .aggregate([
          {
            $group: {
              _id: '$exerciseId',              favoriteCount: {
                $sum: { $cond: [{ $eq: ['$status', 'favorite'] }, 1, 0] }
              },
              totalCount: { $sum: 1 }
            }
          },
          {            $project: {
              exerciseId: '$_id',
              favoriteCount: 1,
              totalCount: 1,
              _id: 0
            }
          },
          {
            $sort: { totalCount: -1 }
          }
        ])
        .exec();
    } catch (error) {
      console.error('Error in UserExercisePreferenceRepository.getExercisePopularityStats:', error);
      throw error;
    }
  }

  /**
   * Update last used timestamp for an exercise
   */
  async updateLastUsed(userId: string, exerciseId: string): Promise<UserExercisePreferenceDocument | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(exerciseId)) {
        throw new Error('Invalid user ID or exercise ID format');
      }

      await connectToMongoDB();

      return await UserExercisePreference
        .findOneAndUpdate(
          {
            userId: new mongoose.Types.ObjectId(userId),
            exerciseId: new mongoose.Types.ObjectId(exerciseId)
          },
          { lastUsed: new Date() },
          { new: true, lean: true }
        )
        .populate('exerciseId', 'name description difficulty')
        .exec();
    } catch (error) {
      console.error('Error in UserExercisePreferenceRepository.updateLastUsed:', error);
      throw error;
    }
  }
}

export default new UserExercisePreferenceRepository();
