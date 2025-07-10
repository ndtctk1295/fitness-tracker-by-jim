/**
 * Comprehensive integration test for the new exercise generation system
 * Tests all key user flows and API endpoints
 */

const API_BASE = 'http://localhost:3000/api';

interface TestResult {
  test: string;
  success: boolean;
  error?: string;
  data?: any;
}

class ExerciseGenerationTester {
  private results: TestResult[] = [];

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}${endpoint}`;
    console.log(`Making request to: ${url}`);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
      }

      return data;
    } catch (error) {
      console.error(`Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  private addResult(test: string, success: boolean, error?: string, data?: any) {
    this.results.push({ test, success, error, data });
    console.log(`${success ? '✅' : '❌'} ${test}${error ? ` - ${error}` : ''}`);
  }

  async testHealthCheck() {
    try {
      const data = await this.makeRequest('/health/db');
      this.addResult('Database Health Check', true, undefined, data);
    } catch (error) {
      this.addResult('Database Health Check', false, (error as Error).message);
    }
  }

  async testNeedsGenerationEndpoint() {
    try {
      const data = await this.makeRequest('/scheduled-exercises/needs-generation');
      this.addResult('Needs Generation Check', true, undefined, data);
      return data;
    } catch (error) {
      this.addResult('Needs Generation Check', false, (error as Error).message);
      return null;
    }
  }

  async testEnsureExercisesGenerated() {
    try {
      const data = await this.makeRequest('/workout-plans/ensure-exercises-generated', {
        method: 'POST',
      });
      this.addResult('Ensure Exercises Generated', true, undefined, data);
      return data;
    } catch (error) {
      this.addResult('Ensure Exercises Generated', false, (error as Error).message);
      return null;
    }
  }

  async testCronEndpoint() {
    try {
      const data = await this.makeRequest('/cron/generate-exercises', {
        method: 'POST',
      });
      this.addResult('CRON Generation Endpoint', true, undefined, data);
      return data;
    } catch (error) {
      this.addResult('CRON Generation Endpoint', false, (error as Error).message);
      return null;
    }
  }

  async testGetActiveWorkoutPlan() {
    try {
      const data = await this.makeRequest('/workout-plans/active');
      this.addResult('Get Active Workout Plan', data.success, undefined, data);
      return data.plan;
    } catch (error) {
      this.addResult('Get Active Workout Plan', false, (error as Error).message);
      return null;
    }
  }

  async testGenerationStatusForPlan(planId: string) {
    try {
      const data = await this.makeRequest(`/workout-plans/${planId}/generation-status`);
      this.addResult(`Generation Status for Plan ${planId}`, true, undefined, data);
      return data;
    } catch (error) {
      this.addResult(`Generation Status for Plan ${planId}`, false, (error as Error).message);
      return null;
    }
  }

  async testScheduledExercisesEndpoint() {
    try {
      // Test getting scheduled exercises for today
      const today = new Date().toISOString().split('T')[0];
      const data = await this.makeRequest(`/scheduled-exercises/date/${today}`);
      this.addResult('Get Scheduled Exercises for Today', true, undefined, data);
      return data;
    } catch (error) {
      this.addResult('Get Scheduled Exercises for Today', false, (error as Error).message);
      return null;
    }
  }

  async runFullIntegrationTest() {
    console.log('🚀 Starting Exercise Generation Integration Test\n');
    
    // Test 1: Health check
    await this.testHealthCheck();
    
    // Test 2: Check if generation is needed
    const needsGenData = await this.testNeedsGenerationEndpoint();
    
    // Test 3: Get active workout plan
    const activePlan = await this.testGetActiveWorkoutPlan();
    
    // Test 4: If we have an active plan, test generation status
    if (activePlan && activePlan._id) {
      await this.testGenerationStatusForPlan(activePlan._id);
    }
    
    // Test 5: Test ensure exercises generated
    await this.testEnsureExercisesGenerated();
    
    // Test 6: Test scheduled exercises endpoint
    await this.testScheduledExercisesEndpoint();
    
    // Test 7: Test CRON endpoint
    await this.testCronEndpoint();
    
    // Test 8: Re-check generation status after ensuring generation
    if (activePlan && activePlan._id) {
      await this.testGenerationStatusForPlan(activePlan._id);
    }
    
    // Test 9: Re-check needs generation after ensuring generation
    await this.testNeedsGenerationEndpoint();

    this.printSummary();
  }

  private printSummary() {
    console.log('\n📊 Test Summary:');
    console.log('================');
    
    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.success)
        .forEach(r => console.log(`  - ${r.test}: ${r.error}`));
    }
    
    console.log('\n✅ Passed Tests:');
    this.results
      .filter(r => r.success)
      .forEach(r => console.log(`  - ${r.test}`));
  }
}

// Run the test
async function main() {
  const tester = new ExerciseGenerationTester();
  await tester.runFullIntegrationTest();
}

// Handle both Node.js and browser environments
if (typeof window === 'undefined') {
  // Node.js environment
  main().catch(console.error);
} else {
  // Browser environment - attach to window for manual testing
  (window as any).testExerciseGeneration = main;
  console.log('Test function attached to window.testExerciseGeneration()');
}
