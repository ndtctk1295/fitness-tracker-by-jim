'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { workoutPlanService } from '@/lib/services/workout-plan-service';

interface TestResult {
  testName: string;
  success: boolean;
  message: string;
  data?: any;
  timestamp: string;
}

export default function WorkoutPlanTesterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [createdPlanId, setCreatedPlanId] = useState<string | null>(null);

  const addTestResult = (testName: string, success: boolean, message: string, data?: any) => {
    const result: TestResult = {
      testName,
      success,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    setTestResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setTestResults([]);
    setCreatedPlanId(null);
  };

  // Test GET all workout plans
  const testGetAllPlans = async () => {
    setIsLoading(true);
    try {
      const plans = await workoutPlanService.getAll();
      addTestResult('GET All Plans', true, `Retrieved ${plans.length} workout plans`, plans);
    } catch (error: any) {
      addTestResult('GET All Plans', false, `Error: ${error.message}`, error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  // Test GET active workout plan
  const testGetActivePlan = async () => {
    setIsLoading(true);
    try {
      const activePlan = await workoutPlanService.getActive();
      addTestResult('GET Active Plan', true, activePlan ? 'Found active plan' : 'No active plan', activePlan);
    } catch (error: any) {
      addTestResult('GET Active Plan', false, `Error: ${error.message}`, error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  // Test CREATE workout plan
  const testCreatePlan = async () => {
    setIsLoading(true);
    try {      const samplePlan = {
        name: 'Test Workout Plan ' + Date.now(),
        description: 'A test workout plan created from the tester',
        level: 'beginner' as const,
        duration: 4,
        mode: 'ongoing' as const,
        isActive: false,        weeklyTemplate: [
          {
            dayOfWeek: 0 as const,
            name: 'Rest Day',
            exerciseTemplates: []
          },
          {
            dayOfWeek: 1 as const,
            name: 'Upper Body',            exerciseTemplates: [
              {
                exerciseId: '683fe7671c731e274af9fb42', // Push-ups ID from seeded data
                sets: 3,
                reps: 12,
                weight: 50,
                orderIndex: 0
              }
            ]
          },
          {
            dayOfWeek: 2 as const,
            name: 'Rest Day',
            exerciseTemplates: []
          },
          {
            dayOfWeek: 3 as const,
            name: 'Lower Body',            exerciseTemplates: [
              {
                exerciseId: '683fe7671c731e274af9fb44', // Pull-ups ID from seeded data
                sets: 3,
                reps: 10,
                weight: 60,
                orderIndex: 0
              }
            ]
          },
          {
            dayOfWeek: 4 as const,
            name: 'Rest Day',
            exerciseTemplates: []
          },
          {
            dayOfWeek: 5 as const,
            name: 'Full Body',
            exerciseTemplates: []
          },
          {
            dayOfWeek: 6 as const,
            name: 'Rest Day',
            exerciseTemplates: []
          }
        ]
      };      const created = await workoutPlanService.create(samplePlan);
      setCreatedPlanId(created._id || created.id || null);
      addTestResult('CREATE Plan', true, `Created plan with ID: ${created._id || created.id}`, created);
    } catch (error: any) {
      addTestResult('CREATE Plan', false, `Error: ${error.message}`, error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  // Test UPDATE workout plan
  const testUpdatePlan = async () => {
    if (!createdPlanId) {
      addTestResult('UPDATE Plan', false, 'No created plan ID available');
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        name: 'Updated Test Plan ' + Date.now(),
        description: 'Updated description from tester'
      };

      const updated = await workoutPlanService.update(createdPlanId, updateData);
      addTestResult('UPDATE Plan', true, `Updated plan ${createdPlanId}`, updated);
    } catch (error: any) {
      addTestResult('UPDATE Plan', false, `Error: ${error.message}`, error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  // Test ACTIVATE workout plan
  const testActivatePlan = async () => {
    if (!createdPlanId) {
      addTestResult('ACTIVATE Plan', false, 'No created plan ID available');
      return;
    }

    setIsLoading(true);
    try {
      const result = await workoutPlanService.activate(createdPlanId);
      addTestResult('ACTIVATE Plan', true, `Activated plan ${createdPlanId}`, result);
    } catch (error: any) {
      addTestResult('ACTIVATE Plan', false, `Error: ${error.message}`, error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  // Test DEACTIVATE workout plan
  const testDeactivatePlan = async () => {
    if (!createdPlanId) {
      addTestResult('DEACTIVATE Plan', false, 'No created plan ID available');
      return;
    }

    setIsLoading(true);
    try {
      const result = await workoutPlanService.deactivate(createdPlanId);
      addTestResult('DEACTIVATE Plan', true, `Deactivated plan ${createdPlanId}`, result);
    } catch (error: any) {
      addTestResult('DEACTIVATE Plan', false, `Error: ${error.message}`, error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  // Test DUPLICATE workout plan
  const testDuplicatePlan = async () => {
    if (!createdPlanId) {
      addTestResult('DUPLICATE Plan', false, 'No created plan ID available');
      return;
    }

    setIsLoading(true);
    try {
      const duplicated = await workoutPlanService.duplicate(createdPlanId, 'Duplicated Test Plan');
      addTestResult('DUPLICATE Plan', true, `Duplicated plan to ID: ${duplicated._id || duplicated.id}`, duplicated);
    } catch (error: any) {
      addTestResult('DUPLICATE Plan', false, `Error: ${error.message}`, error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };
  // Test CHECK CONFLICTS
  const testCheckConflicts = async () => {
    if (!createdPlanId) {
      addTestResult('CHECK Conflicts', false, 'No created plan ID available');
      return;
    }

    setIsLoading(true);
    try {
      const result = await workoutPlanService.checkConflicts(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        createdPlanId
      );
      addTestResult('CHECK Conflicts', true, `Checked conflicts for plan ${createdPlanId}`, result);
    } catch (error: any) {
      addTestResult('CHECK Conflicts', false, `Error: ${error.message}`, error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  // Test GENERATE EXERCISES
  const testGenerateExercises = async () => {
    setIsLoading(true);
    try {
      const result = await workoutPlanService.generateScheduledExercises(
        new Date('2024-01-01'),
        new Date('2024-01-07')
      );
      addTestResult('GENERATE Exercises', true, `Generated exercises from active plan`, result);
    } catch (error: any) {
      addTestResult('GENERATE Exercises', false, `Error: ${error.message}`, error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  // Test DELETE workout plan
  const testDeletePlan = async () => {
    if (!createdPlanId) {
      addTestResult('DELETE Plan', false, 'No created plan ID available');
      return;
    }

    setIsLoading(true);
    try {
      const result = await workoutPlanService.delete(createdPlanId);
      addTestResult('DELETE Plan', true, `Deleted plan ${createdPlanId}`, { deleted: result });
      setCreatedPlanId(null);
    } catch (error: any) {
      addTestResult('DELETE Plan', false, `Error: ${error.message}`, error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  // Run all tests in sequence
  const runAllTests = async () => {
    clearResults();
    setIsLoading(true);

    const tests = [
      testGetAllPlans,
      testGetActivePlan,
      testCreatePlan,
      () => new Promise(resolve => setTimeout(resolve, 500)), // Small delay
      testUpdatePlan,
      testActivatePlan,
      testDeactivatePlan,
      testDuplicatePlan,
      testCheckConflicts,
      testGenerateExercises,
      testDeletePlan
    ];

    for (const test of tests) {
      if (typeof test === 'function') {
        await test();
      }
    }

    setIsLoading(false);
  };

  const successCount = testResults.filter(r => r.success).length;
  const totalCount = testResults.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workout Plan API Tester</CardTitle>
          <CardDescription>
            Test all workout plan API endpoints with proper authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Control Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button onClick={testGetAllPlans} disabled={isLoading} variant="outline">
              GET All
            </Button>
            <Button onClick={testGetActivePlan} disabled={isLoading} variant="outline">
              GET Active
            </Button>
            <Button onClick={testCreatePlan} disabled={isLoading} variant="outline">
              CREATE
            </Button>
            <Button onClick={testUpdatePlan} disabled={isLoading || !createdPlanId} variant="outline">
              UPDATE
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button onClick={testActivatePlan} disabled={isLoading || !createdPlanId} variant="outline">
              ACTIVATE
            </Button>
            <Button onClick={testDeactivatePlan} disabled={isLoading || !createdPlanId} variant="outline">
              DEACTIVATE
            </Button>
            <Button onClick={testDuplicatePlan} disabled={isLoading || !createdPlanId} variant="outline">
              DUPLICATE
            </Button>
            <Button onClick={testCheckConflicts} disabled={isLoading || !createdPlanId} variant="outline">
              CONFLICTS
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">            <Button onClick={testGenerateExercises} disabled={isLoading} variant="outline">
              GENERATE
            </Button>
            <Button onClick={testDeletePlan} disabled={isLoading || !createdPlanId} variant="destructive">
              DELETE
            </Button>
            <Button onClick={runAllTests} disabled={isLoading} className="col-span-1">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              RUN ALL
            </Button>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <Button onClick={clearResults} variant="ghost" size="sm">
              Clear Results
            </Button>
            {totalCount > 0 && (
              <div className="text-sm text-muted-foreground">
                Success Rate: {totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0}% 
                ({successCount}/{totalCount})
              </div>
            )}
          </div>

          {createdPlanId && (
            <Alert>
              <AlertDescription>
                Created Plan ID: <code>{createdPlanId}</code>
              </AlertDescription>
            </Alert>
          )}

          {/* Results Display */}
          <ScrollArea className="h-[400px] rounded-md border p-4">
            {testResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Run tests to see results
              </div>
            ) : (
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index} className="border-b pb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{result.testName}</span>
                      <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                        {result.success ? '✅' : '❌'}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {result.message}
                    </div>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer">View Data</summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
