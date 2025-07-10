#!/usr/bin/env node

/**
 * Comprehensive API Test Script for Workout Plan Endpoints
 * This script tests all the workout plan API endpoints that were implemented
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Test configuration
const TEST_CONFIG = {
  // We'll need to get a session cookie from login
  useAuth: true,
  testUser: {
    email: 'test@example.com',
    password: 'password123'
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class WorkoutPlanApiTester {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE,
      timeout: 10000,
      withCredentials: true
    });
    this.testResults = [];
    this.createdWorkoutPlanId = null;
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  logSuccess(message) {
    this.log(`✅ ${message}`, colors.green);
  }

  logError(message) {
    this.log(`❌ ${message}`, colors.red);
  }

  logInfo(message) {
    this.log(`ℹ️  ${message}`, colors.blue);
  }

  logWarning(message) {
    this.log(`⚠️  ${message}`, colors.yellow);
  }

  async addTestResult(testName, success, message, data = null) {
    this.testResults.push({
      testName,
      success,
      message,
      data,
      timestamp: new Date().toISOString()
    });

    if (success) {
      this.logSuccess(`${testName}: ${message}`);
    } else {
      this.logError(`${testName}: ${message}`);
    }

    if (data && data.error) {
      this.log(`   Error details: ${JSON.stringify(data.error)}`, colors.red);
    }
  }

  async testEndpoint(testName, method, endpoint, data = null, expectedStatus = 200) {
    try {
      this.logInfo(`Testing ${testName}...`);
      
      let response;
      switch (method.toUpperCase()) {
        case 'GET':
          response = await this.axiosInstance.get(endpoint);
          break;
        case 'POST':
          response = await this.axiosInstance.post(endpoint, data);
          break;
        case 'PUT':
          response = await this.axiosInstance.put(endpoint, data);
          break;
        case 'DELETE':
          response = await this.axiosInstance.delete(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      const success = response.status === expectedStatus;
      await this.addTestResult(
        testName,
        success,
        `Status: ${response.status}, Expected: ${expectedStatus}`,
        response.data
      );

      return response.data;
    } catch (error) {
      await this.addTestResult(
        testName,
        false,
        `Request failed: ${error.message}`,
        {
          error: error.response?.data || error.message,
          status: error.response?.status
        }
      );
      return null;
    }
  }

  async testBasicCRUDOperations() {
    this.log('\n=== Testing Basic CRUD Operations ===', colors.magenta);

    // Test GET all workout plans
    await this.testEndpoint(
      'GET All Workout Plans',
      'GET',
      '/workout-plans'
    );

    // Test GET active workout plan
    await this.testEndpoint(
      'GET Active Workout Plan',
      'GET',
      '/workout-plans/active'
    );

    // Test POST create workout plan
    const sampleWorkoutPlan = {
      name: 'Test Workout Plan',
      description: 'A test workout plan for API testing',
      level: 'beginner',
      duration: 4,
      mode: 'ongoing',
      weeklyTemplate: [
        {
          dayOfWeek: 0,
          name: 'Rest Day',
          exerciseTemplates: []
        },
        {
          dayOfWeek: 1,
          name: 'Upper Body',
          exerciseTemplates: [
            {
              exerciseId: '507f1f77bcf86cd799439011', // Sample exercise ID
              sets: 3,
              reps: 12,
              weight: 50,
              orderIndex: 0
            }
          ]
        },
        {
          dayOfWeek: 2,
          name: 'Rest Day',
          exerciseTemplates: []
        },
        {
          dayOfWeek: 3,
          name: 'Lower Body',
          exerciseTemplates: [
            {
              exerciseId: '507f1f77bcf86cd799439012', // Sample exercise ID
              sets: 3,
              reps: 10,
              weight: 60,
              orderIndex: 0
            }
          ]
        },
        {
          dayOfWeek: 4,
          name: 'Rest Day',
          exerciseTemplates: []
        },
        {
          dayOfWeek: 5,
          name: 'Full Body',
          exerciseTemplates: []
        },
        {
          dayOfWeek: 6,
          name: 'Rest Day',
          exerciseTemplates: []
        }
      ]
    };

    const createResult = await this.testEndpoint(
      'POST Create Workout Plan',
      'POST',
      '/workout-plans',
      sampleWorkoutPlan,
      201
    );

    if (createResult && createResult._id) {
      this.createdWorkoutPlanId = createResult._id;
      this.logInfo(`Created workout plan with ID: ${this.createdWorkoutPlanId}`);
    }

    // Test GET specific workout plan
    if (this.createdWorkoutPlanId) {
      await this.testEndpoint(
        'GET Specific Workout Plan',
        'GET',
        `/workout-plans/${this.createdWorkoutPlanId}`
      );

      // Test PUT update workout plan
      const updateData = {
        name: 'Updated Test Workout Plan',
        description: 'Updated description'
      };

      await this.testEndpoint(
        'PUT Update Workout Plan',
        'PUT',
        `/workout-plans/${this.createdWorkoutPlanId}`,
        updateData
      );
    }
  }

  async testPlanManagementOperations() {
    this.log('\n=== Testing Plan Management Operations ===', colors.magenta);

    if (!this.createdWorkoutPlanId) {
      this.logWarning('Skipping plan management tests - no workout plan ID available');
      return;
    }

    // Test activate workout plan
    await this.testEndpoint(
      'POST Activate Workout Plan',
      'POST',
      `/workout-plans/${this.createdWorkoutPlanId}/activate`,
      {}
    );

    // Test deactivate workout plan
    await this.testEndpoint(
      'POST Deactivate Workout Plan',
      'POST',
      `/workout-plans/${this.createdWorkoutPlanId}/deactivate`,
      {}
    );

    // Test duplicate workout plan
    await this.testEndpoint(
      'POST Duplicate Workout Plan',
      'POST',
      `/workout-plans/${this.createdWorkoutPlanId}/duplicate`,
      { name: 'Duplicated Test Plan' }
    );
  }

  async testConflictManagement() {
    this.log('\n=== Testing Conflict Management ===', colors.magenta);

    if (!this.createdWorkoutPlanId) {
      this.logWarning('Skipping conflict management tests - no workout plan ID available');
      return;
    }

    // Test check conflicts
    const conflictCheckData = {
      workoutPlanId: this.createdWorkoutPlanId,
      startDate: new Date('2024-01-01').toISOString(),
      endDate: new Date('2024-01-31').toISOString()
    };

    await this.testEndpoint(
      'POST Check Conflicts',
      'POST',
      '/workout-plans/check-conflicts',
      conflictCheckData
    );

    // Test resolve conflicts
    const conflictResolutionData = {
      conflicts: [
        {
          conflictingPlanId: this.createdWorkoutPlanId,
          resolution: 'keep_existing'
        }
      ]
    };

    await this.testEndpoint(
      'POST Resolve Conflicts',
      'POST',
      '/workout-plans/resolve-conflicts',
      conflictResolutionData
    );
  }

  async testExerciseGeneration() {
    this.log('\n=== Testing Exercise Generation ===', colors.magenta);

    if (!this.createdWorkoutPlanId) {
      this.logWarning('Skipping exercise generation tests - no workout plan ID available');
      return;
    }

    // Test generate exercises for date range
    const generateData = {
      workoutPlanId: this.createdWorkoutPlanId,
      startDate: new Date('2024-01-01').toISOString(),
      endDate: new Date('2024-01-07').toISOString(),
      replaceExisting: true
    };

    await this.testEndpoint(
      'POST Generate Exercises',
      'POST',
      '/workout-plans/generate-exercises',
      generateData
    );

    // Test get exercises by date
    const testDate = '2024-01-01';
    await this.testEndpoint(
      'GET Exercises by Date',
      'GET',
      `/workout-plans/exercises/${testDate}?workoutPlanId=${this.createdWorkoutPlanId}&includeCompleted=false`
    );

    // Test generate exercises for specific date
    const generateForDateData = {
      workoutPlanId: this.createdWorkoutPlanId,
      replaceExisting: false
    };

    await this.testEndpoint(
      'POST Generate Exercises for Date',
      'POST',
      `/workout-plans/exercises/${testDate}`,
      generateForDateData
    );
  }

  async testErrorCases() {
    this.log('\n=== Testing Error Cases ===', colors.magenta);

    // Test invalid workout plan ID
    await this.testEndpoint(
      'GET Invalid Workout Plan ID',
      'GET',
      '/workout-plans/invalid-id',
      null,
      404
    );

    // Test invalid data for creation
    const invalidPlanData = {
      name: '', // Invalid empty name
      level: 'invalid-level', // Invalid level
      mode: 'invalid-mode' // Invalid mode
    };

    await this.testEndpoint(
      'POST Create Invalid Workout Plan',
      'POST',
      '/workout-plans',
      invalidPlanData,
      400
    );

    // Test conflict check with invalid data
    const invalidConflictData = {
      workoutPlanId: '', // Empty ID
      startDate: 'invalid-date'
    };

    await this.testEndpoint(
      'POST Check Conflicts Invalid Data',
      'POST',
      '/workout-plans/check-conflicts',
      invalidConflictData,
      400
    );
  }

  async cleanupTestData() {
    this.log('\n=== Cleaning Up Test Data ===', colors.magenta);

    if (this.createdWorkoutPlanId) {
      await this.testEndpoint(
        'DELETE Test Workout Plan',
        'DELETE',
        `/workout-plans/${this.createdWorkoutPlanId}`
      );
    }
  }

  async printSummary() {
    this.log('\n=== Test Summary ===', colors.magenta);
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    this.log(`Total Tests: ${totalTests}`);
    this.logSuccess(`Passed: ${passedTests}`);
    if (failedTests > 0) {
      this.logError(`Failed: ${failedTests}`);
    }
    
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    this.log(`Success Rate: ${successRate}%`, successRate >= 70 ? colors.green : colors.red);

    // Show failed tests
    if (failedTests > 0) {
      this.log('\n=== Failed Tests ===', colors.red);
      this.testResults.filter(r => !r.success).forEach(test => {
        this.log(`- ${test.testName}: ${test.message}`, colors.red);
      });
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Workout Plan API Tests', colors.cyan);
    this.log('=====================================', colors.cyan);

    try {
      await this.testBasicCRUDOperations();
      await this.testPlanManagementOperations();
      await this.testConflictManagement();
      await this.testExerciseGeneration();
      await this.testErrorCases();
      await this.cleanupTestData();
    } catch (error) {
      this.logError(`Test execution failed: ${error.message}`);
    }

    await this.printSummary();
  }
}

// Main execution
async function main() {
  const tester = new WorkoutPlanApiTester();
  
  console.log('Note: These tests run without authentication.');
  console.log('Some tests may fail if authentication is required.');
  console.log('This is expected behavior for secured endpoints.\n');
  
  await tester.runAllTests();
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = WorkoutPlanApiTester;
