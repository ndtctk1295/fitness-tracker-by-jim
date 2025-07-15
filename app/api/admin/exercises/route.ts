import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';
// Auth options are now directly used via getServerSession from auth-helpers;
import exercisesRepo from '@/lib/repositories/exercises-repo';
import { isAdmin } from '@/middleware/isAdmin';

/**
 * GET /api/admin/exercises
 * Get all exercises for admin management (including inactive ones)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );    }

    // Check admin privileges
    const userIsAdmin = await isAdmin(session.user.id);
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const includeInactive = url.searchParams.get('includeInactive') === 'true';
    const difficulty = url.searchParams.get('difficulty');
    const muscleGroup = url.searchParams.get('muscleGroup');

    let exercises;

    if (difficulty) {
      exercises = await exercisesRepo.findByDifficulty(difficulty as 'beginner' | 'intermediate' | 'advanced');
    } else if (muscleGroup) {
      exercises = await exercisesRepo.findByMuscleGroups([muscleGroup]);
    } else if (includeInactive) {
      exercises = await exercisesRepo.findAll();
    } else {
      exercises = await exercisesRepo.findActive();
    }

    return NextResponse.json({
      exercises,
      total: exercises.length
    });
  } catch (error) {
    console.error('Error fetching exercises for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/exercises
 * Create a new exercise (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );    }

    // Check admin privileges
    const userIsAdmin = await isAdmin(session.user.id);
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }    const body = await req.json();
    const { 
      name, 
      categoryId,
      description, 
      imageUrl
    } = body;

    // Basic validation
    if (!name || !description || !categoryId) {
      return NextResponse.json(
        { error: 'Name, description, and categoryId are required' },
        { status: 400 }
      );
    }

    const exercise = await exercisesRepo.create({
      name,
      categoryId,
      description,
      imageUrl,
      createdBy: session.user.id
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    );
  }
}
