"use client"

import Image from "next/image"
import Link from "next/link"
import { format, isBefore, startOfDay } from "date-fns"
import { Plus, Edit, Trash2, X, Save, Loader2, Timer } from "lucide-react"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExerciseCompletionToggle } from "@/components/ui/exercise-completion-toggle"
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog"

import { useWeightStore } from "@/lib/stores/weight-store"
import { useUserExercisePreferenceData } from "@/lib/hooks/data-hook/use-user-exercise-preference-data"
import { kgToLbs } from "@/lib/utils/weight-conversion"
import { WeightPlateSelector } from "@/components/weight-plate-selector"
import { useToast } from "@/lib/hooks/use-toast"
import { useExerciseDialogStore } from "@/lib/stores/exercise-dialog-store"
import { useExerciseData } from "@/lib/hooks/data-hook/use-exercise-data"
import { useScheduledExerciseData } from "@/lib/hooks/data-hook/use-scheduled-exercise-data"
import { useCalendarIntegration } from "@/lib/hooks/use-calendar-integration"


interface ExerciseDetailDialogProps {
  date: Date
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExerciseDetailDialog({ date, open, onOpenChange }: ExerciseDetailDialogProps) {
  const {
    exercises,
    categories
  } = useExerciseData()

  // Use the user exercise preference store for favorites
  const {
    preferences: favoriteExercises,
    isLoading: favoritesLoading,
    refetch: initializeFavorites
  } = useUserExercisePreferenceData()

  // Get the current date range to ensure we use the same query as calendar
  const { dateRange } = useCalendarIntegration();

  // Use the scheduled exercise store for scheduled exercises with same date range as calendar
  const {
    isLoading: scheduledLoading,
    error: scheduledError,
    selectors,
    exercises: allExercises,
    addExercise: addScheduledExercise,
    updateExercise: updateScheduledExercise,
    deleteExercise: deleteScheduledExercise
  } = useScheduledExerciseData(dateRange);

  // Filter exercises for the current date using selectors
  const dayExercises = selectors.byDate(date)

  // Track when exercises change to debug React re-renders
  useEffect(() => {
    // Silent effect for tracking exercises changes
  }, [allExercises, date]);

  // Use the new exercise dialog store
  const {
    // Form fields
    selectedCategoryId,
    selectedExerciseId,
    sets,
    reps,
    weight,
    weightPlates,
    
    // UI state
    activeTab,
    exerciseSelectionTab,
    editingExerciseId,
    isLoading: localIsLoading,
    
    // Actions
    setSelectedCategoryId,
    setSelectedExerciseId,
    setSets,
    setReps,
    setWeight,
    setWeightPlates,
    setActiveTab,
    setExerciseSelectionTab,
    setEditingExerciseId,
    
    // Business logic
    resetForm,
    loadExerciseForEditing,
    addExercise,
    updateExercise,
    deleteExercise,
    clearExercises,
    startEditingExercise,
    cancelEditing
  } = useExerciseDialogStore()
  
  // State for delete confirmation dialogs
  const [deleteDialogState, setDeleteDialogState] = useState({
    isOpen: false,
    exerciseId: "",
    deleteAll: false
  })

  const { weights, weightUnit } = useWeightStore()
  const { toast } = useToast()

  // Handle starting edit mode with immediate data loading
  const handleStartEditing = (exerciseId: string) => {
    const exercise = dayExercises.find((ex: any) => ex.id === exerciseId)
    if (exercise) {
      // Set the editing ID first
      setEditingExerciseId(exerciseId)
      // Load exercise data into the form
      loadExerciseForEditing(exercise, weightUnit)
      // Switch to edit tab
      setActiveTab('edit')
    }
  }

  // Helper function to get favorite exercises
  const getFavoriteExercises = () => {
    const favoriteExerciseIds = favoriteExercises.map((fav: any) => fav.exerciseId)
    return exercises.filter(exercise => favoriteExerciseIds.includes(exercise.id))
  }

  // Helper function to get exercises filtered by category
  const getFilteredExercises = (categoryId: string) => {
    const baseExercises = exerciseSelectionTab === 'favorites' 
      ? getFavoriteExercises() 
      : exercises
    
    return baseExercises.filter((ex) => ex.categoryId === categoryId)
  }

  // Helper function to get available categories (only show categories that have exercises)
  const getAvailableCategories = () => {
    const availableExercises = exerciseSelectionTab === 'favorites' 
      ? getFavoriteExercises() 
      : exercises
    
    const categoryIds = [...new Set(availableExercises.map(ex => ex.categoryId))]
    return categories.filter(cat => categoryIds.includes(cat.id))
  }

  // Handle add exercise
  const handleAddExercise = async () => {
    if (selectedExerciseId && sets && reps) {
      try {
        const exerciseData = await addExercise(date, weightUnit);
        if (exerciseData) {
          await addScheduledExercise(exerciseData);
          
          // Check if the exercise appears immediately with fresh data
          setTimeout(() => {
            // Success - exercise added
          }, 100);
        }
      } catch (error) {
        console.error('Error adding exercise:', error);
      }
    }
  }

  // Handle update exercise
  const handleUpdateExercise = async () => {
    if (editingExerciseId && selectedExerciseId && sets && reps) {
      try {
        const updateData = await updateExercise(weightUnit);
        if (updateData) {
          await updateScheduledExercise(updateData.id, updateData.updates);
        }
        toast({
          title: "Success",
          description: "Exercise updated successfully",
        })
      } catch (error) {
        toast({
          title: "Error", 
          description: "Failed to update exercise",
          variant: "destructive"
        })
      }
    } else {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
    }
  }

  // Format weight for display based on current unit
  const formatWeight = (weightInKg: number): string => {
    if (weightInKg === 0) return "Bodyweight"

    const value = weightUnit === "kg" ? weightInKg : kgToLbs(weightInKg)
    return `${value.toFixed(1)} ${weightUnit}`
  }

  // Handle weight plate selection
  const handleWeightPlateChange = (newWeightPlates: Record<string, number>) => {
    setWeightPlates(newWeightPlates)
    
    // Calculate total weight directly from the new plates to avoid timing issues
    let totalWeight = 0
    Object.entries(newWeightPlates).forEach(([plate, count]) => {
      totalWeight += Number.parseFloat(plate) * count
    })
    setWeight(totalWeight)
  }

  // Check if the selected date is in the past
  const isPastDate = isBefore(startOfDay(date), startOfDay(new Date()));

  // Check if the selected date is today
  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[98vh] flex flex-col" data-testid="exercise-detail-dialog">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title">Exercises for {format(date, "MMMM d, yyyy")}</DialogTitle>
        </DialogHeader>

        {scheduledError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{scheduledError}</AlertDescription>
          </Alert>
        )}

        {/* Mobile: Select dropdown */}
        <div className="sm:hidden mb-4">
          <Select 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'list' | 'add' | 'edit')}
          >
            <SelectTrigger className="w-full" data-testid="mobile-tab-selector">
              <SelectValue>
                {activeTab === 'list' && 'Scheduled Exercises'}
                {activeTab === 'add' && 'Add Exercise'}
                {activeTab === 'edit' && 'Edit Exercise'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent data-testid="mobile-tab-options">
              <SelectItem value="list" data-testid="mobile-tab-option-list">Scheduled Exercises</SelectItem>
              <SelectItem value="add" data-testid="mobile-tab-option-add">Add Exercise</SelectItem>
              <SelectItem value="edit" disabled={!editingExerciseId} data-testid="mobile-tab-option-edit">
                Edit Exercise
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'list' | 'add' | 'edit')} 
          className="flex-1 flex flex-col min-h-0">
          {/* Desktop: Regular tabs */}
          <TabsList className="hidden sm:grid sm:grid-cols-3 w-full mb-4" data-testid="desktop-tabs">
            <TabsTrigger value="list" data-testid="scheduled-exercises-tab">
              Scheduled Exercises
            </TabsTrigger>
            <TabsTrigger value="add" disabled={isPastDate} data-testid="add-exercise-tab">
              Add Exercise
            </TabsTrigger>
            <TabsTrigger value="edit" disabled={!editingExerciseId} data-testid="edit-exercise-tab">
              Edit Exercise
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="flex-1 flex flex-col min-h-0">
            {scheduledLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <p>Loading exercises...</p>
              </div>
            ) : (
              <>
                {dayExercises.length > 0 && (
                  <div className="flex justify-between items-center mb-4">
                    {/* Only show Start Workout button for today */}
                    {isToday && (
                      <Link href="/timer" onClick={() => onOpenChange(false)}>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                          data-testid="start-timer-link"
                        >
                          <Timer className="h-4 w-4 mr-1" />
                          Start Workout
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteDialogState({ isOpen: true, exerciseId: "", deleteAll: true })}
                      disabled={localIsLoading}
                      className={!isToday ? "ml-auto" : ""}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear All Exercises
                    </Button>
                  </div>
                )}
                <ScrollArea className="h-[550px] w-full rounded-md border p-4">
                  {dayExercises.length > 0 ? (
                    <div className="space-y-4" data-testid="exercise-list">
                      {dayExercises.map((scheduled: any) => {
                        const exercise = exercises.find((e) => e.id === scheduled.exerciseId)
                        const category = scheduled.categoryId ? categories.find((c) => c.id === scheduled.categoryId) : null

                        if (!exercise) return null

                        return (
                          <div key={scheduled.id} className="border rounded-lg p-4" data-testid="exercise-item">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  {category && (
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                                  )}
                                  <h4 className="font-medium">{exercise.name}</h4>
                                  <ExerciseCompletionToggle 
                                    exerciseId={scheduled.id}
                                    completed={scheduled.completed}
                                    completedAt={scheduled.completedAt}
                                    variant="badge"
                                    size="sm"
                                  />
                                </div>
                                <p className="text-sm text-muted-foreground">{category?.name || 'No category'}</p>
                                <p className="mt-2">
                                  {scheduled.sets} sets × {scheduled.reps} reps • {formatWeight(scheduled.weight)}
                                </p>

                                {/* Display weight plates if available */}
                                {scheduled.weightPlates && Object.keys(scheduled.weightPlates).length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {Object.entries(scheduled.weightPlates)
                                      .filter(([_, count]) => (count as number) > 0)
                                      .map(([plate, count]) => (
                                        <Badge key={plate} variant="outline" className="text-xs">
                                          {count as number}× {plate}
                                          {weightUnit}
                                        </Badge>
                                      ))}
                                  </div>
                                )}
                              </div>

                              {exercise.imageUrl && (
                                <div className="relative w-16 h-16 rounded-md overflow-hidden ml-2">
                                  <Image
                                    src={exercise.imageUrl || "/placeholder.svg"}
                                    alt={exercise.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                            </div>

                            <div className="flex justify-between items-center gap-2 mt-2">
                              <div>
                                <ExerciseCompletionToggle 
                                  exerciseId={scheduled.id}
                                  completed={scheduled.completed}
                                  completedAt={scheduled.completedAt}
                                  variant="button"
                                  size="sm"
                                  showTimestamp={true}
                                />
                              </div>
                              
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleStartEditing(scheduled.id)}
                                  disabled={localIsLoading}
                                  data-testid="edit-exercise-btn"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteDialogState({ isOpen: true, exerciseId: scheduled.id, deleteAll: false })}
                                  className="text-destructive"
                                  disabled={localIsLoading}
                                  data-testid="delete-exercise-btn"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground" data-testid="no-exercises">No exercises scheduled for this day</div>
                  )}
                  <ScrollBar />
                </ScrollArea>
              </>
            )}
          </TabsContent>

          <TabsContent value="add" className="flex-1 flex flex-col min-h-0" data-testid="add-exercise-content">
            {/* Exercise Selection Tabs */}
            <div className="mb-4">
              <Tabs 
                value={exerciseSelectionTab} 
                onValueChange={(value) => setExerciseSelectionTab(value as 'favorites' | 'all')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="favorites" className="flex items-center gap-2" data-testid="favorites-tab">
                    ❤️ Favorites
                    {favoriteExercises.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 text-xs">
                        {favoriteExercises.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="all" data-testid="all-exercises-tab">
                    📋 All Exercises
                    <Badge variant="secondary" className="ml-1 h-5 text-xs">
                      {exercises.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <ScrollArea className="h-[500px] w-full rounded-md border p-4">
              <div className="grid gap-6">
                {exerciseSelectionTab === 'favorites' && favoriteExercises.length === 0 && !favoritesLoading && (
                  <div className="text-center py-8 text-muted-foreground" data-testid="favorites-content">
                    <div data-testid="no-favorites-message">
                      <p className="text-lg mb-2">No favorite exercises yet</p>
                      <p className="text-sm">Switch to "All Exercises" to browse and mark exercises as favorites</p>
                    </div>
                  </div>
                )}
                
                {favoritesLoading && exerciseSelectionTab === 'favorites' && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <p>Loading favorites...</p>
                  </div>
                )}

                {favoriteExercises.length > 0 && exerciseSelectionTab === 'favorites' && (
                  <div data-testid="favorites-content">
                    {/* Favorites content will go here */}
                  </div>
                )}

                {((exerciseSelectionTab === 'favorites' && favoriteExercises.length > 0) || 
                  (exerciseSelectionTab === 'all')) && (
                  <>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} data-testid="exercise-category">
                            <SelectTrigger id="category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableCategories().map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                                    {category.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="exercise">Exercise</Label>
                          <Select
                            value={selectedExerciseId}
                            onValueChange={setSelectedExerciseId}
                            disabled={!selectedCategoryId}
                            data-testid="exercise-option"
                          >
                            <SelectTrigger id="exercise">
                              <SelectValue placeholder="Select exercise" />
                            </SelectTrigger>
                            <SelectContent>
                              {getFilteredExercises(selectedCategoryId).map((exercise) => (
                                <SelectItem key={exercise.id} value={exercise.id}>
                                  <div className="flex items-center gap-2">
                                    {exercise.imageUrl && (
                                      <div className="relative w-6 h-6 rounded overflow-hidden">
                                        <Image
                                          src={exercise.imageUrl}
                                          alt={exercise.name}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                    )}
                                    {exercise.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sets">Sets</Label>
                          <Input
                            id="sets"
                            type="number"
                            min="1"
                            value={sets}
                            onChange={(e) => setSets(Number(e.target.value))}
                            placeholder="3"
                            data-testid="sets-input"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="reps">Reps</Label>
                          <Input
                            id="reps"
                            type="number"
                            min="1"
                            value={reps}
                            onChange={(e) => setReps(Number(e.target.value))}
                            placeholder="12"
                            data-testid="reps-input"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="weight">Weight ({weightUnit})</Label>
                          <Input
                            id="weight"
                            type="number"
                            min="0"
                            step="0.1"
                            value={weight}
                            onChange={(e) => setWeight(Number(e.target.value))}
                            placeholder="0"
                            data-testid="weight-input"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Weight Plates ({weightUnit})</Label>
                        <WeightPlateSelector
                          value={weightPlates}
                          onChange={handleWeightPlateChange}
                          weights={weights}
                          unit={weightUnit}
                          data-testid="weight-plate-selector"
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleAddExercise} 
                      disabled={!selectedExerciseId || !sets || !reps || localIsLoading || scheduledLoading} 
                      className="w-full"
                      data-testid="save-exercise"
                    >
                      {localIsLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding Exercise...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Exercise
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
              <ScrollBar />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="edit" className="flex-1 flex flex-col min-h-0">
            {editingExerciseId && (
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-sets">Sets</Label>
                      <Input
                        id="edit-sets"
                        type="number"
                        min="1"
                        value={sets}
                        onChange={(e) => setSets(Number(e.target.value))}
                        placeholder="3"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-reps">Reps</Label>
                      <Input
                        id="edit-reps"
                        type="number"
                        min="1"
                        value={reps}
                        onChange={(e) => setReps(Number(e.target.value))}
                        placeholder="12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-weight">Weight ({weightUnit})</Label>
                      <Input
                        id="edit-weight"
                        type="number"
                        min="0"
                        step="0.1"
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Weight Plates ({weightUnit})</Label>
                    <WeightPlateSelector
                      value={weightPlates}
                      onChange={handleWeightPlateChange}
                      weights={weights}
                      unit={weightUnit}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={cancelEditing} className="flex-1">
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateExercise} disabled={localIsLoading} className="flex-1" data-testid="update-exercise">
                      {localIsLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <ScrollBar />
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogState.isOpen}
        onClose={() => setDeleteDialogState({ isOpen: false, exerciseId: "", deleteAll: false })}
        onConfirm={async () => {
          if (deleteDialogState.deleteAll) {
            const clearData = await clearExercises(date);
            // Handle clearing all exercises for the date if needed
            // This would require implementing a bulk delete API
          } else if (deleteDialogState.exerciseId) {
            const deleteData = await deleteExercise(deleteDialogState.exerciseId);
            if (deleteData) {
              await deleteScheduledExercise(deleteData.id);
            }
          }
        }}
        title={deleteDialogState.deleteAll ? "Clear All Exercises" : "Delete Exercise"}
        description={
          deleteDialogState.deleteAll 
            ? "Are you sure you want to delete all exercises scheduled for this day? This action cannot be undone."
            : "Are you sure you want to delete this exercise? This action cannot be undone."
        }
        confirmText={deleteDialogState.deleteAll ? "Clear All" : "Delete"}
        isLoading={localIsLoading}
      />
    </Dialog>
  )
}
