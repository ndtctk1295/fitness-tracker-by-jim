// Debug script to check exercise generation categoryId issue
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-tracker-by-jim';

async function debugExerciseGeneration() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('=== DEBUGGING EXERCISE GENERATION CATEGORYID ISSUE ===\n');
    
    // Check what's in the database
    console.log('Database collections and counts:');
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`- ${collection.name}: ${count} documents`);
    }
    
    // Check users
    const users = await db.collection('users').find({}).toArray();
    console.log(`\nUsers: ${users.length}`);
    if (users.length === 0) {
      console.log('No users found - cannot test without a user');
      return;
    }
    
    const testUser = users[0];
    console.log(`Using user: ${testUser.email} (ID: ${testUser._id})`);
    
    // Check exercises
    const exercises = await db.collection('exercises').find({}).limit(5).toArray();
    console.log(`\nExercises: ${exercises.length} (showing first 5)`);
    exercises.forEach(ex => {
      console.log(`- ${ex.name} (ID: ${ex._id}, categoryId: ${ex.categoryId || 'NOT SET'})`);
    });
    
    // Check categories
    const categories = await db.collection('categories').find({}).toArray();
    console.log(`\nCategories: ${categories.length}`);
    categories.forEach(cat => {
      console.log(`- ${cat.name} (ID: ${cat._id})`);
    });
    
    // Create a simple test workout plan if none exists
    if (exercises.length > 0) {
      console.log('\nCreating test workout plan...');
      
      const testPlan = {
        userId: testUser._id,
        name: 'Test Plan for CategoryId Debug',
        description: 'Generated for testing categoryId issue',
        level: 'beginner',
        isActive: true,
        mode: 'ongoing',
        weeklyTemplate: [
          {
            dayOfWeek: new Date().getDay(), // Current day
            name: 'Test Day',
            exerciseTemplates: [
              {
                exerciseId: exercises[0]._id,
                sets: 3,
                reps: 10,
                weight: 100,
                orderIndex: 0,
                // Intentionally not setting categoryId to test the fallback
              }
            ]
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await db.collection('workoutPlans').insertOne(testPlan);
      console.log(`Created test workout plan: ${result.insertedId}`);
      
      // Now test the generation service
      console.log('\nTesting exercise generation...');
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      // Import and use the generation service (simulate it manually)
      // We'll simulate the generation logic here
      const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      const dayOfWeek = today.getDay();
      
      // Find template for today
      const dayTemplate = testPlan.weeklyTemplate.find(t => t.dayOfWeek === dayOfWeek);
      
      if (dayTemplate && dayTemplate.exerciseTemplates) {
        console.log(`Found template for day ${dayOfWeek}`);
        
        for (const template of dayTemplate.exerciseTemplates) {
          console.log(`Processing template for exercise ${template.exerciseId}`);
          
          // Get categoryId from exercise if not available in template
          let categoryId = template.categoryId;
          console.log(`Template categoryId: ${categoryId || 'NOT SET'}`);
          
          if (!categoryId) {
            console.log(`Looking up exercise ${template.exerciseId} for categoryId...`);
            const exercise = await db.collection('exercises').findOne({ _id: template.exerciseId });
            if (exercise) {
              categoryId = exercise.categoryId || null;
              console.log(`Found exercise categoryId: ${categoryId || 'NOT SET'}`);
            } else {
              console.log(`Exercise NOT FOUND for ID: ${template.exerciseId}`);
            }
          }
          
          // Create scheduled exercise
          const scheduledExercise = {
            userId: testUser._id,
            workoutPlanId: result.insertedId,
            exerciseId: template.exerciseId,
            categoryId: categoryId,
            date: dateStr,
            sets: template.sets,
            reps: template.reps,
            weight: template.weight,
            notes: template.notes || '',
            orderIndex: template.orderIndex || 0,
            completed: false,
            isHidden: false,
            isManual: false,
            generatedAt: new Date(),
            modifiedByUser: false,
            generationBatchId: 'debug-test',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          console.log(`Creating scheduled exercise with categoryId: ${scheduledExercise.categoryId || 'NOT SET'}`);
          
          const insertResult = await db.collection('scheduledExercises').insertOne(scheduledExercise);
          console.log(`Created scheduled exercise: ${insertResult.insertedId}`);
        }
      } else {
        console.log(`No template found for day ${dayOfWeek}`);
      }
      
      // Check the generated scheduled exercises
      const generatedExercises = await db.collection('scheduledExercises')
        .find({ workoutPlanId: result.insertedId })
        .toArray();
      
      console.log(`\nFinal check - Generated ${generatedExercises.length} scheduled exercises:`);
      generatedExercises.forEach(ex => {
        console.log(`- Date: ${ex.date}, Exercise: ${ex.exerciseId}, CategoryId: ${ex.categoryId || 'NOT SET'}`);
      });
      
    } else {
      console.log('No exercises found - cannot create test workout plan');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

debugExerciseGeneration();
