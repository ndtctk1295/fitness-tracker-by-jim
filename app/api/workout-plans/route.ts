import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import workoutPlanRepo from '@/lib/repositories/workout-plan-repo';
import { z } from 'zod';
import mongoose from 'mongoose';

// Validation schema for workout plan
const exerciseTemplateSchema = z.object({
  exerciseId: z.string().min(1, { message: "Exercise ID is required" }),
  sets: z.number().int().min(1).max(20, { message: "Sets must be between 1 and 20" }),
  reps: z.number().int().min(1).max(100, { message: "Reps must be between 1 and 100" }),
  weight: z.number().min(0, { message: "Weight cannot be negative" }),
  weightPlates: z.record(z.string(), z.number()).optional(),
  notes: z.string().max(500).optional(),
  orderIndex: z.number().int().min(0, { message: "Order index must be non-negative" }),
});

const dayTemplateSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6, { message: "Day of week must be between 0 and 6" }),
  name: z.string().max(50).optional(),
  exerciseTemplates: z.array(exerciseTemplateSchema),
});

const workoutPlanSchema = z.object({
  name: z.string().min(1).max(100, { message: "Name must be between 1 and 100 characters" }),
  description: z.string().max(500).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced'], { message: "Invalid level" }),
  duration: z.number().int().min(1).max(52).optional(),
  mode: z.enum(['ongoing', 'dated'], { message: "Mode must be 'ongoing' or 'dated'" }),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  weeklyTemplate: z.array(dayTemplateSchema).length(7, { message: "Weekly template must have exactly 7 days" }),
  createdBy: z.string().max(100).optional(),
}).refine((data) => {
  // Validate dated mode requirements
  if (data.mode === 'dated') {
    return data.startDate && data.endDate;
  }
  return true;
}, {
  message: "Start date and end date are required for dated workout plans",
  path: ['startDate', 'endDate'],
}).refine((data) => {
  // Validate end date is after start date
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) > new Date(data.startDate);
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ['endDate'],
});

/**
 * GET /api/workout-plans
 * Get all workout plans for the authenticated user
 * @query mode - Optional: filter by mode ('ongoing' | 'dated')
 * @query level - Optional: filter by level ('beginner' | 'intermediate' | 'advanced')
 * @query active - Optional: filter by active status ('true' | 'false')
 */
export async function GET(req: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    
    // Get optional filter parameters
    const mode = searchParams.get('mode') as 'ongoing' | 'dated' | null;
    const level = searchParams.get('level') as 'beginner' | 'intermediate' | 'advanced' | null;
    const activeFilter = searchParams.get('active');
    
    let workoutPlans;
    
    if (mode && level) {
      // Get plans by both mode and level
      const allPlans = await workoutPlanRepo.findAllByUser(userId);
      workoutPlans = allPlans.filter(plan => plan.mode === mode && plan.level === level);
    } else if (mode) {
      // Get plans by mode
      workoutPlans = await workoutPlanRepo.findByUserAndMode(userId, mode);
    } else if (level) {
      // Get plans by level
      workoutPlans = await workoutPlanRepo.findByUserAndLevel(userId, level);
    } else {
      // Get all plans
      workoutPlans = await workoutPlanRepo.findAllByUser(userId);
    }
    
    // Apply active filter if specified
    if (activeFilter !== null) {
      const isActive = activeFilter === 'true';
      workoutPlans = workoutPlans.filter(plan => plan.isActive === isActive);
    }

    return NextResponse.json(workoutPlans);
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workout-plans
 * Create a new workout plan for the authenticated user
 */
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();

    // Validate request body
    const validation = workoutPlanSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const planData = validation.data;    // Convert date strings to Date objects and userId to ObjectId
    const workoutPlanData = {
      ...planData,
      userId: new mongoose.Types.ObjectId(userId),
      startDate: planData.startDate ? new Date(planData.startDate) : undefined,
      endDate: planData.endDate ? new Date(planData.endDate) : undefined,
      isActive: false, // New plans start inactive
      weeklyTemplate: planData.weeklyTemplate.map(day => ({
        ...day,
        dayOfWeek: day.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        exerciseTemplates: day.exerciseTemplates.map(exercise => ({
          ...exercise,
          exerciseId: new mongoose.Types.ObjectId(exercise.exerciseId)
        }))
      }))
    };

    // Check for conflicts if this is a dated plan
    if (planData.mode === 'dated' && planData.startDate && planData.endDate) {
      const conflicts = await workoutPlanRepo.findConflictingPlans(
        userId,
        new Date(planData.startDate),
        new Date(planData.endDate)
      );

      if (conflicts.length > 0) {
        return NextResponse.json(
          { 
            error: 'Date conflicts detected',
            conflicts: conflicts.map(p => ({
              id: p._id,
              name: p.name,
              startDate: p.startDate,
              endDate: p.endDate
            }))
          },
          { status: 409 }
        );
      }
    }

    // Create the workout plan
    const newPlan = await workoutPlanRepo.create(workoutPlanData);

    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    console.error('Error creating workout plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
