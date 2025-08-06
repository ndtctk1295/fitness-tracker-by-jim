// Script to seed timer strategies for E2E tests
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-tracker-e2e';
const timerStrategiesPath = path.join(__dirname, '../fixtures/timer-strategies.json');
import { usersMockData } from '../fixtures/users';

const validUser = usersMockData.valid;

const timerStrategySchema = new mongoose.Schema({
  userId: String,
  name: String,
  color: String,
  restDuration: Number,
  activeDuration: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
});

const TimerStrategy = mongoose.models.TimerStrategy || mongoose.model('TimerStrategy', timerStrategySchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);

export async function seedTimerStrategies() {
  // Don't create a new connection if already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
  }
  
  // Get the test user to associate timer strategies with
  const testUser = await User.findOne({ email: validUser.email });
  
  if (!testUser) {
    throw new Error('Test user not found. Make sure users are seeded first.');
  }
  
  const timerStrategies = JSON.parse(fs.readFileSync(timerStrategiesPath, 'utf-8'));
  
  for (const strategy of timerStrategies) {
    await TimerStrategy.create({
      ...strategy,
      userId: testUser._id.toString()
    });
  }
  
  console.log(`[E2E] Seeded ${timerStrategies.length} timer strategies for user: ${testUser.email}`);
}
