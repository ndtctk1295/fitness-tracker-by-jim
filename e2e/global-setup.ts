// Playwright global setup for E2E tests
import { connectTestDb, clearTestDb } from './utils/test-db-utils';
import path from 'path';
// Import the seedUsers function from the compiled JS or use require for CJS  
// const seedUsers = require('./utils/seed-users');
import { seedUsers } from './utils/seed-users';
import { seedAllData } from './utils/seed-all-data';

async function globalSetup() {
  console.log('[E2E] Starting global setup...');
  
  // Ensure we're using the E2E test database
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-tracker-e2e';
  console.log('[E2E] Using MongoDB URI:', process.env.MONGODB_URI);
  
  // Connect to test database
  await connectTestDb();
  console.log('[E2E] Connected to test database');
  
  // Clear existing test data
  await clearTestDb();
  console.log('[E2E] Cleared test database');
  
  // Seed test users
  await seedUsers();
  console.log('[E2E] Test users seeded successfully');
  
  // Seed all comprehensive data
  await seedAllData();
  console.log('[E2E] All test data seeded successfully');
  
  // Keep connection open for tests
  console.log('[E2E] Global setup complete');
}


export default globalSetup;
