import mongoose from 'mongoose';
import WorkoutPlan from '../lib/models/workout-plan';
import User from '../lib/models/user';

async function connectToTestDB() {
  const mongoUri = 'mongodb://localhost:27017/fitness-tracker-e2e';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }
}

async function debugWorkoutPlans() {
  try {
    console.log('Connecting to database...');
    await connectToTestDB();
    
    // Find all users
    const users = await User.find({}).select('email').lean();
    console.log('Users found:', users.length);
    users.forEach(user => {
      console.log(`- User: ${user.email} (${user._id})`);
    });
    
    // Find all workout plans
    const allPlans = await WorkoutPlan.find({}).lean();
    console.log('\nAll workout plans found:', allPlans.length);
    
    allPlans.forEach((plan, index) => {
      console.log(`\n--- Workout Plan ${index + 1} ---`);
      console.log('ID:', plan._id);
      console.log('Name:', plan.name);
      console.log('User ID:', plan.userId);
      console.log('Level:', plan.level);
      console.log('Duration:', plan.duration);
      console.log('Mode:', plan.mode);
      console.log('isActive:', plan.isActive);
      console.log('Weekly Template:', plan.weeklyTemplate ? plan.weeklyTemplate.length + ' days' : 'null');
      
      if (plan.weeklyTemplate) {
        plan.weeklyTemplate.forEach((day: any) => {
          console.log(`  Day ${day.dayOfWeek}: ${day.name} (${day.exerciseTemplates?.length || 0} exercises)`);
        });
      }
    });
    
    // Find workout plans for test user
    const testUser = await User.findOne({ email: 'testuser@example.com' });
    if (testUser) {
      console.log('\nTest user found:', testUser._id);
      const testUserPlans = await WorkoutPlan.find({ userId: testUser._id.toString() }).lean();
      console.log('Test user workout plans:', testUserPlans.length);
    } else {
      console.log('\nTest user not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Debug error:', error);
    process.exit(1);
  }
}

debugWorkoutPlans();
