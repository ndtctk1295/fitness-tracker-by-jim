// Comprehensive seeding functions for E2E tests
const mongoose = require('mongoose');
const { Types } = mongoose;
const fs = require('fs');
const path = require('path');

// Import user data from TypeScript fixture  
import { usersMockData } from '../fixtures/users';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-tracker-e2e';

// Dynamic date helper
function getDateString(daysOffset: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

// Dynamic scheduled exercises generator
function generateScheduledExercises() {
  const today = getDateString(0);
  const yesterday = getDateString(-1);
  const tomorrow = getDateString(1);
  const twoDaysFromNow = getDateString(2);
  
  return [
    // Yesterday's exercises
    {
      exerciseName: "Push-ups",
      date: yesterday,
      sets: 3,
      reps: 12,
      weight: 0,
      notes: "Bodyweight exercise",
      completed: false,
      orderIndex: 0
    },
    {
      exerciseName: "Squats", 
      date: yesterday,
      sets: 3,
      reps: 15,
      weight: 0,
      notes: "Focus on form",
      completed: false,
      orderIndex: 1
    },
    {
      exerciseName: "Plank",
      date: yesterday, 
      sets: 3,
      reps: 1,
      weight: 0,
      notes: "Hold for 30 seconds each set",
      completed: true,
      orderIndex: 2
    },
    
    // Today's exercises  
    {
      exerciseName: "Bicep Curls",
      date: today,
      sets: 3,
      reps: 10,
      weight: 15,
      notes: "15lb dumbbells",
      completed: false,
      orderIndex: 0
    },
    {
      exerciseName: "Shoulder Press",
      date: today,
      sets: 3,
      reps: 8,
      weight: 20,
      notes: "20lb dumbbells",
      completed: false,
      orderIndex: 1
    },
    
    // Tomorrow's exercises
    {
      exerciseName: "Pull-ups",
      date: tomorrow,
      sets: 3,
      reps: 6,
      weight: 0,
      notes: "Assisted if needed",
      completed: false,
      orderIndex: 0
    },
    {
      exerciseName: "Deadlifts",
      date: tomorrow,
      sets: 3,
      reps: 5,
      weight: 135,
      notes: "Focus on form over weight",
      completed: false,
      orderIndex: 1
    },
    
    // Two days from now
    {
      exerciseName: "Lunges",
      date: twoDaysFromNow,
      sets: 3,
      reps: 12,
      weight: 0,
      notes: "12 reps each leg",
      completed: false,
      orderIndex: 0
    }
  ];
}

// Load fixture data
const getFixturePath = (filename: string) => path.join(__dirname, '../fixtures', filename);
const loadFixture = (filename: string) => JSON.parse(fs.readFileSync(getFixturePath(filename), 'utf-8'));

// Define schemas
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: { type: String, default: 'user' }
});

const categorySchema = new mongoose.Schema({
  name: String,
  color: String,
  description: String,
  createdBy: String,
  updatedBy: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const exerciseSchema = new mongoose.Schema({
  name: String,
  categoryId: String,
  description: String,
  imageUrl: String,
  isActive: { type: Boolean, default: true },
  difficulty: String,
  muscleGroups: [String],
  equipment: [String],
  instructions: [String],
  tips: [String],
  createdBy: String,
  updatedBy: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const timerStrategySchema = new mongoose.Schema({
  userId: String,
  name: String,
  color: String,
  restDuration: Number,
  activeDuration: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const scheduledExerciseSchema = new mongoose.Schema({
  userId: String,
  exerciseId: String,
  categoryId: String,
  date: String,
  sets: Number,
  reps: Number,
  weight: Number,
  weightPlates: mongoose.Schema.Types.Mixed,
  isHidden: { type: Boolean, default: false },
  orderIndex: Number,
  notes: String,
  completed: { type: Boolean, default: false },
  completedAt: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const userExercisePreferenceSchema = new mongoose.Schema({
  userId: String,
  exerciseId: String,
  status: String,
  notes: String,
  customSettings: mongoose.Schema.Types.Mixed,
  addedAt: { type: Date, default: Date.now },
  lastUsed: Date
});

const weightPlateSchema = new mongoose.Schema({
  userId: String,
  value: Number,
  color: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Import actual models instead of defining custom schemas
import WorkoutPlanModel from '../../lib/models/workout-plan';
import UserModel from '../../lib/models/user';
import CategoryModel from '../../lib/models/category';
import ExerciseModel from '../../lib/models/exercise';
import TimerStrategyModel from '../../lib/models/timer-strategy';
import ScheduledExerciseModel from '../../lib/models/scheduled-exercise';
import UserExercisePreferenceModel from '../../lib/models/user-exercise-preference';
import WeightPlateModel from '../../lib/models/weight-plate';

// Use actual models with proper collection names
const User = UserModel;
const Category = CategoryModel;
const Exercise = ExerciseModel;
const TimerStrategy = TimerStrategyModel;
const ScheduledExercise = ScheduledExerciseModel;
const UserExercisePreference = UserExercisePreferenceModel;
const WeightPlate = WeightPlateModel;
const WorkoutPlan = WorkoutPlanModel;

// Individual seeding functions
export async function seedCategories() {
  const categories = loadFixture('categories.json');
  
  // Get first user as system user for categories
  const systemUser = await User.findOne();
  const systemUserId = systemUser ? systemUser._id : new Types.ObjectId();
  
  const categoryMap: Record<string, string> = {};

  for (const category of categories) {
    const doc = await Category.create({
      ...category,
      createdBy: systemUserId,
      updatedBy: systemUserId
    });
    categoryMap[category.name] = doc._id.toString();
  }  console.log(`[E2E] Seeded ${categories.length} categories`);
  return categoryMap;
}

export async function seedExercises(categoryMap: Record<string, string>) {
  const exercises = loadFixture('exercises.json');
  
  // Get first user as system user for exercises  
  const systemUser = await User.findOne();
  const systemUserId = systemUser ? systemUser._id : new Types.ObjectId();
  
  const exerciseMap: Record<string, string> = {};
  
  for (const exercise of exercises) {
    const categoryId = categoryMap[exercise.categoryName];
    if (!categoryId) {
      console.warn(`[E2E] Category not found for exercise: ${exercise.name}`);
      continue;
    }
    
    const doc = await Exercise.create({
      ...exercise,
      categoryId,
      createdBy: systemUserId,
      updatedBy: systemUserId
    });
    exerciseMap[exercise.name] = doc._id.toString();
  }
  
  console.log(`[E2E] Seeded ${exercises.length} exercises`);
  return exerciseMap;
}

export async function seedTimerStrategies(userId: string) {
  const timerStrategies = loadFixture('timer-strategies.json');
  
  for (const strategy of timerStrategies) {
    await TimerStrategy.create({
      ...strategy,
      userId
    });
  }
  
  console.log(`[E2E] Seeded ${timerStrategies.length} timer strategies for user: ${userId}`);
}

export async function seedScheduledExercises(userId: string, exerciseMap: Record<string, string>, categoryMap: Record<string, string>) {
  const scheduledExercises = generateScheduledExercises();
  
  for (const scheduledExercise of scheduledExercises) {
    const exerciseId = exerciseMap[scheduledExercise.exerciseName];
    if (!exerciseId) {
      console.warn(`[E2E] Exercise not found for scheduled exercise: ${scheduledExercise.exerciseName}`);
      continue;
    }
    
    // Find the exercise to get its categoryId
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      console.warn(`[E2E] Exercise document not found: ${exerciseId}`);
      continue;
    }
    
    await ScheduledExercise.create({
      ...scheduledExercise,
      userId,
      exerciseId,
      categoryId: exercise.categoryId
    });
  }
  
  console.log(`[E2E] Seeded ${scheduledExercises.length} scheduled exercises for user: ${userId}`);
}

export async function seedUserExercisePreferences(userId: string, exerciseMap: Record<string, string>) {
  const preferences = loadFixture('user-exercise-preferences.json');
  
  for (const preference of preferences) {
    const exerciseId = exerciseMap[preference.exerciseName];
    if (!exerciseId) {
      console.warn(`[E2E] Exercise not found for preference: ${preference.exerciseName}`);
      continue;
    }
    
    await UserExercisePreference.create({
      ...preference,
      userId,
      exerciseId
    });
  }
  
  console.log(`[E2E] Seeded ${preferences.length} user exercise preferences for user: ${userId}`);
}

export async function seedWeightPlates(userId: string) {
  const weightPlates = loadFixture('weight-plates.json');
  
  for (const plate of weightPlates) {
    await WeightPlate.create({
      ...plate,
      userId
    });
  }
  
  console.log(`[E2E] Seeded ${weightPlates.length} weight plates for user: ${userId}`);
}

export async function seedWorkoutPlans(userId: string, exerciseMap: Record<string, string>) {
  console.log(`[DEBUG] Starting workout plan seeding for user: ${userId}`);
  console.log(`[DEBUG] Exercise map:`, exerciseMap);

  const workoutPlans = [
    {
      name: "Morning Routine",
      description: "A quick morning workout to start the day",
      userId: new Types.ObjectId(userId),
      level: 'beginner',
      duration: 4,
      mode: 'ongoing',
      isActive: true,
      weeklyTemplate: [
        // Sunday (0)
        { dayOfWeek: 0, name: "Rest Day", exerciseTemplates: [] },
        // Monday (1)
        { 
          dayOfWeek: 1, 
          name: "Upper Body", 
          exerciseTemplates: [
            {
              exerciseId: new Types.ObjectId(exerciseMap["Push-ups"] || "507f1f77bcf86cd799439011"),
              sets: 3,
              reps: 12,
              weight: 0,
              weightPlates: {},
              notes: "Focus on form",
              orderIndex: 0
            },
            {
              exerciseId: new Types.ObjectId(exerciseMap["Squats"] || "507f1f77bcf86cd799439011"),
              sets: 3,
              reps: 15,
              weight: 0,
              weightPlates: {},
              notes: "Keep back straight",
              orderIndex: 1
            }
          ]
        },
        // Tuesday (2)
        { dayOfWeek: 2, name: "Rest Day", exerciseTemplates: [] },
        // Wednesday (3)
        { 
          dayOfWeek: 3, 
          name: "Lower Body", 
          exerciseTemplates: [
            {
              exerciseId: new Types.ObjectId(exerciseMap["Squats"] || "507f1f77bcf86cd799439011"),
              sets: 4,
              reps: 12,
              weight: 0,
              weightPlates: {},
              notes: "Deep squats",
              orderIndex: 0
            }
          ]
        },
        // Thursday (4)
        { dayOfWeek: 4, name: "Rest Day", exerciseTemplates: [] },
        // Friday (5)
        { 
          dayOfWeek: 5, 
          name: "Full Body", 
          exerciseTemplates: [
            {
              exerciseId: new Types.ObjectId(exerciseMap["Push-ups"] || "507f1f77bcf86cd799439011"),
              sets: 2,
              reps: 10,
              weight: 0,
              weightPlates: {},
              notes: "Light workout",
              orderIndex: 0
            }
          ]
        },
        // Saturday (6)
        { dayOfWeek: 6, name: "Rest Day", exerciseTemplates: [] }
      ],
      createdBy: userId,
      updatedBy: userId
    },
    {
      name: "Strength Training",
      description: "Building strength with compound movements",
      userId: new Types.ObjectId(userId),
      level: 'intermediate',
      duration: 8,
      mode: 'ongoing',
      isActive: false,
      weeklyTemplate: [
        // Sunday (0)
        { dayOfWeek: 0, name: "Active Recovery", exerciseTemplates: [] },
        // Monday (1)
        { dayOfWeek: 1, name: "Rest Day", exerciseTemplates: [] },
        // Tuesday (2)
        { 
          dayOfWeek: 2, 
          name: "Heavy Day", 
          exerciseTemplates: [
            {
              exerciseId: new Types.ObjectId(exerciseMap["Deadlift"] || exerciseMap["Squats"] || "507f1f77bcf86cd799439011"),
              sets: 4,
              reps: 8,
              weight: 100,
              weightPlates: {},
              notes: "Progressive overload",
              orderIndex: 0
            }
          ]
        },
        // Wednesday (3)
        { dayOfWeek: 3, name: "Rest Day", exerciseTemplates: [] },
        // Thursday (4)
        { 
          dayOfWeek: 4, 
          name: "Push Day", 
          exerciseTemplates: [
            {
              exerciseId: new Types.ObjectId(exerciseMap["Push-ups"] || "507f1f77bcf86cd799439011"),
              sets: 4,
              reps: 8,
              weight: 0,
              weightPlates: {},
              notes: "Slow controlled movement",
              orderIndex: 0
            }
          ]
        },
        // Friday (5)
        { dayOfWeek: 5, name: "Rest Day", exerciseTemplates: [] },
        // Saturday (6)
        { 
          dayOfWeek: 6, 
          name: "Pull Day", 
          exerciseTemplates: [
            {
              exerciseId: new Types.ObjectId(exerciseMap["Plank"] || "507f1f77bcf86cd799439011"),
              sets: 3,
              reps: 30,
              weight: 0,
              weightPlates: {},
              notes: "Hold for 30 seconds",
              orderIndex: 0
            }
          ]
        }
      ],
      createdBy: userId,
      updatedBy: userId
    },
    {
      name: "Cardio Focus",
      description: "Cardiovascular endurance and fat burning",
      userId: new Types.ObjectId(userId),
      level: 'beginner',
      duration: 6,
      mode: 'ongoing',
      isActive: false,
      weeklyTemplate: [
        // Sunday (0)
        { 
          dayOfWeek: 0, 
          name: "Cardio Blast", 
          exerciseTemplates: [
            {
              exerciseId: new Types.ObjectId(exerciseMap["Jumping Jacks"] || exerciseMap["Squats"] || "507f1f77bcf86cd799439011"),
              sets: 3,
              reps: 20,
              weight: 0,
              weightPlates: {},
              notes: "High intensity",
              orderIndex: 0
            }
          ]
        },
        // Monday (1) through Saturday (6)
        { dayOfWeek: 1, name: "Rest Day", exerciseTemplates: [] },
        { dayOfWeek: 2, name: "Rest Day", exerciseTemplates: [] },
        { dayOfWeek: 3, name: "Rest Day", exerciseTemplates: [] },
        { dayOfWeek: 4, name: "Rest Day", exerciseTemplates: [] },
        { dayOfWeek: 5, name: "Rest Day", exerciseTemplates: [] },
        { dayOfWeek: 6, name: "Rest Day", exerciseTemplates: [] }
      ],
      createdBy: userId,
      updatedBy: userId
    }
  ];

  console.log(`[DEBUG] About to create ${workoutPlans.length} workout plans`);

  for (let i = 0; i < workoutPlans.length; i++) {
    const plan = workoutPlans[i];
    console.log(`[DEBUG] Creating workout plan ${i + 1}: ${plan.name}`);
    try {
      const created = await WorkoutPlan.create(plan);
      console.log(`[DEBUG] Successfully created workout plan: ${created._id}`);
    } catch (error) {
      console.error(`[DEBUG] Error creating workout plan ${plan.name}:`, error);
    }
  }
  
  console.log(`[E2E] Seeded ${workoutPlans.length} workout plans for user: ${userId}`);
}

// Master seeding function
export async function seedAllData() {
  // Connect to database if needed
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
  }
  
  // Get the test user
  const testUser = await User.findOne({ email: usersMockData.valid.email });
  
  if (!testUser) {
    throw new Error('Test user not found. Make sure users are seeded first.');
  }
  
  const userId = testUser._id.toString();
  
  // Seed in dependency order
  console.log('[E2E] Starting comprehensive data seeding...');
  
  const categoryMap = await seedCategories();
  const exerciseMap = await seedExercises(categoryMap);
  await seedTimerStrategies(userId);
  await seedScheduledExercises(userId, exerciseMap, categoryMap);
  await seedUserExercisePreferences(userId, exerciseMap);
  await seedWeightPlates(userId);
  await seedWorkoutPlans(userId, exerciseMap);
  
  console.log('[E2E] Comprehensive data seeding complete');
  
  return {
    userId,
    categoryMap,
    exerciseMap,
    testUser
  };
}
