import { NextRequest, NextResponse } from 'next/server';
import connectToMongoDB from '@/lib/mongodb';
import Exercise from '@/lib/models/exercise';
import Category from '@/lib/models/category';

export async function GET(request: NextRequest) {  try {
    console.log('Debug exercises endpoint called - connecting to MongoDB...');
    await connectToMongoDB();
    console.log('Connected to MongoDB successfully');

    // Get all exercises without population first
    const exercisesRaw = await Exercise.find().lean();
    console.log(`Found ${exercisesRaw.length} raw exercises`);

    // Get all categories
    const categories = await Category.find().lean();
    console.log(`Found ${categories.length} categories`);

    // Log each exercise for debugging
    exercisesRaw.forEach((exercise, index) => {
      console.log(`Exercise ${index + 1}:`, {
        id: exercise._id,
        name: exercise.name,
        isActive: exercise.isActive,
        categoryId: exercise.categoryId
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Debug exercises endpoint working',
      data: {
        exerciseCount: exercisesRaw.length,
        categoryCount: categories.length,
        exerciseNames: exercisesRaw.map(e => ({ 
          name: e.name, 
          isActive: e.isActive,
          categoryId: e.categoryId?.toString()
        })),
        categoryNames: categories.map(c => ({ 
          name: c.name,
          id: c._id?.toString()
        }))
      }
    });
  } catch (error: any) {
    console.error('Debug exercises endpoint error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Unknown error',
        stack: error.stack
      }, 
      { status: 500 }
    );
  }
}
