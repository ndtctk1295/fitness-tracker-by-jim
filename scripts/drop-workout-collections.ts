import mongoose from 'mongoose';

async function dropWorkoutPlanCollections() {
  try {
    console.log('Connecting to database...');
    const mongoUri = 'mongodb://localhost:27017/fitness-tracker-e2e';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    
    const db = mongoose.connection.db;
    
    // Drop both workout plan collections
    try {
      await db.collection('workoutPlans').drop();
      console.log('Dropped workoutPlans collection');
    } catch (e) {
      console.log('workoutPlans collection did not exist');
    }
    
    try {
      await db.collection('workoutplans').drop();
      console.log('Dropped workoutplans collection');
    } catch (e) {
      console.log('workoutplans collection did not exist');
    }
    
    console.log('Collections dropped successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

dropWorkoutPlanCollections();
