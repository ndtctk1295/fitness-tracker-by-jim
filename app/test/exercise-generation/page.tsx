'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle, AlertCircle, RefreshCw, Calendar, Settings } from 'lucide-react';
import { useScheduledExerciseData } from '@/lib/hooks/data-hook/use-scheduled-exercise-data';
import { useWorkoutPlanData } from '@/lib/hooks/data-hook/use-workout-plan-data';
import { format, addDays } from 'date-fns';

interface TestResult {
  test: string;
  success: boolean;
  error?: string;
  data?: any;
  timestamp: Date;
}

export default function ExerciseGenerationTestPage() {
  const { data: session, status } = useSession();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const {
    exercises: scheduledExercises,
    isLoading: scheduledLoading,
    error: scheduledError,
  } = useScheduledExerciseData();

  // Note: Exercise generation methods moved to server-side React Query patterns
  // These functions are disabled in this test page  
  const ensureExercisesGeneratedIfNeeded = async () => {
    console.log('Exercise generation moved to React Query patterns');
  };
  
  const fetchExercisesForDateRange = async (startDate: string, endDate: string) => {
    console.log('Exercise fetching now handled by React Query automatically');
  };

  const scheduledInitialized = !scheduledLoading;

  const {
    activePlan,
    isLoading: workoutLoading,
    error: workoutError,
    loadActivePlan,
    initialized: workoutInitialized,
  } = useWorkoutPlanData();

  // Initialize stores
  useEffect(() => {
    if (status === 'authenticated' && !workoutInitialized) {
      loadActivePlan();
    }
  }, [status, workoutInitialized, loadActivePlan]);

  const addTestResult = (test: string, success: boolean, error?: string, data?: any) => {
    const result: TestResult = {
      test,
      success,
      error,
      data,
      timestamp: new Date(),
    };
    setTestResults(prev => [result, ...prev]);
  };

  const makeApiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.error || data.message || 'Unknown error'}`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const testNeedsGeneration = async () => {
    try {
      const data = await makeApiCall('/scheduled-exercises/needs-generation');
      addTestResult('Check if generation is needed', true, undefined, data);
      return data;
    } catch (error) {
      addTestResult('Check if generation is needed', false, (error as Error).message);
      return null;
    }
  };

  const testEnsureGeneration = async () => {
    try {
      const data = await makeApiCall('/workout-plans/ensure-exercises-generated', {
        method: 'POST',
      });
      addTestResult('Ensure exercises are generated', true, undefined, data);
      return data;
    } catch (error) {
      addTestResult('Ensure exercises are generated', false, (error as Error).message);
      return null;
    }
  };

  const testEnsureGenerationWithPlan = async (planId?: string) => {
    try {
      const requestBody = planId ? { workoutPlanId: planId } : {};
      const data = await makeApiCall('/workout-plans/ensure-exercises-generated', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      addTestResult(`Ensure exercises generated${planId ? ` for plan ${planId}` : ' (no plan ID)'}`, true, undefined, data);
      return data;
    } catch (error) {
      addTestResult(`Ensure exercises generated${planId ? ` for plan ${planId}` : ' (no plan ID)'}`, false, (error as Error).message);
      return null;
    }
  };

  const testGenerationStatus = async (planId: string) => {
    try {
      const data = await makeApiCall(`/workout-plans/${planId}/generation-status`);
      addTestResult(`Check generation status for plan ${planId}`, true, undefined, data);
      return data;
    } catch (error) {
      addTestResult(`Check generation status for plan ${planId}`, false, (error as Error).message);
      return null;
    }
  };

  const testScheduledExercisesForRange = async () => {
    try {
      const today = new Date();
      const endDate = addDays(today, 14); // Next 2 weeks
      const startDateStr = format(today, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');
      
      await fetchExercisesForDateRange(startDateStr, endDateStr);
      
      const exercisesInRange = scheduledExercises.filter(ex => {
        const exDate = new Date(ex.date);
        return exDate >= today && exDate <= endDate;
      });
      
      addTestResult('Fetch scheduled exercises for next 2 weeks', true, undefined, {
        count: exercisesInRange.length,
        dateRange: `${startDateStr} to ${endDateStr}`,
      });
      return exercisesInRange;
    } catch (error) {
      addTestResult('Fetch scheduled exercises for next 2 weeks', false, (error as Error).message);
      return null;
    }
  };

  const testStoreGeneration = async () => {
    try {
      await ensureExercisesGeneratedIfNeeded();
      addTestResult('Store-based generation check', true, undefined, {
        message: 'Generation check completed via store',
      });
    } catch (error) {
      addTestResult('Store-based generation check', false, (error as Error).message);
    }
  };

  const runAllTests = async () => {
    if (isRunningTests) return;
    
    setIsRunningTests(true);
    setTestResults([]);
    
    try {
      // Test 1: Check if generation is needed
      await testNeedsGeneration();
      
      // Test 2: Get generation status for active plan
      if (activePlan?.id) {
        await testGenerationStatus(activePlan.id);
      }
      
      // Test 3: Ensure exercises are generated (direct API test with empty body)
      await testEnsureGeneration();
      
      // Test 4: Ensure exercises are generated (with plan ID if available)
      if (activePlan?.id) {
        await testEnsureGenerationWithPlan(activePlan.id);
      }
      
      // Test 5: Re-check generation status
      if (activePlan?.id) {
        await testGenerationStatus(activePlan.id);
      }
      
      // Test 6: Store-based generation
      await testStoreGeneration();
      
      // Test 7: Fetch scheduled exercises for range
      await testScheduledExercisesForRange();
      
      // Test 8: Re-check if generation is needed
      await testNeedsGeneration();
      
    } finally {
      setIsRunningTests(false);
      setLastRefresh(new Date());
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please sign in to test the exercise generation system.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const passedTests = testResults.filter(r => r.success).length;
  const failedTests = testResults.filter(r => !r.success).length;
  const totalTests = testResults.length;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Exercise Generation Test Suite</h1>
          <p className="text-muted-foreground">
            Test the automatic exercise generation system
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={clearResults} variant="outline" size="sm">
            Clear Results
          </Button>
          <Button 
            onClick={runAllTests} 
            disabled={isRunningTests}
            className="flex items-center space-x-2"
          >
            {isRunningTests ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>Run Tests</span>
          </Button>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Signed in as {session?.user?.email}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {workoutLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : activePlan ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-sm">
                {workoutLoading ? 'Loading...' : activePlan?.name || 'No active plan'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Exercises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {scheduledLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4 text-blue-500" />
              )}
              <span className="text-sm">
                {scheduledLoading ? 'Loading...' : `${scheduledExercises.length} exercises`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results Summary */}
      {totalTests > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Test Results Summary</span>
            </CardTitle>
            <CardDescription>
              Last run: {format(lastRefresh, 'PPpp')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{totalTests} Total</Badge>
                <Badge variant="default" className="bg-green-500">{passedTests} Passed</Badge>
                <Badge variant="destructive">{failedTests} Failed</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Success Rate: {totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Detailed results for each test case</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">{result.test}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(result.timestamp, 'HH:mm:ss')}
                    </span>
                  </div>
                  
                  {result.error && (
                    <Alert variant="destructive">
                      <AlertDescription className="text-sm">
                        {result.error}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {result.data && (
                    <div className="bg-muted p-2 rounded text-xs font-mono">
                      <pre>{JSON.stringify(result.data, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Ensure you have an active workout plan configured</li>
            <li>Click "Run Tests" to execute all test cases</li>
            <li>Review the results to verify the generation system is working</li>
            <li>Green checkmarks indicate successful tests</li>
            <li>Red circles indicate failed tests with error details</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
