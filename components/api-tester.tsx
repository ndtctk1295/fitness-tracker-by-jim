'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useApiTester } from '@/lib/hooks/use-api-tester';
import { useExerciseStore } from '@/lib/stores/exercise-store';

interface ApiTesterProps {
  className?: string;
}

export function ApiTester({ className }: ApiTesterProps) {
  const {
    isLoading,
    results,
    error,
    testFetchAll,
    testFetchByDate,
    testFetchByDateRange,
    testCreate,
    testUpdate,
    testDelete,
    testDeleteByDate,
  } = useApiTester();

  const { exercises, categories } = useExerciseStore();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  const [exerciseId, setExerciseId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('12');
  const [weight, setWeight] = useState('0');
  
  const [updateId, setUpdateId] = useState('');
  const [deleteId, setDeleteId] = useState('');

  // Format a date for API calls
  const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

  // Handle fetch by date
  const handleFetchByDate = () => {
    testFetchByDate(formatDate(selectedDate));
  };

  // Handle fetch by date range
  const handleFetchByDateRange = () => {
    testFetchByDateRange(formatDate(startDate), formatDate(endDate));
  };

  // Handle create exercise
  const handleCreateExercise = () => {
    testCreate({
      exerciseId,
      categoryId,
      date: formatDate(selectedDate),
      sets: parseInt(sets),
      reps: parseInt(reps),
      weight: parseFloat(weight),
    });
  };

  // Handle update exercise
  const handleUpdateExercise = () => {
    testUpdate(updateId, {
      sets: parseInt(sets),
      reps: parseInt(reps),
      weight: parseFloat(weight),
    });
  };

  // Handle delete exercise
  const handleDeleteExercise = () => {
    testDelete(deleteId);
  };

  // Handle delete by date
  const handleDeleteByDate = () => {
    testDeleteByDate(formatDate(selectedDate));
  };

  // Format results for display
  const formatResults = (data: any) => {
    return JSON.stringify(data, null, 2);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>API Integration Tester</CardTitle>
        <CardDescription>
          Test the scheduled exercises API integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="fetch">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="fetch">Fetch</TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="update">Update</TabsTrigger>
            <TabsTrigger value="delete">Delete</TabsTrigger>
          </TabsList>
          
          {/* Fetch Tab */}
          <TabsContent value="fetch" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Button onClick={testFetchAll} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Fetch All Exercises
              </Button>
              
              <Separator className="my-2" />
              
              <div>
                <Label>Select Date</Label>
                <div className="flex flex-col items-center mt-2">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                  />
                </div>
                <Button 
                  onClick={handleFetchByDate} 
                  disabled={isLoading} 
                  className="w-full mt-2"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Fetch By Date ({formatDate(selectedDate)})
                </Button>
              </div>
              
              <Separator className="my-2" />
              
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Start Date</Label>
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      className="border rounded-md"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End Date</Label>
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      className="border rounded-md"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleFetchByDateRange} 
                  disabled={isLoading} 
                  className="w-full mt-2"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Fetch By Date Range
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Create Tab */}
          <TabsContent value="create" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="exercise">Exercise</Label>
                  <select 
                    id="exercise"
                    className="w-full p-2 border rounded"
                    value={exerciseId}
                    onChange={(e) => setExerciseId(e.target.value)}
                  >
                    <option value="">Select Exercise</option>
                    {exercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="w-full p-2 border rounded"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <Label>Select Date</Label>
                <div className="flex flex-col items-center mt-2">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="sets">Sets</Label>
                  <Input
                    id="sets"
                    type="number"
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reps">Reps</Label>
                  <Input
                    id="reps"
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleCreateExercise} 
                disabled={isLoading || !exerciseId || !categoryId} 
                className="mt-2"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Exercise
              </Button>
            </div>
          </TabsContent>
          
          {/* Update Tab */}
          <TabsContent value="update" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="updateId">Exercise ID to Update</Label>
                <Input
                  id="updateId"
                  placeholder="Enter exercise ID"
                  value={updateId}
                  onChange={(e) => setUpdateId(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="updateSets">Sets</Label>
                  <Input
                    id="updateSets"
                    type="number"
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="updateReps">Reps</Label>
                  <Input
                    id="updateReps"
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="updateWeight">Weight (kg)</Label>
                  <Input
                    id="updateWeight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleUpdateExercise} 
                disabled={isLoading || !updateId} 
                className="mt-2"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update Exercise
              </Button>
            </div>
          </TabsContent>
          
          {/* Delete Tab */}
          <TabsContent value="delete" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deleteId">Exercise ID to Delete</Label>
                <Input
                  id="deleteId"
                  placeholder="Enter exercise ID"
                  value={deleteId}
                  onChange={(e) => setDeleteId(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleDeleteExercise} 
                disabled={isLoading || !deleteId} 
                className="mt-2"
                variant="destructive"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete Exercise
              </Button>
              
              <Separator className="my-2" />
              
              <div>
                <Label>Delete All Exercises for Date</Label>
                <div className="flex flex-col items-center mt-2">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                  />
                </div>
                <Button 
                  onClick={handleDeleteByDate} 
                  disabled={isLoading} 
                  className="w-full mt-2"
                  variant="destructive"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Delete All for {formatDate(selectedDate)}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <Separator className="my-4" />
        
        {/* Results Display */}
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Results:</h3>
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading...</span>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : results ? (
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <pre className="text-xs">{formatResults(results)}</pre>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Run a test to see results
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
