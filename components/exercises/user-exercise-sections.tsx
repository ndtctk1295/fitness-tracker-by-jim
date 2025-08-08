'use client'

import { Heart, Clock, Star, Dumbbell, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useUserExercisePreferenceData } from '@/lib/hooks/data-hook/use-user-exercise-preference-data'
import { useExerciseData } from '@/lib/hooks/data-hook/use-exercise-data'
import { ExerciseCard } from './exercise-card'

// Store-specific types for frontend compatibility
interface StoreUserExercisePreference {
  id: string
  userId: string
  exerciseId: string
  status: 'favorite'
  notes?: string
  customSettings?: {
    sets?: number
    reps?: number
    weight?: number
    restTime?: number
    duration?: number
  }
  addedAt: string
  lastUsed?: string
  // Populated exercise data
  exercise?: {
    id: string
    name: string
    description?: string
    imageUrl?: string
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    muscleGroups?: string[]
    equipment?: string[]
  }
}

interface UserExerciseSectionsProps {
  onExerciseClick?: (exerciseId: string) => void
}

export function UserExerciseSections({ onExerciseClick }: UserExerciseSectionsProps) {  
  const { 
    preferences, 
    isLoading: preferencesLoading,
    error: preferencesError,
    selectors,
    refetch: forceRefresh
  } = useUserExercisePreferenceData()
  
  const { 
    exercises, 
    isLoading: exercisesLoading
  } = useExerciseData()

  // Mock categories for now
  const categories = [
    { id: 'strength', name: 'Strength', color: '#3b82f6' },
    { id: 'cardio', name: 'Cardio', color: '#ef4444' },
    { id: 'flexibility', name: 'Flexibility', color: '#10b981' },
    { id: 'sports', name: 'Sports', color: '#f59e0b' },
  ]

  // Remove the useEffect that was causing infinite loop
  // TanStack Query will automatically fetch data when needed

  const isLoading = preferencesLoading || exercisesLoading
  // Get exercises by status
  const favoriteExercises = selectors.favoriteExercises
  const recentlyUsed = preferences
    .filter(p => p.lastUsed)
    .sort((a, b) => new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime())
    .slice(0, 6)

  // Helper function to get exercise data with preference
  const getExerciseWithPreference = (preference: StoreUserExercisePreference) => {
    const exercise = exercises.find((e: any) => e.id === preference.exerciseId)
    const category = exercise ? categories.find((c: any) => c.id === exercise.categoryId) : undefined
    return { exercise, category, preference }
  }

  // Helper function to format last used time
  const formatLastUsed = (lastUsed: string) => {
    const date = new Date(lastUsed)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }
  if (isLoading) {
    return (
      <div className="space-y-8 mb-8">
        <UserExerciseSectionSkeleton title="Favorites" />
        <UserExerciseSectionSkeleton title="Recently Used" />
      </div>
    )
  }

  // Don't render if no preferences exist
  if (preferences.length === 0) {
    return (
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="text-center py-8">            <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Exercise Preferences Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start adding exercises to your favorites to see them here.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <div className="space-y-8 mb-8">
      {/* Debug: Force refresh button (remove in production) */}
      <div className="flex gap-2 p-4 bg-muted rounded-lg">
        <Button 
          onClick={() => forceRefresh()} 
          variant="outline" 
          size="sm"
          disabled={preferencesLoading}
        >
          {preferencesLoading ? 'Refreshing...' : 'Force Refresh Data'}
        </Button>
        <p className="text-sm text-muted-foreground flex items-center">
          Debug: Click to fetch fresh data from server
        </p>
      </div>

      {/* Favorites Section */}
      {favoriteExercises.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <CardTitle className="text-xl">Favorites</CardTitle>
              <Badge variant="secondary">{favoriteExercises.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteExercises.map((preference: StoreUserExercisePreference) => {
                const { exercise, category } = getExerciseWithPreference(preference)
                if (!exercise) return null
                
                return (
                  <ExerciseCard
                    key={preference.exerciseId}
                    exercise={{
                      ...exercise,
                      userStatus: preference.status as 'favorite',
                      userNotes: preference.notes,
                      userCustomSettings: preference.customSettings,
                      lastUsed: preference.lastUsed
                    }}
                  />
                )
              })}
            </div>          </CardContent>
        </Card>
      )}

      {/* Recently Used Section */}
      {recentlyUsed.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-xl">Recently Used</CardTitle>
              <Badge variant="secondary">{recentlyUsed.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentlyUsed.map((preference: StoreUserExercisePreference) => {
                const { exercise, category } = getExerciseWithPreference(preference)
                if (!exercise) return null
                
                return (
                  <div key={preference.exerciseId} className="relative">
                    <ExerciseCard
                      exercise={{
                        ...exercise,
                        userStatus: preference.status as 'favorite',
                        userNotes: preference.notes,
                        userCustomSettings: preference.customSettings,
                        lastUsed: preference.lastUsed
                      }}
                    />
                    {preference.lastUsed && (
                      <Badge 
                        variant="outline" 
                        className="absolute top-2 right-2 text-xs"
                      >
                        {formatLastUsed(preference.lastUsed)}
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Skeleton component for loading state
function UserExerciseSectionSkeleton({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-8" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
