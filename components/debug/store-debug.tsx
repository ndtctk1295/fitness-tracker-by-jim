'use client'

import { useEffect } from 'react'
import { useExerciseStore } from '@/lib/stores/exercise-store'

export function StoreDebug() {
  const { 
    exercises, 
    categories, 
    isLoading, 
    error, 
    initialized,
    initializeStore 
  } = useExerciseStore()

  useEffect(() => {
    console.log('StoreDebug - Current state:', {
      exercisesCount: exercises.length,
      categoriesCount: categories.length,
      isLoading,
      error,
      initialized
    })
  }, [exercises, categories, isLoading, error, initialized])

  const handleRefresh = async () => {
    console.log('Manual refresh triggered')
    try {
      await initializeStore()
      console.log('Store initialized successfully')
    } catch (err) {
      console.error('Failed to initialize store:', err)
    }
  }

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
      <h3 className="font-bold mb-2">Store Debug Info</h3>
      <div className="space-y-2 text-sm">
        <div>Exercises: {exercises.length}</div>
        <div>Categories: {categories.length}</div>
        <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div>Initialized: {initialized ? 'Yes' : 'No'}</div>
        <div>Error: {error || 'None'}</div>
        <button 
          onClick={handleRefresh}
          className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
        >
          Refresh Store
        </button>
      </div>
    </div>
  )
}
