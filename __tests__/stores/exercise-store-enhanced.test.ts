import { renderHook, act } from '@testing-library/react'

// Mock the queries module completely BEFORE any imports
jest.mock('@/lib/utils/queries/exercises-queries', () => ({
  useExercises: jest.fn(),
}))

jest.mock('@/lib/utils/queries/categories-queries', () => ({
  useCategories: jest.fn(),
}))

// Import after mocking  
import { useExercises } from '@/lib/utils/queries/exercises-queries';
import { useCategories } from '@/lib/utils/queries/categories-queries';
import { useExerciseStore } from '@/lib/stores/exercise-store'
import type { StoreCategory, StoreExercise } from '@/lib/types'

// Create mock implementations
const mockUseExercises = useExercises as jest.MockedFunction<typeof useExercises>
const mockUseCategories = useCategories as jest.MockedFunction<typeof useCategories>

// Sample test data
const mockCategories: StoreCategory[] = [
  { 
    id: 'bodyweight', 
    name: 'Bodyweight', 
    color: '#6366F1',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  { 
    id: 'weights', 
    name: 'Weight Training', 
    color: '#10B981',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  { 
    id: 'cardio', 
    name: 'Cardio', 
    color: '#F59E0B',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

const mockExercises: StoreExercise[] = [
  { 
    id: 'pushup', 
    name: 'Push-up', 
    categoryId: 'bodyweight', 
    isActive: true, 
    difficulty: 'beginner',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    equipment: ['bodyweight'],
    instructions: ['Get into plank position', 'Lower your body', 'Push back up'],
    tips: ['Keep core tight', 'Control the movement'],
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  { 
    id: 'squat', 
    name: 'Bodyweight Squat', 
    categoryId: 'bodyweight', 
    isActive: true, 
    difficulty: 'beginner',
    muscleGroups: ['legs', 'glutes', 'core'],
    equipment: ['bodyweight'],
    instructions: ['Stand with feet shoulder-width apart', 'Lower into squat', 'Return to standing'],
    tips: ['Keep knees aligned', 'Go as low as comfortable'],
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  { 
    id: 'benchpress', 
    name: 'Bench Press', 
    categoryId: 'weights', 
    isActive: true, 
    difficulty: 'intermediate',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    equipment: ['barbell', 'bench'],
    instructions: ['Lie on bench', 'Grip barbell', 'Lower to chest', 'Press up'],
    tips: ['Use spotter for safety', 'Control the weight'],
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  { 
    id: 'deadlift', 
    name: 'Deadlift', 
    categoryId: 'weights', 
    isActive: true, 
    difficulty: 'advanced',
    muscleGroups: ['back', 'legs', 'glutes', 'core'],
    equipment: ['barbell'],
    instructions: ['Stand with feet hip-width', 'Grip barbell', 'Lift with legs and back', 'Stand tall'],
    tips: ['Keep back straight', 'Drive through heels'],
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  { 
    id: 'running', 
    name: 'Running', 
    categoryId: 'cardio', 
    isActive: true, 
    difficulty: 'beginner',
    muscleGroups: ['legs', 'cardiovascular'],
    equipment: ['none'],
    instructions: ['Start with light jog', 'Maintain steady pace', 'Cool down gradually'],
    tips: ['Proper running shoes', 'Stay hydrated'],
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  { 
    id: 'inactive_exercise', 
    name: 'Inactive Exercise', 
    categoryId: 'bodyweight', 
    isActive: false, 
    difficulty: 'beginner',
    muscleGroups: ['arms'],
    equipment: ['none'],
    instructions: ['This exercise is inactive'],
    tips: [],
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

describe('Exercise Store - Enhanced Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Set up default mock return values
    mockUseCategories.mockReturnValue({
      data: mockCategories,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any)

    mockUseExercises.mockReturnValue({
      data: mockExercises,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any)
  })

  // Helper function to start each test with clean filters
  const getCleanStore = () => {
    const hookResult = renderHook(() => useExerciseStore())
    
    // Clear all filters before each test
    act(() => {
      hookResult.result.current.clearFilters()
    })
    
    return hookResult
  }

  describe('Basic Store Functionality', () => {
    it('should initialize with correct data and state', () => {
      const { result } = renderHook(() => useExerciseStore())

      expect(result.current.exercises).toHaveLength(6)
      expect(result.current.categories).toHaveLength(3)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.initialized).toBe(true)
    })

    it('should handle loading states correctly', () => {
      mockUseCategories.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      } as any)

      mockUseExercises.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      } as any)

      const { result } = renderHook(() => useExerciseStore())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.initialized).toBe(false)
      expect(result.current.exercises).toEqual([])
      expect(result.current.categories).toEqual([])
    })

    it('should handle error states correctly', () => {
      const mockError = new Error('Network error')
      
      mockUseCategories.mockReturnValue({
        data: [],
        isLoading: false,
        error: mockError,
        refetch: jest.fn(),
      } as any)

      const { result } = renderHook(() => useExerciseStore())

      expect(result.current.error).toBe('Network error')
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Filter Functionality', () => {
    it('should filter exercises by difficulty', () => {
      const { result } = getCleanStore()

      // Test beginner difficulty
      act(() => {
        result.current.setFilters({ difficulty: 'beginner' })
      })

      const beginnerExercises = result.current.getFilteredExercises()
      expect(beginnerExercises).toHaveLength(3) // pushup, squat, running
      expect(beginnerExercises.every(e => e.difficulty === 'beginner')).toBe(true)

      // Test intermediate difficulty
      act(() => {
        result.current.setFilters({ difficulty: 'intermediate' })
      })

      const intermediateExercises = result.current.getFilteredExercises()
      expect(intermediateExercises).toHaveLength(1) // benchpress
      expect(intermediateExercises[0].name).toBe('Bench Press')

      // Test advanced difficulty
      act(() => {
        result.current.setFilters({ difficulty: 'advanced' })
      })

      const advancedExercises = result.current.getFilteredExercises()
      expect(advancedExercises).toHaveLength(1) // deadlift
      expect(advancedExercises[0].name).toBe('Deadlift')
    })

    it('should filter exercises by muscle group', () => {
      const { result } = getCleanStore()

      // Test chest muscle group
      act(() => {
        result.current.setFilters({ muscleGroup: 'chest' })
      })

      const chestExercises = result.current.getFilteredExercises()
      expect(chestExercises).toHaveLength(2) // pushup, benchpress
      expect(chestExercises.every(e => e.muscleGroups.includes('chest'))).toBe(true)

      // Test legs muscle group
      act(() => {
        result.current.setFilters({ muscleGroup: 'legs' })
      })

      const legExercises = result.current.getFilteredExercises()
      expect(legExercises).toHaveLength(3) // squat, deadlift, running
      expect(legExercises.every(e => e.muscleGroups.includes('legs'))).toBe(true)
    })

    it('should filter exercises by equipment', () => {
      const { result } = getCleanStore()

      // Test bodyweight equipment
      act(() => {
        result.current.setFilters({ equipment: 'bodyweight' })
      })

      const bodyweightExercises = result.current.getFilteredExercises()
      expect(bodyweightExercises).toHaveLength(2) // pushup, squat
      expect(bodyweightExercises.every(e => e.equipment?.includes('bodyweight'))).toBe(true)

      // Test barbell equipment
      act(() => {
        result.current.setFilters({ equipment: 'barbell' })
      })

      const barbellExercises = result.current.getFilteredExercises()
      expect(barbellExercises).toHaveLength(2) // benchpress, deadlift
      expect(barbellExercises.every(e => e.equipment?.includes('barbell'))).toBe(true)
    })

    it('should filter exercises by active status', () => {
      const { result } = getCleanStore()

      // Test active only (default)
      const activeExercises = result.current.getFilteredExercises()
      expect(activeExercises).toHaveLength(5) // All except inactive_exercise
      expect(activeExercises.every(e => e.isActive)).toBe(true)

      // Test include inactive
      act(() => {
        result.current.setFilters({ activeOnly: false })
      })

      const allExercises = result.current.getFilteredExercises()
      expect(allExercises).toHaveLength(6) // All exercises including inactive
    })

    it('should apply multiple filters simultaneously', () => {
      const { result } = getCleanStore()

      // Filter by difficulty AND muscle group
      act(() => {
        result.current.setFilters({ 
          difficulty: 'beginner', 
          muscleGroup: 'chest' 
        })
      })

      const filteredExercises = result.current.getFilteredExercises()
      expect(filteredExercises).toHaveLength(1) // Only pushup
      expect(filteredExercises[0].name).toBe('Push-up')
      expect(filteredExercises[0].difficulty).toBe('beginner')
      expect(filteredExercises[0].muscleGroups).toContain('chest')
    })

    it('should clear filters correctly', () => {
      const { result } = renderHook(() => useExerciseStore())

      // Set some filters
      act(() => {
        result.current.setFilters({ 
          difficulty: 'advanced', 
          muscleGroup: 'back',
          equipment: 'barbell'
        })
      })

      // Verify filters are set
      expect(result.current.filters.difficulty).toBe('advanced')
      expect(result.current.filters.muscleGroup).toBe('back')
      expect(result.current.filters.equipment).toBe('barbell')

      // Clear filters
      act(() => {
        result.current.clearFilters()
      })

      // Verify filters are cleared
      expect(result.current.filters.difficulty).toBeUndefined()
      expect(result.current.filters.muscleGroup).toBeUndefined()
      expect(result.current.filters.equipment).toBeUndefined()
      expect(result.current.filters.activeOnly).toBe(true) // Default should remain
    })

    it('should update specific filters without affecting others', () => {
      const { result } = renderHook(() => useExerciseStore())

      // Set initial filters
      act(() => {
        result.current.setFilters({ 
          difficulty: 'beginner', 
          muscleGroup: 'chest',
          equipment: 'bodyweight'
        })
      })

      // Update only one filter
      act(() => {
        result.current.setFilters({ difficulty: 'intermediate' })
      })

      // Verify only the specified filter changed
      expect(result.current.filters.difficulty).toBe('intermediate')
      expect(result.current.filters.muscleGroup).toBe('chest') // Should remain unchanged
      expect(result.current.filters.equipment).toBe('bodyweight') // Should remain unchanged
      expect(result.current.filters.activeOnly).toBe(true) // Default should remain
    })
  })

  describe('Getter Methods', () => {
    it('should get exercise by id', () => {
      const { result } = renderHook(() => useExerciseStore())

      const exercise = result.current.getExerciseById('pushup')
      expect(exercise).toBeDefined()
      expect(exercise?.name).toBe('Push-up')
      expect(exercise?.id).toBe('pushup')

      const nonExistent = result.current.getExerciseById('nonexistent')
      expect(nonExistent).toBeUndefined()
    })

    it('should get category by id', () => {
      const { result } = renderHook(() => useExerciseStore())

      const category = result.current.getCategoryById('bodyweight')
      expect(category).toBeDefined()
      expect(category?.name).toBe('Bodyweight')
      expect(category?.id).toBe('bodyweight')

      const nonExistent = result.current.getCategoryById('nonexistent')
      expect(nonExistent).toBeUndefined()
    })

    it('should get exercises by category', () => {
      const { result } = renderHook(() => useExerciseStore())

      const bodyweightExercises = result.current.getExercisesByCategory('bodyweight')
      expect(bodyweightExercises).toHaveLength(3) // pushup, squat, inactive_exercise
      expect(bodyweightExercises.every(e => e.categoryId === 'bodyweight')).toBe(true)

      const weightExercises = result.current.getExercisesByCategory('weights')
      expect(weightExercises).toHaveLength(2) // benchpress, deadlift
      expect(weightExercises.every(e => e.categoryId === 'weights')).toBe(true)

      const cardioExercises = result.current.getExercisesByCategory('cardio')
      expect(cardioExercises).toHaveLength(1) // running
      expect(cardioExercises[0].name).toBe('Running')

      const nonExistentCategory = result.current.getExercisesByCategory('nonexistent')
      expect(nonExistentCategory).toHaveLength(0)
    })

    it('should get exercises by difficulty', () => {
      const { result } = renderHook(() => useExerciseStore())

      const beginnerExercises = result.current.getExercisesByDifficulty('beginner')
      expect(beginnerExercises).toHaveLength(4) // pushup, squat, running, inactive_exercise
      expect(beginnerExercises.every(e => e.difficulty === 'beginner')).toBe(true)

      const intermediateExercises = result.current.getExercisesByDifficulty('intermediate')
      expect(intermediateExercises).toHaveLength(1) // benchpress
      expect(intermediateExercises[0].name).toBe('Bench Press')

      const advancedExercises = result.current.getExercisesByDifficulty('advanced')
      expect(advancedExercises).toHaveLength(1) // deadlift
      expect(advancedExercises[0].name).toBe('Deadlift')
    })

    it('should get exercises by muscle group', () => {
      const { result } = renderHook(() => useExerciseStore())

      const chestExercises = result.current.getExercisesByMuscleGroup('chest')
      expect(chestExercises).toHaveLength(2) // pushup, benchpress
      expect(chestExercises.every(e => e.muscleGroups.includes('chest'))).toBe(true)

      const legExercises = result.current.getExercisesByMuscleGroup('legs')
      expect(legExercises).toHaveLength(3) // squat, deadlift, running
      expect(legExercises.every(e => e.muscleGroups.includes('legs'))).toBe(true)

      const coreExercises = result.current.getExercisesByMuscleGroup('core')
      expect(coreExercises).toHaveLength(2) // squat, deadlift
      expect(coreExercises.every(e => e.muscleGroups.includes('core'))).toBe(true)

      const nonExistentMuscle = result.current.getExercisesByMuscleGroup('nonexistent')
      expect(nonExistentMuscle).toHaveLength(0)
    })

    it('should get favorite exercises', () => {
      // Mock exercises with favorites
      const exercisesWithFavorites = mockExercises.map(exercise => ({
        ...exercise,
        userStatus: exercise.id === 'pushup' || exercise.id === 'squat' ? 'favorite' as const : null
      }))

      mockUseExercises.mockReturnValue({
        data: exercisesWithFavorites,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any)

      const { result } = renderHook(() => useExerciseStore())

      const favoriteExercises = result.current.getFavoriteExercises()
      expect(favoriteExercises).toHaveLength(2) // pushup, squat
      expect(favoriteExercises.every(e => e.userStatus === 'favorite')).toBe(true)
      expect(favoriteExercises.map(e => e.name)).toEqual(['Push-up', 'Bodyweight Squat'])
    })
  })

  describe('Store Actions', () => {
    it('should initialize store', async () => {
      const { result } = renderHook(() => useExerciseStore())

      await act(async () => {
        await result.current.initializeStore()
      })

      // Since initializeStore just returns a resolved promise,
      // we verify that the store maintains its state
      expect(result.current.exercises).toHaveLength(6)
      expect(result.current.categories).toHaveLength(3)
    })

    it('should refresh categories', () => {
      const mockRefetchCategories = jest.fn()
      
      mockUseCategories.mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
        refetch: mockRefetchCategories,
      } as any)

      const { result } = renderHook(() => useExerciseStore())

      act(() => {
        result.current.refreshCategories()
      })

      expect(mockRefetchCategories).toHaveBeenCalled()
    })

    it('should refresh exercises', () => {
      const mockRefetchExercises = jest.fn()
      
      mockUseExercises.mockReturnValue({
        data: mockExercises,
        isLoading: false,
        error: null,
        refetch: mockRefetchExercises,
      } as any)

      const { result } = renderHook(() => useExerciseStore())

      act(() => {
        result.current.refreshExercises()
      })

      expect(mockRefetchExercises).toHaveBeenCalled()
    })

    it('should clear errors and trigger refetch', () => {
      const mockRefetchCategories = jest.fn()
      const mockRefetchExercises = jest.fn()
      
      mockUseCategories.mockReturnValue({
        data: [],
        isLoading: false,
        error: new Error('Category error'),
        refetch: mockRefetchCategories,
      } as any)

      mockUseExercises.mockReturnValue({
        data: [],
        isLoading: false,
        error: new Error('Exercise error'),
        refetch: mockRefetchExercises,
      } as any)

      const { result } = renderHook(() => useExerciseStore())

      act(() => {
        result.current.clearErrors()
      })

      expect(mockRefetchCategories).toHaveBeenCalled()
      expect(mockRefetchExercises).toHaveBeenCalled()
    })

    it('should reset store completely', () => {
      const mockRefetchCategories = jest.fn()
      const mockRefetchExercises = jest.fn()
      
      mockUseCategories.mockReturnValue({
        data: mockCategories,
        isLoading: false,
        error: null,
        refetch: mockRefetchCategories,
      } as any)

      mockUseExercises.mockReturnValue({
        data: mockExercises,
        isLoading: false,
        error: null,
        refetch: mockRefetchExercises,
      } as any)

      const { result } = renderHook(() => useExerciseStore())

      // Set some filters first
      act(() => {
        result.current.setFilters({ 
          difficulty: 'advanced',
          muscleGroup: 'back'
        })
      })

      // Reset store
      act(() => {
        result.current.reset()
      })

      // Verify filters are cleared and refetch is called
      expect(result.current.filters.difficulty).toBeUndefined()
      expect(result.current.filters.muscleGroup).toBeUndefined()
      expect(result.current.filters.activeOnly).toBe(true)
      expect(mockRefetchCategories).toHaveBeenCalled()
      expect(mockRefetchExercises).toHaveBeenCalled()
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty exercise data', () => {
      mockUseExercises.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any)

      const { result } = renderHook(() => useExerciseStore())

      expect(result.current.exercises).toEqual([])
      expect(result.current.getFilteredExercises()).toEqual([])
      expect(result.current.getExerciseById('any')).toBeUndefined()
      expect(result.current.getExercisesByCategory('any')).toEqual([])
    })

    it('should handle empty category data', () => {
      mockUseCategories.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any)

      const { result } = renderHook(() => useExerciseStore())

      expect(result.current.categories).toEqual([])
      expect(result.current.getCategoryById('any')).toBeUndefined()
    })

    it('should handle filters with no matching exercises', () => {
      const { result } = getCleanStore()

      act(() => {
        result.current.setFilters({ 
          difficulty: 'beginner', 
          muscleGroup: 'nonexistent'
        })
      })

      const filteredExercises = result.current.getFilteredExercises()
      expect(filteredExercises).toEqual([])
    })

    it('should handle concurrent filter updates', () => {
      const { result } = renderHook(() => useExerciseStore())

      act(() => {
        result.current.setFilters({ difficulty: 'beginner' })
        result.current.setFilters({ muscleGroup: 'chest' })
        result.current.setFilters({ equipment: 'bodyweight' })
      })

      expect(result.current.filters.difficulty).toBe('beginner')
      expect(result.current.filters.muscleGroup).toBe('chest')
      expect(result.current.filters.equipment).toBe('bodyweight')
    })
  })

  describe('Filter State Persistence', () => {
    it('should maintain filter state across re-renders', () => {
      const { result, rerender } = renderHook(() => useExerciseStore())

      act(() => {
        result.current.setFilters({ difficulty: 'intermediate' })
      })

      expect(result.current.filters.difficulty).toBe('intermediate')

      rerender()

      expect(result.current.filters.difficulty).toBe('intermediate')
    })

    it('should maintain filter state when data changes', () => {
      const { result } = renderHook(() => useExerciseStore())

      act(() => {
        result.current.setFilters({ difficulty: 'advanced' })
      })

      // Change the mock data
      mockUseExercises.mockReturnValue({
        data: [mockExercises[0]], // Only first exercise
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any)

      // Trigger re-render by updating state
      act(() => {
        result.current.setFilters({ equipment: 'barbell' })
      })

      // Filter state should persist
      expect(result.current.filters.difficulty).toBe('advanced')
      expect(result.current.filters.equipment).toBe('barbell')
    })
  })
})
