'use client'

import { useState, useEffect, useMemo } from 'react'
import { Loader2, AlertCircle, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useExerciseStore } from '@/lib/stores/exercise-store'
import { useUserExercisePreferenceStore } from '@/lib/stores/user-exercise-preference-store'
import { ExerciseCard } from '@/components/exercises/exercise-card'
import { ExerciseFilters, type ExerciseFilters as ExerciseFiltersType } from '@/components/exercises/exercise-filters'
import { UserExerciseSections } from '@/components/exercises/user-exercise-sections'
import { Exercise, Category, StoreExercise, StoreCategory } from '@/lib/types'


export default function ExercisesPage() {const { 
    categories,
    exercises, 
    isLoading: exercisesLoading, 
    error: exercisesError, 
    initializeStore
  } = useExerciseStore()
  
  const { 
    preferences, 
    isLoading: preferencesLoading,
    initializeStore: initializePreferences 
  } = useUserExercisePreferenceStore()

  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<ExerciseFiltersType>({
    difficulty: [],
    muscleGroups: [],
    equipment: [],
    category: 'all'  })

  // Fetch data on component mount
  useEffect(() => {
    initializeStore()
    initializePreferences()
  }, [initializeStore, initializePreferences])

  // Update filters when activeTab changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, category: activeTab }))
  }, [activeTab])

  const isLoading = exercisesLoading || preferencesLoading
  
  // Display loading state when data is being fetched
  if (isLoading && exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading exercises data...</p>
      </div>
    )
  }
  
  // Display error state if there's any error with data
  if (exercisesError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was a problem loading exercise data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    )
  }

  // Filter exercises based on all criteria
  const filteredExercises = useMemo(() => {
    let result = exercises.filter((exercise: StoreExercise) => exercise.isActive !== false)

    // Search filter
    if (searchQuery.trim()) {      const query = searchQuery.toLowerCase()
      result = result.filter((exercise: StoreExercise) => 
        exercise.name.toLowerCase().includes(query) ||
        exercise.description?.toLowerCase().includes(query) ||
        exercise.instructions?.some((instruction: string) => instruction.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      result = result.filter((exercise: StoreExercise) => exercise.categoryId === filters.category)
    }

    // Difficulty filter
    if (filters.difficulty.length > 0) {      result = result.filter((exercise: StoreExercise) => 
        exercise.difficulty && filters.difficulty.includes(exercise.difficulty)
      )
    }

    // Muscle groups filter
    if (filters.muscleGroups.length > 0) {      result = result.filter((exercise: StoreExercise) => 
        exercise.muscleGroups?.some((muscle: string) => filters.muscleGroups.includes(muscle))
      )
    }

    // Equipment filter
    if (filters.equipment.length > 0) {      result = result.filter((exercise: StoreExercise) => 
        exercise.equipment?.some((equip: string) => filters.equipment.includes(equip))
      )
    }

    return result
  }, [exercises, searchQuery, filters])

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      difficulty: [],
      muscleGroups: [],
      equipment: [],
      category: 'all'
    })
    setActiveTab('all')
    setSearchQuery('')
  }

  // Get display name for select component
  const getDisplayName = () => {
    if (activeTab === 'all') {
      return 'All Exercises'
    }
    const category = categories.find((cat: StoreCategory) => cat.id === activeTab)
    return category?.name || 'All Exercises'
  }

  return (
    <div className="py-10">      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Exercise Library</h1>
        <p className="text-muted-foreground">
          Browse and manage your exercise collection with personalized preferences.
        </p>
      </div>

      {/* User Exercise Preferences Sections */}
      <UserExerciseSections />

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises by name, description, or instructions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Exercise Filters */}
      <ExerciseFilters
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
        onClearFilters={handleClearFilters}
      />
      
      {/* Mobile Select Component - Hidden on md and larger screens */}
      <div className="sm:hidden mb-4">
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="w-full">
            <SelectValue>{getDisplayName()}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exercises</SelectItem>            {categories.map((category: StoreCategory) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Tabs - Hidden on mobile screens */}
      <div className="hidden sm:block mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Exercises</TabsTrigger>            {categories.map((category: StoreCategory) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      {/* Results Summary */}
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredExercises.length} of {exercises.length} exercises
        {searchQuery && ` matching "${searchQuery}"`}
      </div>

      {/* Exercise Grid */}
      {filteredExercises.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Exercises Found</h3>
              <p className="text-muted-foreground mb-4">
                No exercises match your current search and filter criteria.
              </p>
              <Button onClick={handleClearFilters} variant="outline">
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise: StoreExercise) => {
            const category = categories.find((cat: StoreCategory) => cat.id === exercise.categoryId)
            const userPreference = preferences.find(p => p.exerciseId === exercise.id)
            
            return (              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
