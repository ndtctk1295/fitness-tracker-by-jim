'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, UserIcon, CopyIcon, Trash2Icon, CheckIcon, XIcon, RefreshCwIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import { useAdminScheduledExercises } from '@/lib/hooks/use-admin-scheduled-exercises';
import { useExerciseStore } from '@/lib/stores/exercise-store';
import { cn } from '@/lib/utils';

export interface AdminApiTesterProps {
  className?: string;
}

export function AdminApiTester({ className }: AdminApiTesterProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  const [userId, setUserId] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [activeTab, setActiveTab] = useState('view');
  
  const { exercises, categories } = useExerciseStore();
  
  const {
    exercises: adminExercises,
    isLoading,
    error,
    reloadExercises,
    getExercisesForUser,
    getExercisesForDate,
    createExercise,
    updateExercise,
    deleteExercise,
    updateExercisesStatus,
    copyExercisesBetweenUsers,
    clearExercisesForUser,
    clearExercisesForDate
  } = useAdminScheduledExercises({
    initialLoad: true
  });
  
  // Group exercises by user
  const exercisesByUser: Record<string, typeof adminExercises> = {};
  adminExercises.forEach(exercise => {
    if (!exercisesByUser[exercise.userId]) {
      exercisesByUser[exercise.userId] = [];
    }
    exercisesByUser[exercise.userId].push(exercise);
  });
  
  // For the form
  const [newExerciseData, setNewExerciseData] = useState({
    userId: '',
    exerciseId: '',
    categoryId: '',
    sets: 3,
    reps: 10,
    weight: 0
  });
  
  const handleLoadUserExercises = () => {
    if (userId) {
      getExercisesForUser(userId);
    }
  };
  
  const handleLoadDateExercises = () => {
    getExercisesForDate(selectedDate);
  };
  
  const handleClearUserExercises = () => {
    if (userId && window.confirm(`Are you sure you want to delete ALL exercises for user ${userId}?`)) {
      clearExercisesForUser(userId);
    }
  };
  
  const handleClearDateExercises = () => {
    if (window.confirm(`Are you sure you want to delete ALL exercises for date ${format(selectedDate, 'PPP')}?`)) {
      clearExercisesForDate(selectedDate);
    }
  };
  
  const handleCopyBetweenUsers = () => {
    if (userId && targetUserId) {
      copyExercisesBetweenUsers(userId, targetUserId, selectedDate, targetDate);
    }
  };
  
  const handleCreateExercise = () => {
    if (newExerciseData.userId && newExerciseData.exerciseId && newExerciseData.categoryId) {
      createExercise({
        userId: newExerciseData.userId,
        exerciseId: newExerciseData.exerciseId,
        categoryId: newExerciseData.categoryId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        sets: newExerciseData.sets,
        reps: newExerciseData.reps,
        weight: newExerciseData.weight
      });
    }
  };
  
  const handleCompleteAll = (userId: string) => {
    const userExerciseIds = exercisesByUser[userId]?.map(ex => ex._id) || [];
    if (userExerciseIds.length > 0) {
      updateExercisesStatus(userExerciseIds, true);
    }
  };
  
  const handleResetAll = (userId: string) => {
    const userExerciseIds = exercisesByUser[userId]?.map(ex => ex._id) || [];
    if (userExerciseIds.length > 0) {
      updateExercisesStatus(userExerciseIds, false);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Exercise Management</h2>
        <Button variant="outline" onClick={reloadExercises} disabled={isLoading}>
          <RefreshCwIcon className="h-4 w-4 mr-2" />
          Reload
        </Button>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-md border border-red-200">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Filter Controls</CardTitle>
            <CardDescription>Filter exercises by user or date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="userId">User ID</Label>
              <div className="flex gap-2 mt-1">
                <Input 
                  id="userId" 
                  value={userId} 
                  onChange={(e) => setUserId(e.target.value)} 
                  placeholder="Enter user ID" 
                />
                <Button onClick={handleLoadUserExercises} disabled={!userId || isLoading}>
                  Load
                </Button>
              </div>
            </div>
            
            <div>
              <Label>Date</Label>
              <div className="flex flex-col gap-2 mt-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button onClick={handleLoadDateExercises} disabled={isLoading}>
                  Load by Date
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Admin Operations</CardTitle>
            <CardDescription>Perform administrative operations on exercises</CardDescription>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="view">View</TabsTrigger>
                <TabsTrigger value="create">Create</TabsTrigger>
                <TabsTrigger value="batch">Batch Operations</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent>
            <TabsContent value="view" className="mt-0">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-[125px] w-full rounded-md" />
                  <Skeleton className="h-[125px] w-full rounded-md" />
                  <Skeleton className="h-[125px] w-full rounded-md" />
                </div>
              ) : Object.keys(exercisesByUser).length === 0 ? (
                <div className="text-center p-6 border rounded-md">
                  <p className="text-muted-foreground">No exercises found. Try loading exercises for a user or date.</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(exercisesByUser).map(([userId, userExercises]) => (
                    <AccordionItem key={userId} value={userId}>
                      <AccordionTrigger className="hover:bg-accent hover:text-accent-foreground rounded-md px-2 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          <span>
                            User: {userExercises[0]?.userName || userId}
                          </span>
                          <Badge variant="outline" className="ml-2">
                            {userExercises.length} exercises
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pl-2">
                          <div className="flex gap-2 mb-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleCompleteAll(userId)}
                              className="flex-1"
                            >
                              <CheckIcon className="h-3.5 w-3.5 mr-1" />
                              Mark All Complete
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleResetAll(userId)}
                              className="flex-1"
                            >
                              <XIcon className="h-3.5 w-3.5 mr-1" />
                              Mark All Incomplete
                            </Button>
                          </div>
                          
                          <ScrollArea className="h-[300px]">
                            <div className="space-y-2">
                              {userExercises.map(exercise => (
                                <div 
                                  key={exercise._id} 
                                  className="p-2 border rounded-md flex justify-between items-center"
                                >
                                  <div>
                                    <div className="font-medium">Exercise ID: {exercise.exerciseId}</div>
                                    <div className="text-sm text-muted-foreground">
                                      Date: {format(new Date(exercise.date), 'MMM d, yyyy')}
                                    </div>
                                    <div className="text-sm">
                                      {exercise.sets} sets × {exercise.reps} reps • {exercise.weight} kg                                      {exercise.completed && (
                                        <Badge variant="secondary" className="ml-2">Completed</Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => updateExercise(exercise._id, { 
                                        completed: !exercise.completed 
                                      })}
                                    >
                                      {exercise.completed ? (
                                        <XIcon className="h-4 w-4" />
                                      ) : (
                                        <CheckIcon className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => deleteExercise(exercise._id)}
                                    >
                                      <Trash2Icon className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                          
                          <Button 
                            variant="destructive" 
                            className="w-full mt-4"
                            onClick={() => handleClearUserExercises()}
                          >
                            <Trash2Icon className="h-4 w-4 mr-2" />
                            Clear All Exercises for User
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </TabsContent>
            
            <TabsContent value="create" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newUserId">User ID</Label>
                  <Input 
                    id="newUserId" 
                    value={newExerciseData.userId} 
                    onChange={(e) => setNewExerciseData({...newExerciseData, userId: e.target.value})}
                    placeholder="Enter user ID" 
                  />
                </div>
                
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left w-full"
                        id="date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedDate, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoryId">Category</Label>
                  <Select 
                    value={newExerciseData.categoryId}
                    onValueChange={(value) => setNewExerciseData({...newExerciseData, categoryId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="exerciseId">Exercise</Label>
                  <Select 
                    value={newExerciseData.exerciseId}
                    onValueChange={(value) => setNewExerciseData({...newExerciseData, exerciseId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exercise" />
                    </SelectTrigger>
                    <SelectContent>
                      {exercises
                        .filter(e => !newExerciseData.categoryId || e.categoryId === newExerciseData.categoryId)
                        .map(exercise => (
                          <SelectItem key={exercise.id} value={exercise.id}>
                            {exercise.name}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sets">Sets</Label>
                  <Input 
                    id="sets" 
                    type="number" 
                    value={newExerciseData.sets}
                    onChange={(e) => setNewExerciseData({
                      ...newExerciseData, 
                      sets: parseInt(e.target.value) || 0
                    })}
                    min={0}
                  />
                </div>
                
                <div>
                  <Label htmlFor="reps">Reps</Label>
                  <Input 
                    id="reps" 
                    type="number" 
                    value={newExerciseData.reps}
                    onChange={(e) => setNewExerciseData({
                      ...newExerciseData, 
                      reps: parseInt(e.target.value) || 0
                    })}
                    min={0}
                  />
                </div>
                
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input 
                    id="weight" 
                    type="number" 
                    value={newExerciseData.weight}
                    onChange={(e) => setNewExerciseData({
                      ...newExerciseData, 
                      weight: parseInt(e.target.value) || 0
                    })}
                    min={0}
                  />
                </div>
              </div>
              
              <Button 
                className="w-full mt-6" 
                onClick={handleCreateExercise}
                disabled={!newExerciseData.userId || !newExerciseData.exerciseId || !newExerciseData.categoryId}
              >
                Create Exercise
              </Button>
            </TabsContent>
            
            <TabsContent value="batch" className="space-y-6 mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Copy Between Users</CardTitle>
                  <CardDescription>Copy exercises from one user to another</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sourceUserId">Source User ID</Label>
                      <Input 
                        id="sourceUserId" 
                        value={userId} 
                        onChange={(e) => setUserId(e.target.value)} 
                        placeholder="User to copy from" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetUserId">Target User ID</Label>
                      <Input 
                        id="targetUserId" 
                        value={targetUserId} 
                        onChange={(e) => setTargetUserId(e.target.value)} 
                        placeholder="User to copy to" 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sourceDate">Source Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="justify-start text-left w-full"
                            id="sourceDate"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(selectedDate, 'PPP')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="targetDate">Target Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="justify-start text-left w-full"
                            id="targetDate"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(targetDate, 'PPP')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={targetDate}
                            onSelect={(date) => date && setTargetDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleCopyBetweenUsers}
                    disabled={!userId || !targetUserId}
                  >
                    <CopyIcon className="h-4 w-4 mr-2" />
                    Copy Exercises
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Bulk Operations</CardTitle>
                  <CardDescription>Perform operations on multiple exercises</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="clearDate">Clear Date</Label>
                    <div className="flex gap-2 mt-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="justify-start text-left flex-1"
                            id="clearDate"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(selectedDate, 'PPP')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Button 
                        variant="destructive" 
                        onClick={handleClearDateExercises}
                      >
                        <Trash2Icon className="h-4 w-4 mr-2" />
                        Clear All For Date
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
