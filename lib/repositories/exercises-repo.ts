import connectToMongoDB from '@/lib/mongodb';
import Exercise, { ExerciseDocument } from '@/lib/models/exercise';
import mongoose from 'mongoose';
import { UserDocument } from '../models/user';
import { CategoryDocument } from '../models/category';

/**
 * Optimized Repository for Exercise entity operations
 */
class ExercisesRepository {
  /**
   * Get all exercises with optional sorting and filtering - Optimized with lean queries
   */
  async findAll(options: {
    sort?: Record<string, 1 | -1>;
    categoryId?: string;
  } = {}): Promise<ExerciseDocument[]> {
    try {
      await connectToMongoDB();
      
      const { sort = { name: 1 }, categoryId } = options;
      const query = categoryId ? { categoryId: new mongoose.Types.ObjectId(categoryId) } : {};
      
      return await Exercise
        .find(query)
        .select('_id name categoryId description imageUrl createdBy createdAt updatedAt')
        .lean()
        .sort(sort)
        .exec();
    } catch (error) {
      console.error('Error in ExercisesRepository.findAll:', error);
      throw error;
    }
  }

  /**
   * Get exercises by category ID - Optimized for category-specific queries
   */
  async findByCategory(categoryId: string): Promise<ExerciseDocument[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        throw new Error('Invalid category ID format');
      }
      
      await connectToMongoDB();
      return await Exercise
        .find({ categoryId: new mongoose.Types.ObjectId(categoryId) })
        .select('_id name description imageUrl createdAt')
        .lean()
        .sort({ name: 1 })
        .exec();
    } catch (error) {
      console.error(`Error in ExercisesRepository.findByCategory(${categoryId}):`, error);
      throw error;
    }
  }

  /**
   * Get exercises by creator - Optimized for user-specific queries
   */
  async findByCreator(createdBy: string): Promise<ExerciseDocument[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(createdBy)) {
        throw new Error('Invalid creator ID format');
      }
      
      await connectToMongoDB();
      return await Exercise
        .find({ createdBy: new mongoose.Types.ObjectId(createdBy) })
        .select('_id name categoryId description imageUrl createdAt')
        .lean()
        .sort({ name: 1 })
        .exec();
    } catch (error) {
      console.error(`Error in ExercisesRepository.findByCreator(${createdBy}):`, error);
      throw error;
    }
  }

  /**
   * Get an exercise by ID - Optimized
   */
  async findById(id: string): Promise<ExerciseDocument | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid exercise ID format');
      }
      
      await connectToMongoDB();
      return await Exercise
        .findById(id)
        .select('_id name categoryId description imageUrl createdBy updatedBy createdAt updatedAt')
        .lean()
        .exec();
    } catch (error) {
      console.error(`Error in ExercisesRepository.findById(${id}):`, error);
      throw error;
    }
  }

  /**
   * Create a new exercise
   */
  async create(data: {
    name: string;
    categoryId: CategoryDocument['_id'] | string;
    description?: string;
    imageUrl?: string;
    createdBy: UserDocument['_id'] | string;
  }): Promise<ExerciseDocument> {
    try {
      await connectToMongoDB();
      
      const exercise = new Exercise({
        ...data,
        updatedBy: data.createdBy // Initially the same as the creator
      });
      
      await exercise.save();
      return exercise;
    } catch (error) {
      console.error('Error in ExercisesRepository.create:', error);
      throw error;
    }
  }  /**
   * Update an existing exercise - Optimized
   */
  async update(
    id: string, 
    data: {
      name?: string;
      categoryId?: CategoryDocument['_id'] | string;
      description?: string;
      imageUrl?: string;
      updatedBy: UserDocument['_id'] | string;
    }
  ): Promise<ExerciseDocument | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid exercise ID format');
      }
      
      await connectToMongoDB();
      
      // Handle ObjectId conversion for fields that need it
      const updateData: any = { ...data };
      if (data.categoryId && typeof data.categoryId === 'string') {
        updateData.categoryId = new mongoose.Types.ObjectId(data.categoryId);
      }
      if (data.updatedBy && typeof data.updatedBy === 'string') {
        updateData.updatedBy = new mongoose.Types.ObjectId(data.updatedBy);
      }
      
      return await Exercise
        .findByIdAndUpdate(id, updateData, { 
          new: true, 
          runValidators: true,
          lean: true 
        })
        .select('_id name categoryId description imageUrl createdBy updatedBy createdAt updatedAt')
        .exec();
    } catch (error) {
      console.error(`Error in ExercisesRepository.update(${id}):`, error);      throw error;
    }
  }

  /**
   * Delete an exercise by ID - Optimized
   */
  async delete(id: string): Promise<ExerciseDocument | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid exercise ID format');
      }
      
      await connectToMongoDB();
      return await Exercise
        .findByIdAndDelete(id)
        .lean()
        .exec();
    } catch (error) {
      console.error(`Error in ExercisesRepository.delete(${id}):`, error);
      throw error;
    }
  }

  /**
   * Get active exercises only (admin-approved)
   */
  async findActive(options: {
    sort?: Record<string, 1 | -1>;
    categoryId?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    muscleGroups?: string[];
  } = {}): Promise<ExerciseDocument[]> {
    try {
      await connectToMongoDB();
      
      const { sort = { name: 1 }, categoryId, difficulty, muscleGroups } = options;
      const query: any = { isActive: true };
      
      if (categoryId) {
        query.categoryId = new mongoose.Types.ObjectId(categoryId);
      }
      
      if (difficulty) {
        query.difficulty = difficulty;
      }
      
      if (muscleGroups && muscleGroups.length > 0) {
        query.muscleGroups = { $in: muscleGroups };
      }
      
      return await Exercise
        .find(query)
        .select('_id name categoryId description imageUrl difficulty muscleGroups equipment instructions tips isActive createdAt updatedAt')
        .lean()
        .sort(sort)
        .exec();
    } catch (error) {
      console.error('Error in ExercisesRepository.findActive:', error);
      throw error;
    }
  }

  /**
   * Get exercises by difficulty level
   */
  async findByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<ExerciseDocument[]> {
    try {
      await connectToMongoDB();
      
      return await Exercise
        .find({ isActive: true, difficulty })
        .select('_id name categoryId description imageUrl difficulty muscleGroups equipment')
        .lean()
        .sort({ name: 1 })
        .exec();
    } catch (error) {
      console.error('Error in ExercisesRepository.findByDifficulty:', error);
      throw error;
    }
  }

  /**
   * Get exercises by muscle groups
   */
  async findByMuscleGroups(muscleGroups: string[]): Promise<ExerciseDocument[]> {
    try {
      await connectToMongoDB();
      
      return await Exercise
        .find({ 
          isActive: true, 
          muscleGroups: { $in: muscleGroups }
        })
        .select('_id name categoryId description imageUrl difficulty muscleGroups equipment')
        .lean()
        .sort({ name: 1 })
        .exec();
    } catch (error) {
      console.error('Error in ExercisesRepository.findByMuscleGroups:', error);
      throw error;
    }
  }

  /**
   * Admin: Toggle exercise active status
   */
  async toggleActiveStatus(id: string, isActive: boolean, updatedBy: string): Promise<ExerciseDocument | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid exercise ID format');
      }
      
      if (!mongoose.Types.ObjectId.isValid(updatedBy)) {
        throw new Error('Invalid updatedBy ID format');
      }
      
      await connectToMongoDB();
      
      return await Exercise
        .findByIdAndUpdate(
          id, 
          { 
            isActive,
            updatedBy: new mongoose.Types.ObjectId(updatedBy)
          }, 
          { 
            new: true, 
            runValidators: true,
            lean: true 
          }
        )
        .exec();
    } catch (error) {
      console.error(`Error in ExercisesRepository.toggleActiveStatus(${id}):`, error);
      throw error;
    }
  }

  /**
   * Admin: Get all exercises (including inactive)
   */
  async findAllForAdmin(options: {
    sort?: Record<string, 1 | -1>;
    categoryId?: string;
    isActive?: boolean;
  } = {}): Promise<ExerciseDocument[]> {
    try {
      await connectToMongoDB();
      
      const { sort = { createdAt: -1 }, categoryId, isActive } = options;
      const query: any = {};
      
      if (categoryId) {
        query.categoryId = new mongoose.Types.ObjectId(categoryId);
      }
      
      if (typeof isActive === 'boolean') {
        query.isActive = isActive;
      }
      
      return await Exercise
        .find(query)
        .populate('categoryId', 'name')
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .lean()
        .sort(sort)
        .exec();
    } catch (error) {
      console.error('Error in ExercisesRepository.findAllForAdmin:', error);
      throw error;
    }
  }
}

// Export singleton instance
const exercisesRepo = new ExercisesRepository();
export default exercisesRepo;
