import { format, addDays, isBefore, isAfter, differenceInDays } from 'date-fns';
import connectToMongoDB from '../../mongodb';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import { ExerciseGenerationPolicy, ensureDefaultGenerationPolicy } from '../../models/exercise-generation-policy';

/**
 * Service for automatically generating scheduled exercises from workout plan templates
 */

export interface GenerationResult {
  success: boolean;
  count: number;
  message?: string;
  batchId?: string;
  startDate?: string;
  endDate?: string;
}

export interface GenerationStatus {
  needsGeneration: boolean;
  latestGeneratedDate?: string;
  nextTargetDate: string;
  daysToGenerate: number;
}

/**
 * Checks if a workout plan needs exercise generation
 */
export async function checkGenerationStatus(
  workoutPlanId: string,
  minDaysInAdvance: number = 7
): Promise<GenerationStatus> {
  try {
    const connection = await connectToMongoDB();
    const db = connection.connection.db;
    
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    // Get the workout plan
    const plan = await db.collection('workoutPlans').findOne({ _id: new ObjectId(workoutPlanId) });
    if (!plan) {
      throw new Error('Workout plan not found');
    }
    
    // Get generation policy
    const generationPolicy = ensureDefaultGenerationPolicy(plan.generationPolicy);
    
    // Calculate target date based on requirements
    const today = new Date();
    const targetDate = addDays(today, minDaysInAdvance);
    const targetDateStr = format(targetDate, 'yyyy-MM-dd');
    
    // Check if we already have exercises generated beyond our target
    let needsGeneration = true;
    let latestGeneratedDate: string | undefined;
    
    if (generationPolicy.furthestGeneratedDate) {
      const furthestDate = new Date(generationPolicy.furthestGeneratedDate);
      latestGeneratedDate = generationPolicy.furthestGeneratedDate;
      
      // If we've already generated beyond our target, no need to generate more
      if (!isBefore(furthestDate, targetDate)) {
        needsGeneration = false;
      }
    }
    
    // Calculate how many days we need to generate
    const startDate = latestGeneratedDate ? addDays(new Date(latestGeneratedDate), 1) : today;
    const daysToGenerate = needsGeneration ? differenceInDays(targetDate, startDate) + 1 : 0;
    
    return {
      needsGeneration,
      latestGeneratedDate,
      nextTargetDate: targetDateStr,
      daysToGenerate,
    };
  } catch (error) {
    console.error('Error checking generation status:', error);
    throw error;
  }
}

/**
 * Generates scheduled exercises for a workout plan
 */
export async function generateScheduledExercisesForPlan(
  workoutPlanId: string,
  startDate: Date,
  endDate: Date,
  replaceExisting: boolean = false
): Promise<GenerationResult> {
  try {
    const connection = await connectToMongoDB();
    const db = connection.connection.db;
    
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    // Get the workout plan
    const plan = await db.collection('workoutPlans').findOne({ _id: new ObjectId(workoutPlanId) });
    if (!plan) {
      throw new Error('Workout plan not found');
    }
    
    // Validate date constraints based on plan mode
    if (!isDateValidForPlan(plan, startDate, endDate)) {
      return {
        success: false,
        count: 0,
        message: 'Date range is not valid for this workout plan mode',
      };
    }
    
    // Generate unique batch ID for this generation
    const batchId = uuidv4();
    
    // Get generation policy
    const generationPolicy = ensureDefaultGenerationPolicy(plan.generationPolicy);
    
    // Process in batches to avoid long-running operations
    let currentStart = new Date(startDate);
    const finalEnd = new Date(endDate);
    let totalGenerated = 0;
    
    while (currentStart <= finalEnd) {
      // Calculate batch end date
      const batchEnd = new Date(currentStart);
      batchEnd.setDate(currentStart.getDate() + generationPolicy.batchSize - 1);
      
      // Use the earlier of batchEnd or the final end date
      const actualBatchEnd = batchEnd <= finalEnd ? batchEnd : finalEnd;
      
      // Generate exercises for this batch
      const batchResult = await generateExercisesForDateRange(
        db,
        plan,
        currentStart,
        actualBatchEnd,
        batchId,
        replaceExisting
      );
      
      totalGenerated += batchResult.count;
      
      // Move to next batch
      currentStart = addDays(actualBatchEnd, 1);
    }
    
    // Update generation policy
    const updatedPolicy: ExerciseGenerationPolicy = {
      ...generationPolicy,
      lastGenerationTime: new Date(),
      furthestGeneratedDate: format(finalEnd, 'yyyy-MM-dd'),
    };
    
    await db.collection('workoutPlans').updateOne(
      { _id: new ObjectId(workoutPlanId) },
      { $set: { generationPolicy: updatedPolicy } }
    );
    
    return {
      success: true,
      count: totalGenerated,
      message: `Successfully generated ${totalGenerated} exercises`,
      batchId,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    };
  } catch (error) {
    console.error('Error generating scheduled exercises:', error);
    throw error;
  }
}

/**
 * Ensures exercises are generated for a workout plan if needed
 */
export async function ensureExercisesGenerated(
  workoutPlanId: string,
  minDaysInAdvance: number = 7
): Promise<GenerationResult> {
  try {
    // Check if generation is needed
    const status = await checkGenerationStatus(workoutPlanId, minDaysInAdvance);
    
    if (!status.needsGeneration) {
      return {
        success: true,
        count: 0,
        message: 'Exercises already generated beyond target date',
      };
    }
    
    // Calculate generation range
    const today = new Date();
    const startDate = status.latestGeneratedDate ? 
      addDays(new Date(status.latestGeneratedDate), 1) : today;
    const endDate = addDays(today, minDaysInAdvance);
    
    // Generate exercises
    return await generateScheduledExercisesForPlan(
      workoutPlanId,
      startDate,
      endDate,
      false // Don't replace existing exercises
    );
  } catch (error) {
    console.error('Error ensuring exercises are generated:', error);
    throw error;
  }
}

/**
 * Background job to generate exercises for all active plans
 */
export async function generateExercisesForAllActivePlans(): Promise<{
  success: boolean;
  plansProcessed: number;
  exercisesGenerated: number;
  results: Array<{ planId: string; userId: string; result: GenerationResult }>;
}> {
  try {
    const connection = await connectToMongoDB();
    const db = connection.connection.db;
    
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    // Get all active plans with auto-generation enabled
    const activePlans = await db.collection('workoutPlans')
      .find({ 
        isActive: true,
        $or: [
          { 'generationPolicy.autoGenerationEnabled': true },
          { 'generationPolicy.autoGenerationEnabled': { $exists: false } }, // Default to enabled
        ]
      })
      .toArray();
    
    let totalExercisesGenerated = 0;
    const results = [];
    
    // Process each plan
    for (const plan of activePlans) {
      try {
        const generationPolicy = ensureDefaultGenerationPolicy(plan.generationPolicy);
        
        const result = await ensureExercisesGenerated(
          plan._id.toString(),
          generationPolicy.advanceDays
        );
        
        totalExercisesGenerated += result.count;
        results.push({
          planId: plan._id.toString(),
          userId: plan.userId.toString(),
          result,
        });
      } catch (error) {
        console.error(`Error generating exercises for plan ${plan._id}:`, error);
        results.push({
          planId: plan._id.toString(),
          userId: plan.userId.toString(),
          result: {
            success: false,
            count: 0,
            message: error instanceof Error ? error.message : 'Unknown error occurred',
          },
        });
      }
    }
    
    return {
      success: true,
      plansProcessed: activePlans.length,
      exercisesGenerated: totalExercisesGenerated,
      results,
    };
  } catch (error) {
    console.error('Error generating exercises for all active plans:', error);
    throw error;
  }
}

/**
 * Helper function to generate exercises for a specific date range
 */
async function generateExercisesForDateRange(
  db: any,
  plan: any,
  startDate: Date,
  endDate: Date,
  batchId: string,
  replaceExisting: boolean
): Promise<{ count: number }> {
  let generatedCount = 0;
  const currentDate = new Date(startDate);
  
  // Process each day in the range
  while (currentDate <= endDate) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const dayOfWeek = currentDate.getDay();
    
    // Find template for this day
    const dayTemplate = plan.weeklyTemplate.find((t: any) => t.dayOfWeek === dayOfWeek);
    
    if (dayTemplate && dayTemplate.exerciseTemplates) {
      // For each exercise template
      for (const template of dayTemplate.exerciseTemplates) {
        // If replacing existing, delete any existing exercises
        if (replaceExisting) {
          await db.collection('scheduledExercises').deleteMany({
            userId: plan.userId,
            workoutPlanId: plan._id,
            exerciseId: template.exerciseId,
            date: dateStr,
            isHidden: { $ne: true },
          });
        }
        
        // Check if already exists (and not hidden)
        const existing = await db.collection('scheduledExercises').findOne({
          userId: plan.userId,
          workoutPlanId: plan._id,
          exerciseId: template.exerciseId,
          date: dateStr,
          isHidden: { $ne: true },
        });
        
        // Only create if not already exists or if replacing
        if (!existing || replaceExisting) {
          // Get categoryId from exercise if not available in template
          let categoryId = template.categoryId;
          if (!categoryId) {
            const exercise = await db.collection('exercises').findOne({ _id: new ObjectId(template.exerciseId) });
            categoryId = exercise?.categoryId || null;
          }
          
          await db.collection('scheduledExercises').insertOne({
            userId: plan.userId,
            workoutPlanId: plan._id,
            exerciseId: template.exerciseId,
            categoryId: categoryId,
            date: dateStr,
            sets: template.sets,
            reps: template.reps,
            weight: template.weight,
            notes: template.notes || '',
            orderIndex: template.orderIndex || 0,
            completed: false,
            isHidden: false,
            isManual: false, // Generated from workout plan
            generatedAt: new Date(),
            modifiedByUser: false,
            generationBatchId: batchId,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          
          generatedCount++;
        }
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return { count: generatedCount };
}

/**
 * Validates if a date range is valid for a workout plan based on its mode
 */
function isDateValidForPlan(plan: any, startDate: Date, endDate: Date): boolean {
  if (plan.mode === 'ongoing') {
    // For ongoing plans, only generate for dates after the plan was created
    const planCreatedAt = plan.createdAt ? new Date(plan.createdAt) : new Date();
    return !isBefore(startDate, planCreatedAt);
  } else if (plan.mode === 'dated') {
    // For dated plans, only generate within the plan's date range
    if (!plan.startDate || !plan.endDate) {
      return false;
    }
    
    const planStart = new Date(plan.startDate);
    const planEnd = new Date(plan.endDate);
    
    return !isBefore(startDate, planStart) && !isAfter(endDate, planEnd);
  }
  
  return true;
}
