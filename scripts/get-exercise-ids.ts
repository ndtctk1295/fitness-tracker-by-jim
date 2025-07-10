import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function getExerciseIds() {
  try {
    // Import MongoDB modules after env vars are loaded
    const { default: connectToMongoDB } = await import('../lib/mongodb');
    const { default: Exercise } = await import('../lib/models/exercise');

    console.log('Connecting to MongoDB...');
    await connectToMongoDB();
    
    const exercises = await Exercise.find({}).select('_id name').limit(10);
    
    console.log('Available Exercise IDs:');
    exercises.forEach((exercise, index) => {
      console.log(`${index + 1}. ${exercise.name}: ${exercise._id}`);
    });
    
    if (exercises.length >= 2) {
      console.log('\nFor test interface:');
      console.log(`First exercise ID: ${exercises[0]._id}`);
      console.log(`Second exercise ID: ${exercises[1]._id}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error getting exercise IDs:', error);
    process.exit(1);
  }
}

getExerciseIds();
