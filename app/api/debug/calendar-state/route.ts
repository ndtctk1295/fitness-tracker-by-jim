import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';
// Auth options are now directly used via getServerSession from auth-helpers;
import scheduledExercisesRepo from '@/lib/repositories/scheduled-exercises-repo';
import workoutPlanRepo from '@/lib/repositories/workout-plan-repo';

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const url = new URL(req.url);
    const dateParam = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    // Get active workout plan
    const activePlan = await workoutPlanRepo.findActiveByUser(userId);
      // Get scheduled exercises for the date
    const scheduledExercises = await scheduledExercisesRepo.findByUserAndDate(userId, dateParam);
    
    // Get workout plan exercises for the date
    const workoutPlanExercises = scheduledExercises.filter((ex: any) => ex.workoutPlanId);
    const manualExercises = scheduledExercises.filter((ex: any) => !ex.workoutPlanId);
    
    const debugInfo = {
      date: dateParam,
      userId,
      activePlan: activePlan ? {
        id: activePlan._id?.toString(),
        name: activePlan.name,
        isActive: activePlan.isActive,
        weeklyTemplate: activePlan.weeklyTemplate?.map((day: any) => ({
          dayOfWeek: day.dayOfWeek,
          exerciseCount: day.exerciseTemplates?.length || 0
        }))
      } : null,
      scheduledExercises: {
        total: scheduledExercises.length,
        workoutPlan: workoutPlanExercises.length,
        manual: manualExercises.length,
        details: scheduledExercises.map((ex: any) => ({
          id: ex._id?.toString(),
          exerciseId: ex.exerciseId?.toString(),
          workoutPlanId: ex.workoutPlanId?.toString(),
          date: ex.date,
          isHidden: ex.isHidden,
          completed: ex.completed
        }))
      }
    };
    
    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error('Debug calendar state error:', error);
    return NextResponse.json(
      { error: 'Failed to get debug info', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
