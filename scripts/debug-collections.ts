import mongoose from 'mongoose';

async function checkCollections() {
  try {
    console.log('Connecting to database...');
    const mongoUri = 'mongodb://localhost:27017/fitness-tracker-e2e';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('Collections in database:');
    for (const collection of collections) {
      console.log(`- ${collection.name}`);
      
      // Get document count for each collection
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  Documents: ${count}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCollections();
