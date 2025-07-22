import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToMongoDB from '@/lib/mongodb';
import { validateImportData } from '@/lib/validation/import-schemas';
import Category from '@/lib/models/category';
import Exercise from '@/lib/models/exercise';
import User from '@/lib/models/user';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectToMongoDB();

    // Check if user is admin
    const user = await User.findOne({ email: session.user.email });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Parse the JSON data from request body
    let importData;
    try {
      importData = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    // Validate the import data
    const validation = validateImportData(importData);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    const { categories, exercises } = validation.data!;

    // Start transaction
    const session_db = await mongoose.startSession();
    let result = { 
      categoriesCreated: 0, 
      exercisesCreated: 0, 
      errors: [] as string[] 
    };

    try {
      await session_db.withTransaction(async () => {
        // Import categories first
        const categoryMap = new Map<string, mongoose.Types.ObjectId>();
        
        for (const categoryData of categories) {
          try {
            // Check if category already exists
            const existingCategory = await Category.findOne({
              name: { $regex: new RegExp(`^${categoryData.name}$`, 'i') }
            });

            if (existingCategory) {
              categoryMap.set(categoryData.name.toLowerCase(), existingCategory._id as mongoose.Types.ObjectId);
              continue;
            }

            // Create new category
            const newCategory = new Category({
              name: categoryData.name,
              color: categoryData.color,
              description: categoryData.description || '',
              createdBy: user._id,
              updatedBy: user._id
            });

            await newCategory.save();
            categoryMap.set(categoryData.name.toLowerCase(), newCategory._id as mongoose.Types.ObjectId);
            result.categoriesCreated++;
          } catch (error) {
            result.errors.push(`Failed to create category "${categoryData.name}": ${error}`);
          }
        }

        // Import exercises
        for (const exerciseData of exercises) {
          try {
            // Check if exercise already exists
            const existingExercise = await Exercise.findOne({
              name: { $regex: new RegExp(`^${exerciseData.name}$`, 'i') }
            });

            if (existingExercise) {
              continue;
            }

            // Get category ID
            const categoryId = categoryMap.get(exerciseData.categoryName.toLowerCase());
            if (!categoryId) {
              result.errors.push(`Category not found for exercise "${exerciseData.name}"`);
              continue;
            }

            // Create new exercise
            const newExercise = new Exercise({
              name: exerciseData.name,
              description: exerciseData.description || '',
              imageUrl: exerciseData.imageUrl || '',
              isActive: exerciseData.isActive ?? true,
              difficulty: exerciseData.difficulty,
              muscleGroups: exerciseData.muscleGroups,
              equipment: exerciseData.equipment || [],
              instructions: exerciseData.instructions,
              tips: exerciseData.tips || [],
              categoryId: categoryId,
              createdBy: user._id,
              updatedBy: user._id
            });

            await newExercise.save();
            result.exercisesCreated++;
          } catch (error) {
            result.errors.push(`Failed to create exercise "${exerciseData.name}": ${error}`);
          }
        }
      });
    } finally {
      await session_db.endSession();
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${result.categoriesCreated} categories and ${result.exercisesCreated} exercises created`,
      details: result
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Internal server error during import' },
      { status: 500 }
    );
  }
}
