// Check existing scheduled exercises for missing categoryId
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-tracker-by-jim';

async function checkExistingScheduledExercises() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('=== CHECKING EXISTING SCHEDULED EXERCISES FOR MISSING CATEGORYID ===\n');
    
    // Check all scheduled exercises
    const scheduledExercises = await db.collection('scheduledExercises').find({}).toArray();
    console.log(`Total scheduled exercises: ${scheduledExercises.length}`);
    
    // Check for missing categoryId
    const missingCategoryId = scheduledExercises.filter(ex => !ex.categoryId);
    console.log(`\nScheduled exercises with missing categoryId: ${missingCategoryId.length}`);
    
    if (missingCategoryId.length > 0) {
      console.log('\nFirst 10 exercises with missing categoryId:');
      missingCategoryId.slice(0, 10).forEach((ex, index) => {
        console.log(`${index + 1}. Date: ${ex.date}, ExerciseId: ${ex.exerciseId}, CategoryId: ${ex.categoryId || 'MISSING'}`);
      });
      
      // Try to fix them by looking up exercise categoryId
      console.log('\nAttempting to fix missing categoryId...');
      let fixedCount = 0;
      
      for (const scheduledEx of missingCategoryId) {
        const exercise = await db.collection('exercises').findOne({ _id: new ObjectId(scheduledEx.exerciseId) });
        if (exercise && exercise.categoryId) {
          await db.collection('scheduledExercises').updateOne(
            { _id: scheduledEx._id },
            { $set: { categoryId: exercise.categoryId, updatedAt: new Date() } }
          );
          fixedCount++;
        }
      }
      
      console.log(`Fixed ${fixedCount} scheduled exercises with missing categoryId`);
    }
    
    // Check for recent exercises (last 7 days)
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 7);
    const recentDateStr = recentDate.toISOString().split('T')[0];
    
    const recentExercises = await db.collection('scheduledExercises')
      .find({ date: { $gte: recentDateStr } })
      .toArray();
    
    console.log(`\nRecent exercises (last 7 days): ${recentExercises.length}`);
    const recentMissing = recentExercises.filter(ex => !ex.categoryId);
    console.log(`Recent exercises with missing categoryId: ${recentMissing.length}`);
    
    if (recentMissing.length > 0) {
      console.log('\nRecent exercises with missing categoryId:');
      recentMissing.forEach((ex, index) => {
        console.log(`${index + 1}. Date: ${ex.date}, ExerciseId: ${ex.exerciseId}, Generated: ${ex.generatedAt ? 'Yes' : 'No'}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkExistingScheduledExercises();
