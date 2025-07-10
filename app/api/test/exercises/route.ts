import { NextRequest, NextResponse } from 'next/server';
import connectToMongoDB from '@/lib/mongodb';
import Exercise from '@/lib/models/exercise';
import Category from '@/lib/models/category';

// TEMPORARY: No auth for testing
export async function GET(request: NextRequest) {
  try {
    console.log('Test endpoint called - connecting to MongoDB...');
    await connectToMongoDB();
    console.log('Connected to MongoDB successfully');
      const exercises = await Exercise.find().populate('categoryId').lean();
    const categories = await Category.find().lean();
    
    console.log(`Found ${exercises.length} exercises and ${categories.length} categories`);
    
    return NextResponse.json({
      success: true,
      message: 'Test endpoint working',
      data: {
        exerciseCount: exercises.length,
        categoryCount: categories.length,
        exercises: exercises.slice(0, 2), // Just show first 2 exercises
        categories: categories.slice(0, 3) // Just show first 3 categories
      }
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
