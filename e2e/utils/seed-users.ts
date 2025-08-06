// import { mongoose } from 'mongoose';
// Script to seed test users for E2E tests

// import mongoose from 'mongoose';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import user data from TypeScript fixture
import { usersMockData } from '../fixtures/users';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-tracker-e2e';

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

export async function seedUsers() {
  // Don't create a new connection if already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
  }
  
  // Create test users from TypeScript fixture
  const users = [usersMockData.valid, usersMockData.invalid];
  
  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 10);
    await User.create({ ...user, password: hashed });
  }
  
  // Don't disconnect - let the global setup handle this
  console.log(`[E2E] Seeded ${users.length} test users to database: ${mongoose.connection.name}`);
}

seedUsers().catch((err) => {
  console.error(err);
  process.exit(1);
});
