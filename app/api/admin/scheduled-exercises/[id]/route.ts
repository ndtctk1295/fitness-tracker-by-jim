import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import scheduledExercisesRepo from "@/lib/repositories/scheduled-exercises-repo";
import { isAdmin } from "@/middleware/isAdmin";
import { z } from "zod";

// Schema for validating update data
const updateScheduledExerciseSchema = z.object({
  date: z.string().optional(),
  exerciseId: z.string().optional(),
  userId: z.string().optional(),
  notes: z.string().optional(),
  sets: z.array(z.object({
    weight: z.number().optional(),
    reps: z.number().optional(),
    duration: z.number().optional(),
    restTime: z.number().optional(),
    completed: z.boolean().optional(),
  })).optional(),
  completed: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
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

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Scheduled exercise ID is required" },
        { status: 400 }
      );
    }

    const exercise = await scheduledExercisesRepo.findById(id);
    if (!exercise) {
      return NextResponse.json(
        { error: "Scheduled exercise not found" },
        { status: 404 }
      );
    }

    // Include user data for admin view
    const exerciseWithUser = await scheduledExercisesRepo.findByIdWithUserData(id);
    
    return NextResponse.json(exerciseWithUser);
  } catch (error: any) {
    console.error("Error fetching scheduled exercise:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch scheduled exercise" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
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

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Scheduled exercise ID is required" },
        { status: 400 }
      );
    }

    // Check if scheduled exercise exists
    const existingExercise = await scheduledExercisesRepo.findById(id);
    if (!existingExercise) {
      return NextResponse.json(
        { error: "Scheduled exercise not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateScheduledExerciseSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }    const updatedData = validationResult.data;
    
    // Update the scheduled exercise
    const updatedExercise = await scheduledExercisesRepo.update(id, updatedData as any);
    
    return NextResponse.json(updatedExercise);
  } catch (error: any) {
    console.error("Error updating scheduled exercise:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update scheduled exercise" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
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

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Scheduled exercise ID is required" },
        { status: 400 }
      );
    }

    // Check if scheduled exercise exists
    const existingExercise = await scheduledExercisesRepo.findById(id);
    if (!existingExercise) {
      return NextResponse.json(
        { error: "Scheduled exercise not found" },
        { status: 404 }
      );
    }

    // Delete the scheduled exercise
    await scheduledExercisesRepo.delete(id);
    
    return NextResponse.json({ success: true, message: "Scheduled exercise deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting scheduled exercise:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete scheduled exercise" },
      { status: 500 }
    );
  }
}
