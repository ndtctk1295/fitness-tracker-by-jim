import mongoose from 'mongoose';
import WorkoutPlan from '../lib/models/workout-plan';
import User from '../lib/models/user';

async function testWorkoutPlanSeed() {
  try {
    console.log('Connecting to database...');
    const mongoUri = 'mongodb://localhost:27017/fitness-tracker-e2e';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    
    // Find a test user
    const testUser = await User.findOne({ email: 'test@gmail.com' });
    if (!testUser) {
      console.error('Test user not found');
      process.exit(1);
    }
    
    console.log('Found test user:', testUser._id);
    
    // Create a simple workout plan
    const workoutPlan = {
      name: "Test Workout Plan",
      description: "A simple test workout plan",
      userId: testUser._id,
      level: 'beginner' as const,
      duration: 4,
      mode: 'ongoing' as const,
      isActive: true,
      weeklyTemplate: [
        { dayOfWeek: 0 as const, name: "Rest Day", exerciseTemplates: [] },
        { dayOfWeek: 1 as const, name: "Workout Day", exerciseTemplates: [] },
        { dayOfWeek: 2 as const, name: "Rest Day", exerciseTemplates: [] },
        { dayOfWeek: 3 as const, name: "Workout Day", exerciseTemplates: [] },
        { dayOfWeek: 4 as const, name: "Rest Day", exerciseTemplates: [] },
        { dayOfWeek: 5 as const, name: "Workout Day", exerciseTemplates: [] },
        { dayOfWeek: 6 as const, name: "Rest Day", exerciseTemplates: [] }
      ],
      createdBy: testUser._id.toString(),
      updatedBy: testUser._id.toString()
    };
    
    console.log('Creating workout plan...');
    const created = await WorkoutPlan.create(workoutPlan);
    console.log('Successfully created workout plan:', created._id);
    
    // Verify it was created
    const found = await WorkoutPlan.findById(created._id);
    console.log('Verification: Found workout plan in DB:', !!found);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testWorkoutPlanSeed();
