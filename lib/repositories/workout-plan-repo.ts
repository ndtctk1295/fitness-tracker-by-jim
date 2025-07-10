import connectToMongoDB from '@/lib/mongodb';
import WorkoutPlan, { WorkoutPlanDocument } from '@/lib/models/workout-plan';
import ScheduledExercise, { ScheduledExerciseDocument } from '@/lib/models/scheduled-exercise';
import Exercise, { ExerciseDocument } from '@/lib/models/exercise';
import mongoose from 'mongoose';

/**
 * Repository for WorkoutPlan entity operations
 */
class WorkoutPlanRepository {
  /**
   * Get all workout plans (admin only) - Optimized with lean queries
   */
  async findAll(
    sort: Record<string, 1 | -1> = { createdAt: -1 }
  ): Promise<WorkoutPlanDocument[]> {
    try {
      await connectToMongoDB();
      return await WorkoutPlan
        .find()
        .lean()
        .sort(sort)
        .exec();
    } catch (error) {
      console.error('Error in WorkoutPlanRepository.findAll:', error);
      throw error;
    }
  }

  /**
   * Get all workout plans by user - Optimized for performance
   */
  async findAllByUser(userId: string): Promise<WorkoutPlanDocument[]> {
    try {
      await connectToMongoDB();
      return await WorkoutPlan
        .find({ userId })
        .lean()
        .sort({ isActive: -1, createdAt: -1 }) // Active plans first, then by creation date
        .exec();
    } catch (error) {
      console.error('Error in WorkoutPlanRepository.findAllByUser:', error);
      throw error;
    }
  }

  /**
   * Get active workout plan by user
   */
  async findActiveByUser(userId: string): Promise<WorkoutPlanDocument | null> {
    try {
      await connectToMongoDB();
      return await WorkoutPlan
        .findOne({ userId, isActive: true })
        .lean()
        .exec();
    } catch (error) {
      console.error('Error in WorkoutPlanRepository.findActiveByUser:', error);
      throw error;
    }
  }

  /**
   * Get workout plan by ID
   */
  async findById(id: string): Promise<WorkoutPlanDocument | null> {
    try {
      await connectToMongoDB();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      return await WorkoutPlan
        .findById(id)
        .lean()
        .exec();
    } catch (error) {
      console.error('Error in WorkoutPlanRepository.findById:', error);
      throw error;
    }
  }

  /**
   * Get workout plan by ID and user (for authorization)
   */
  async findByIdAndUser(id: string, userId: string): Promise<WorkoutPlanDocument | null> {
    try {
      await connectToMongoDB();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      return await WorkoutPlan
        .findOne({ _id: id, userId })
        .lean()
        .exec();
    } catch (error) {
      console.error('Error in WorkoutPlanRepository.findByIdAndUser:', error);
      throw error;
    }
  }

  /**
   * Create a new workout plan
   */
  async create(planData: Partial<WorkoutPlanDocument>): Promise<WorkoutPlanDocument> {
    try {
      await connectToMongoDB();
      
      const workoutPlan = new WorkoutPlan(planData);
      const savedPlan = await workoutPlan.save();
      
      // Return lean object for consistency
      return savedPlan.toObject();
    } catch (error) {
      console.error('Error in WorkoutPlanRepository.create:', error);
      throw error;
    }
  }

  /**
   * Update workout plan by ID
   */
  async updateById(
    id: string, 
    updateData: Partial<WorkoutPlanDocument>
  ): Promise<WorkoutPlanDocument | null> {
    try {
      await connectToMongoDB();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      // Remove fields that shouldn't be updated directly
      const { _id, userId, createdAt, ...safeUpdateData } = updateData;

      const updatedPlan = await WorkoutPlan
        .findByIdAndUpdate(
          id,
          { 
            ...safeUpdateData, 
            updatedAt: new Date() 
          },
          { 
            new: true, 
            runValidators: true,
            lean: true 
          }
        )
        .exec();

      return updatedPlan;
    } catch (error) {
      console.error('Error in WorkoutPlanRepository.updateById:', error);
      throw error;
    }
  }

  /**
   * Update workout plan by ID and user (for authorization)
   */
  async updateByIdAndUser(
    id: string, 
    userId: string,
    updateData: Partial<WorkoutPlanDocument>
  ): Promise<WorkoutPlanDocument | null> {
    try {
      await connectToMongoDB();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      // Remove fields that shouldn't be updated directly
      const { _id, userId: _, createdAt, ...safeUpdateData } = updateData;

      const updatedPlan = await WorkoutPlan
        .findOneAndUpdate(
          { _id: id, userId },
          { 
            ...safeUpdateData, 
            updatedAt: new Date() 
          },
          { 
            new: true, 
            runValidators: true,
            lean: true 
          }
        )
        .exec();

      return updatedPlan;
    } catch (error) {
      console.error('Error in WorkoutPlanRepository.updateByIdAndUser:', error);
      throw error;
    }
  }

  /**
   * Delete workout plan by ID
   */
  async deleteById(id: string): Promise<boolean> {
    try {
      await connectToMongoDB();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return false;
      }

      const result = await WorkoutPlan.findByIdAndDelete(id).exec();
      return result !== null;
    } catch (error) {
      console.error('Error in WorkoutPlanRepository.deleteById:', error);
      throw error;
    }
  }

  /**
   * Delete workout plan by ID and user (for authorization)
   */
  async deleteByIdAndUser(id: string, userId: string): Promise<boolean> {
    try {
      await connectToMongoDB();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return false;
      }

      const result = await WorkoutPlan
        .findOneAndDelete({ _id: id, userId })
        .exec();
      
      return result !== null;
    } catch (error) {
      console.error('Error in WorkoutPlanRepository.deleteByIdAndUser:', error);
      throw error;
    }
  }

  /**
   * Activate a workout plan (deactivates all others for the user)
   */
  async activate(id: string, userId: string): Promise<WorkoutPlanDocument | null> {
    try {
      await connectToMongoDB();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      // Manually deactivate all other plans for this user first
      await WorkoutPlan.updateMany(
        { 
          userId, 
          _id: { $ne: id },
          isActive: true 
        },
        { isActive: false, updatedAt: new Date() }
      );

      // Then activate the requested plan
      const activatedPlan = await WorkoutPlan
        .findOneAndUpdate(
          { _id: id, userId },
          { isActive: true, updatedAt: new Date() },
          { new: true, runValidators: true, lean: true }
        )
        .exec();

      return activatedPlan;
    } catch (error) {
      console.error('Error in WorkoutPlanRepository.activate:', error);
      throw error;
    }
  }

  /**
   * Deactivate a workout plan
   */
  async deactivate(id: string, userId: string): Promise<WorkoutPlanDocument | null> {
    try {
      await connectToMongoDB();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      const deactivatedPlan = await WorkoutPlan
        .findOneAndUpdate(
          { _id: id, userId },
          { isActive: false, updatedAt: new Date() },
          { new: true, lean: true }
        )
        .exec();

      return deactivatedPlan;
    } catch (error) {
      console.error('Error in WorkoutPlanRepository.deactivate:', error);
      throw error;
    }
  }

  /**
   * Find conflicting workout plans for date validation
   */
  async findConflictingPlans(
    userId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string
  ): Promise<WorkoutPlanDocument[]> {
    try {
      await connectToMongoDB();
      
      const excludeObjectId = excludeId && mongoose.Types.ObjectId.isValid(excludeId) 
        ? new mongoose.Types.ObjectId(excludeId) 
        : undefined;

      return await WorkoutPlan.findConflictingPlans(
        new mongoose.Types.ObjectId(userId),
        startDate,
        endDate,
        excludeObjectId
      );
    } catch (error) {
      console.error('Error in WorkoutPlanRepository.findConflictingPlans:', error);
      throw error;
    }
  }

  /**
   * Duplicate a workout plan
   */
  async duplicate(
    id: string, 
    userId: string, 
    newName?: string
  ): Promise<WorkoutPlanDocument | null> {
    try {
      await connectToMongoDB();
      
      const originalPlan = await this.findByIdAndUser(id, userId);
      if (!originalPlan) {
        return null;
      }

      // Create a copy without MongoDB-specific fields
      const {
        _id,
        isActive,
        createdAt,
        updatedAt,
        ...planData
      } = originalPlan;

      const duplicatedPlan = await this.create({
        ...planData,
        name: newName || `${originalPlan.name} (Copy)`,
        isActive: false, // Duplicated plans start inactive
      });

      return duplicatedPlan;
    } catch (error) {
      console.error('Error in WorkoutPlanRepository.duplicate:', error);
      throw error;
    }
  }

  /**
   * Get workout plans by mode (ongoing/dated)
   */
  async findByUserAndMode(
    userId: string, 
    mode: 'ongoing' | 'dated'
  ): Promise<WorkoutPlanDocument[]> {
    try {
      await connectToMongoDB();
      
      return await WorkoutPlan
        .find({ userId, mode })
        .lean()
        .sort({ isActive: -1, createdAt: -1 })
        .exec();
    } catch (error) {
      console.error('Error in WorkoutPlanRepository.findByUserAndMode:', error);
      throw error;
    }
  }

  /**
   * Get workout plans by level
   */
  async findByUserAndLevel(
    userId: string, 
    level: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<WorkoutPlanDocument[]> {
    try {
      await connectToMongoDB();
      
      return await WorkoutPlan
        .find({ userId, level })
        .lean()
        .sort({ isActive: -1, createdAt: -1 })
        .exec();
    } catch (error) {
      console.error('Error in WorkoutPlanRepository.findByUserAndLevel:', error);
      throw error;
    }
  }

  /**
   * Get active dated plans that should be auto-deactivated
   */
  async findExpiredDatedPlans(): Promise<WorkoutPlanDocument[]> {
    try {
      await connectToMongoDB();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return await WorkoutPlan
        .find({
          mode: 'dated',
          isActive: true,
          endDate: { $lt: today }
        })
        .lean()
        .exec();
    } catch (error) {
      console.error('Error in WorkoutPlanRepository.findExpiredDatedPlans:', error);
      throw error;
    }
  }

  /**
   * Auto-deactivate expired dated plans
   */
  async deactivateExpiredPlans(): Promise<number> {
    try {
      await connectToMongoDB();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = await WorkoutPlan
        .updateMany(
          {
            mode: 'dated',
            isActive: true,
            endDate: { $lt: today }
          },
          { 
            isActive: false,
            updatedAt: new Date()
          }
        )
        .exec();

      return result.modifiedCount;
    } catch (error) {
      console.error('Error in WorkoutPlanRepository.deactivateExpiredPlans:', error);
      throw error;
    }
  }
  /**
   * Generate exercises for a date range based on workout plan
   */
  async generateExercises(
    workoutPlanId: string,
    userId: string,
    startDate: Date,
    endDate: Date,
    replaceExisting: boolean = false
  ): Promise<ScheduledExerciseDocument[]> {
    try {
      await connectToMongoDB();
      
      const workoutPlan = await WorkoutPlan.findOne({ _id: workoutPlanId, userId }).lean();
      if (!workoutPlan) {
        throw new Error('Workout plan not found');
      }

      const exercises: any[] = [];
      const currentDate = new Date(startDate);
        // If replaceExisting, remove existing exercises in the date range
      if (replaceExisting) {
        // Convert dates to string format for proper comparison with String date field
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        await ScheduledExercise.deleteMany({
          userId,
          workoutPlanId,
          date: { $gte: startDateStr, $lte: endDateStr }
        });
      }// Generate exercises for each day in the range
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Find the day template for this day of week
        const dayTemplate = workoutPlan.weeklyTemplate?.find(template => template.dayOfWeek === dayOfWeek);
        
        if (dayTemplate && dayTemplate.exerciseTemplates.length > 0) {
          for (const exerciseTemplate of dayTemplate.exerciseTemplates) {
            // Look up the exercise to get the categoryId
            const exercise = await Exercise.findById(exerciseTemplate.exerciseId).lean();
            if (!exercise) {
              console.warn(`Exercise not found for ID: ${exerciseTemplate.exerciseId}, skipping`);
              continue;
            }            exercises.push({
              userId,
              workoutPlanId,
              exerciseId: exerciseTemplate.exerciseId,
              categoryId: exercise.categoryId,
              sets: exerciseTemplate.sets,
              reps: exerciseTemplate.reps,
              weight: exerciseTemplate.weight,
              notes: exerciseTemplate.notes,
              date: currentDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD string format
              completed: false,
              isManual: false,
              isTemporaryChange: false,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (exercises.length > 0) {
        const result = await ScheduledExercise.insertMany(exercises);
        return result as ScheduledExerciseDocument[];
      }

      return [];
    } catch (error) {
      console.error('Error in WorkoutPlanRepository.generateExercises:', error);
      throw error;
    }
  }

  /**
   * Generate exercises for a specific date
   */
  async generateExercisesForDate(
    workoutPlanId: string,
    userId: string,
    date: Date,
    replaceExisting: boolean = false
  ): Promise<ScheduledExerciseDocument[]> {
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return this.generateExercises(workoutPlanId, userId, date, endDate, replaceExisting);
  }

  /**
   * Get exercises by date
   */  async getExercisesByDate(
    userId: string,
    date: Date,
    workoutPlanId?: string,
    includeCompleted: boolean = true
  ): Promise<ScheduledExerciseDocument[]> {
    try {
      await connectToMongoDB();
      
      // Convert date to string format for proper comparison with String date field
      const dateStr = date.toISOString().split('T')[0];

      const filter: any = {
        userId,
        date: dateStr
      };

      if (workoutPlanId) {
        filter.workoutPlanId = workoutPlanId;
      }      if (!includeCompleted) {
        filter.completed = false;
      }

      return await ScheduledExercise
        .find(filter)
        .populate('exerciseId')
        .sort({ createdAt: 1 })
        .lean()
        .exec();
    } catch (error) {
      console.error('Error in WorkoutPlanRepository.getExercisesByDate:', error);
      throw error;
    }
  }
}

export { WorkoutPlanRepository };
export default new WorkoutPlanRepository();
