import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function seedDatabase() {
  // Now import the MongoDB modules after env vars are loaded
  const { default: connectToMongoDB } = await import('../lib/mongodb');
  const { default: Exercise } = await import('../lib/models/exercise');
  const { default: Category } = await import('../lib/models/category');
  const { default: User } = await import('../lib/models/user');

const sampleCategories = [
  { name: 'Chest', color: '#FF6B6B' },
  { name: 'Back', color: '#4ECDC4' },
  { name: 'Legs', color: '#45B7D1' },
  { name: 'Arms', color: '#FFA07A' },
  { name: 'Shoulders', color: '#98D8C8' },
  { name: 'Core', color: '#FFD93D' }
];

const sampleExercises = [
  {
    name: 'Push-ups',
    category: 'Chest',
    description: 'Classic bodyweight chest exercise',
    difficulty: 'beginner',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    equipment: [],
    instructions: [
      'Start in a plank position with hands slightly wider than shoulders',
      'Lower your body until chest nearly touches the floor',
      'Push back up to starting position'
    ],
    tips: ['Keep your core engaged', 'Maintain straight body line']
  },
  {
    name: 'Pull-ups',
    category: 'Back',
    description: 'Upper body pulling exercise',
    difficulty: 'intermediate',
    muscleGroups: ['back', 'biceps'],
    equipment: ['pull-up bar'],
    instructions: [
      'Hang from bar with arms fully extended',
      'Pull yourself up until chin clears the bar',
      'Lower back down with control'
    ],
    tips: ['Engage your lats', 'Avoid swinging']
  },
  {
    name: 'Squats',
    category: 'Legs',
    description: 'Fundamental lower body exercise',
    difficulty: 'beginner',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: [],
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower down as if sitting in a chair',
      'Push through heels to return to standing'
    ],
    tips: ['Keep knees aligned with toes', 'Go as low as comfortable']
  },
  {
    name: 'Plank',
    category: 'Core',
    description: 'Core stabilization exercise',
    difficulty: 'beginner',
    muscleGroups: ['core', 'shoulders'],
    equipment: [],
    instructions: [
      'Start in push-up position on forearms',
      'Keep body straight from head to heels',
      'Hold the position'
    ],
    tips: ['Breathe normally', 'Keep hips level']  }
];

  try {
    console.log('Connecting to MongoDB...');
    await connectToMongoDB();
    
    // Check if data already exists
    const existingExercises = await Exercise.countDocuments();
    const existingCategories = await Category.countDocuments();
    
    console.log(`Found ${existingExercises} exercises and ${existingCategories} categories`);
    
    if (existingExercises > 0 && existingCategories > 0) {
      console.log('Data already exists. Skipping seeding.');
      process.exit(0);
    }
    
    // Find or create admin user
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Please run init-admin.ts first');
      process.exit(1);
    }
    
    // Create categories
    const categoryMap = new Map();
    
    for (const categoryData of sampleCategories) {
      const category = new Category({
        name: categoryData.name,
        color: categoryData.color,
        createdBy: adminUser._id,
        updatedBy: adminUser._id
      });
      
      const savedCategory = await category.save();
      categoryMap.set(categoryData.name, savedCategory._id);
      console.log(`Created category: ${categoryData.name}`);
    }
    
    // Create exercises
    for (const exerciseData of sampleExercises) {
      const categoryId = categoryMap.get(exerciseData.category);
      
      const exercise = new Exercise({
        name: exerciseData.name,
        categoryId,
        description: exerciseData.description,
        difficulty: exerciseData.difficulty,
        muscleGroups: exerciseData.muscleGroups,
        equipment: exerciseData.equipment,
        instructions: exerciseData.instructions,
        tips: exerciseData.tips,
        isActive: true,
        createdBy: adminUser._id,
        updatedBy: adminUser._id
      });
      
      await exercise.save();
      console.log(`Created exercise: ${exerciseData.name}`);
    }
    
    console.log('Sample data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase();
