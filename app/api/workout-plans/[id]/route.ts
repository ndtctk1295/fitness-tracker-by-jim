import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import workoutPlanRepo from '@/lib/repositories/workout-plan-repo';
import { z } from 'zod';
import mongoose from 'mongoose';

// Validation schema for workout plan updates
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
  dayOfWeek: z.number().int().min(0).max(6).refine((val): val is 0 | 1 | 2 | 3 | 4 | 5 | 6 => val >= 0 && val <= 6, { 
    message: "Day of week must be between 0 and 6" 
  }),
  name: z.string().max(50).optional(),
  exerciseTemplates: z.array(exerciseTemplateSchema),
});

const updateWorkoutPlanSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  duration: z.number().int().min(1).max(52).optional(),
  mode: z.enum(['ongoing', 'dated']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  weeklyTemplate: z.array(dayTemplateSchema).length(7).optional(),
  updatedBy: z.string().max(100).optional(),
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
 * GET /api/workout-plans/[id]
 * Get a specific workout plan by ID for the authenticated user
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    // Find the workout plan
    const workoutPlan = await workoutPlanRepo.findByIdAndUser(id, userId);
    
    if (!workoutPlan) {
      return NextResponse.json(
        { error: 'Workout plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(workoutPlan);
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workout-plans/[id]
 * Update a specific workout plan by ID for the authenticated user
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const body = await req.json();

    // Validate request body
    const validation = updateWorkoutPlanSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const updateData = validation.data;    // Convert date strings to Date objects and string IDs to ObjectIds
    const workoutPlanUpdateData = {
      ...updateData,
      startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
      endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
      weeklyTemplate: updateData.weeklyTemplate ? updateData.weeklyTemplate.map(day => ({
        ...day,
        exerciseTemplates: day.exerciseTemplates.map(exercise => ({
          ...exercise,
          exerciseId: new mongoose.Types.ObjectId(exercise.exerciseId)
        }))
      })) : undefined,
    };

    // Check for conflicts if this is a dated plan with date changes
    if (updateData.mode === 'dated' && updateData.startDate && updateData.endDate) {
      const conflicts = await workoutPlanRepo.findConflictingPlans(
        userId,
        new Date(updateData.startDate),
        new Date(updateData.endDate),
        id // Exclude the current plan from conflict check
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

    // Update the workout plan
    const updatedPlan = await workoutPlanRepo.updateByIdAndUser(id, userId, workoutPlanUpdateData);
    
    if (!updatedPlan) {
      return NextResponse.json(
        { error: 'Workout plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error('Error updating workout plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workout-plans/[id]
 * Delete a specific workout plan by ID for the authenticated user
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id } = await params;

    // Delete the workout plan
    const deleted = await workoutPlanRepo.deleteByIdAndUser(id, userId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Workout plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workout plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
