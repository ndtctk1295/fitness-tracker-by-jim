import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';
// Auth options are now directly used via getServerSession from auth-helpers;
import exercisesRepo from '@/lib/repositories/exercises-repo';

/**
 * GET /api/exercises/available
 * Get admin-approved exercises with enhanced filtering
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const difficulty = url.searchParams.get('difficulty');
    const muscleGroup = url.searchParams.get('muscleGroup');
    const equipment = url.searchParams.get('equipment');
    const activeOnly = url.searchParams.get('activeOnly') !== 'false'; // Default to true
    const limit = url.searchParams.get('limit');
    const page = url.searchParams.get('page');

    let exercises;

    try {
      // Use the enhanced repository methods for filtering
      if (difficulty) {
        exercises = await exercisesRepo.findByDifficulty(difficulty as 'beginner' | 'intermediate' | 'advanced');
      } else if (muscleGroup) {
        exercises = await exercisesRepo.findByMuscleGroups([muscleGroup]);
      } else if (activeOnly) {
        exercises = await exercisesRepo.findActive();
      } else {
        // Fall back to basic find all
        exercises = await exercisesRepo.findAll();
      }

      // Apply additional client-side filtering if needed
      if (equipment && exercises) {
        exercises = exercises.filter(exercise => 
          exercise.equipment && exercise.equipment.includes(equipment)
        );
      }

      // Apply pagination if specified
      if (page && limit) {
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const startIndex = (pageNum - 1) * limitNum;
        exercises = exercises.slice(startIndex, startIndex + limitNum);
      } else if (limit) {
        const limitNum = parseInt(limit, 10);
        exercises = exercises.slice(0, limitNum);
      }

      return NextResponse.json({
        exercises,
        total: exercises.length,
        filters: {
          difficulty,
          muscleGroup,
          equipment,
          activeOnly
        }
      });
    } catch (repoError) {
      console.error('Repository error:', repoError);
      return NextResponse.json(
        { error: 'Failed to fetch exercises from database' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error fetching available exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available exercises' },
      { status: 500 }
    );
  }
}
