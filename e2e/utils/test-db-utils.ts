// Utility functions for E2E test database setup/teardown
// Extend as needed for your DB (e.g., MongoDB)

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-tracker-e2e';

export async function connectTestDb() {
  if (mongoose.connection.readyState === 0) {
    console.log(`[E2E] Connecting to database: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
    console.log(`[E2E] Connected to database: ${mongoose.connection.name}`);
  } else {
    console.log(`[E2E] Already connected to database: ${mongoose.connection.name}`);
  }
}

export async function clearTestDb() {
  const collections = Object.keys(mongoose.connection.collections);
  console.log(`[E2E] Clearing ${collections.length} collections`);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany({});
  }
}

export async function disconnectTestDb() {
  await mongoose.disconnect();
}
