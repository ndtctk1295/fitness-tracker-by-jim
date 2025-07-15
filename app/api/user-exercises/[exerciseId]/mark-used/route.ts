import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';
// Auth options are now directly used via getServerSession from auth-helpers;
import userExercisePreferenceRepo from '@/lib/repositories/user-exercise-preference-repo';

/**
 * POST /api/user-exercises/[exerciseId]/mark-used
 * Mark an exercise as recently used by updating the lastUsed timestamp
 */
export async function POST(
  req: NextRequest,
  context: { params: { exerciseId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Await params in Next.js 15+
    const params = await context.params;
    const { exerciseId } = params;
    
    // Debug logs to help troubleshoot the issue
    console.log(`Marking exercise ${exerciseId} as used for user ${session.user.id}`);
    
    // Try to update existing preference first
    const updatedPreference = await userExercisePreferenceRepo.updateLastUsed(
      session.user.id,
      exerciseId
    );

    console.log('Updated preference result:', updatedPreference ? 'Found' : 'Not found');
    
    // If preference was updated, return it
    if (updatedPreference) {
      console.log('Returning updated preference with lastUsed:', updatedPreference.lastUsed);
      return NextResponse.json({ 
        message: 'Exercise marked as used successfully',
        lastUsed: updatedPreference.lastUsed
      });
    }
    
    // If no preference exists, create a new one
    console.log('Creating new preference for exercise:', exerciseId);
    const newPreference = await userExercisePreferenceRepo.create({
      userId: session.user.id,
      exerciseId,
      status: 'favorite', // Default status when creating from mark-used
      lastUsed: new Date()
    });
    
    console.log('New preference created with lastUsed:', newPreference.lastUsed);
    
    return NextResponse.json({ 
      message: 'Exercise preference created and marked as used successfully',
      lastUsed: newPreference.lastUsed
    });
  } catch (error) {
    console.error('Error marking exercise as used:', error);
    return NextResponse.json(
      { error: 'Failed to mark exercise as used' },
      { status: 500 }
    );
  }
}
