import { NextRequest, NextResponse } from 'next/server';
import connectToMongoDB from '@/lib/mongodb';
import Exercise from '@/lib/models/exercise';
import Category from '@/lib/models/category';

export async function GET() {
  try {
    await connectToMongoDB();
    
    const exerciseCount = await Exercise.countDocuments();
    const categoryCount = await Category.countDocuments();
    
    const exercises = await Exercise.find({}).limit(5).lean();
    const categories = await Category.find({}).limit(5).lean();
    
    return NextResponse.json({
      success: true,
      counts: {
        exercises: exerciseCount,
        categories: categoryCount
      },
      sampleData: {
        exercises: exercises.map(ex => ({
          id: ex._id,
          name: ex.name,
          isActive: ex.isActive,
          difficulty: ex.difficulty
        })),
        categories: categories.map(cat => ({
          id: cat._id,
          name: cat.name
        }))
      }
    });  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Unknown error'
    });
  }
}
