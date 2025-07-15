import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';
// Auth options are now directly used via getServerSession from auth-helpers;
import exercisesRepo from '@/lib/repositories/exercises-repo';
import isAdmin from '@/middleware/isAdmin';

/**
 * GET /api/exercises
 * Get all exercises with optional category filtering
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const categoryId = url.searchParams.get('categoryId');
    
    let exercises;
    if (categoryId) {
      exercises = await exercisesRepo.findByCategory(categoryId);
    } else {
      exercises = await exercisesRepo.findAll();
    }
    
    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/exercises
 * Create a new exercise (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify admin role
    const isUserAdmin = await isAdmin(session.user.id);
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.categoryId) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }
    
    const exercise = await exercisesRepo.create({
      name: data.name,
      categoryId: data.categoryId,
      description: data.description,
      imageUrl: data.imageUrl,
      createdBy: session.user.id,
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
