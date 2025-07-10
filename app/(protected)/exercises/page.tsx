'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useExerciseStore } from '@/lib/stores/exercise-store'
import { useUserExercisePreferenceStore } from '@/lib/stores/user-exercise-preference-store'
import { UserExerciseSections } from '@/components/exercises/user-exercise-sections'
import { AllExercisesTab } from '@/components/exercises/all-exercises-tab'

export default function ExercisesPage() {
  const { 
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

  const [activeMainTab, setActiveMainTab] = useState('all-exercises')

  // Fetch data on component mount
  useEffect(() => {
    initializeStore()
    initializePreferences()
  }, [initializeStore, initializePreferences])

  const isLoading = exercisesLoading || preferencesLoading

  return (
    <div className="py-10">      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Exercise Library</h1>
        <p className="text-muted-foreground">
          Browse and manage your exercise collection with personalized preferences.
        </p>
      </div>

      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="all-exercises">All Exercises</TabsTrigger>
          <TabsTrigger value="my-exercises">My Exercises</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-exercises" className="space-y-0">
          <AllExercisesTab
            exercises={exercises}
            categories={categories}
            preferences={preferences}
            isLoading={isLoading}
            exercisesError={exercisesError}
          />
        </TabsContent>
        
        <TabsContent value="my-exercises" className="space-y-0">
          <UserExerciseSections />
        </TabsContent>
      </Tabs>
    </div>
  )
}


