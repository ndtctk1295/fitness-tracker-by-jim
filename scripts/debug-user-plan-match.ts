import mongoose from 'mongoose';
import WorkoutPlan from '../lib/models/workout-plan';
import User from '../lib/models/user';

async function debugUserWorkoutPlanMatch() {
  try {
    console.log('Connecting to database...');
    const mongoUri = 'mongodb://localhost:27017/fitness-tracker-e2e';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    
    // Find all users
    const users = await User.find({}).select('email _id').lean();
    console.log('\nAll users:');
    users.forEach((user: any) => {
      console.log(`- ${user.email}: ${user._id}`);
    });
    
    // Find all workout plans
    const workoutPlans = await WorkoutPlan.find({}).select('name userId').lean();
    console.log('\nAll workout plans:');
    workoutPlans.forEach((plan: any) => {
      console.log(`- ${plan.name}: userId=${plan.userId}`);
    });
    
    // Find the test@gmail.com user
    const testUser = await User.findOne({ email: 'test@gmail.com' });
    if (testUser) {
      console.log(`\nTest user (test@gmail.com): ${testUser._id}`);
      
      // Find workout plans for this user
      const userPlans = await WorkoutPlan.find({ userId: testUser._id });
      console.log(`Workout plans for test user: ${userPlans.length}`);
      userPlans.forEach((plan: any) => {
        console.log(`  - ${plan.name} (active: ${plan.isActive})`);
      });
    } else {
      console.log('\nNo test@gmail.com user found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugUserWorkoutPlanMatch();
