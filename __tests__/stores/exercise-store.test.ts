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

// Create mock implementations
const mockUseExercises = useExercises as jest.MockedFunction<typeof useExercises>
const mockUseCategories = useCategories as jest.MockedFunction<typeof useCategories>

describe('Exercise Store', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Set up default mock return values
    mockUseCategories.mockReturnValue({
      data: [
        { 
          id: 'bodyweight', 
          name: 'Bodyweight', 
          color: '#6366F1',
          createdBy: 'system',
          updatedBy: 'system',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        { 
          id: 'weights', 
          name: 'Weights', 
          color: '#10B981',
          createdBy: 'system',
          updatedBy: 'system',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        }
      ],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any)

    mockUseExercises.mockReturnValue({
      data: [
        { 
          id: '1', 
          name: 'Push-up', 
          categoryId: 'bodyweight', 
          isActive: true, 
          difficulty: 'beginner',
          muscleGroups: ['chest', 'triceps'],
          equipment: ['bodyweight']
        },
        { 
          id: '2', 
          name: 'Squat', 
          categoryId: 'bodyweight', 
          isActive: true, 
          difficulty: 'intermediate',
          muscleGroups: ['legs', 'glutes'],
          equipment: ['bodyweight']
        },
        { 
          id: '3', 
          name: 'Bench Press', 
          categoryId: 'weights', 
          isActive: true, 
          difficulty: 'intermediate',
          muscleGroups: ['chest', 'triceps'],
          equipment: ['barbell']
        },
      ],
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

  it('should return initial state with exercises and categories', () => {
    const { result } = renderHook(() => useExerciseStore())

    expect(result.current.exercises).toHaveLength(3)
    expect(result.current.categories).toHaveLength(2)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.initialized).toBe(true)
  })

  it('should filter exercises by difficulty', () => {
    const { result } = renderHook(() => useExerciseStore())

    act(() => {
      result.current.setFilters({ difficulty: 'beginner' })
    })

    const filteredExercises = result.current.getFilteredExercises()
    expect(filteredExercises).toHaveLength(1)
    expect(filteredExercises[0].name).toBe('Push-up')
    expect(filteredExercises[0].difficulty).toBe('beginner')
  })

  it('should filter exercises by muscle group', () => {
    const { result } = getCleanStore()

    act(() => {
      result.current.setFilters({ muscleGroup: 'legs' })
    })

    const filteredExercises = result.current.getFilteredExercises()
    expect(filteredExercises).toHaveLength(1)
    expect(filteredExercises[0].name).toBe('Squat')
  })

  it('should get exercise by id', () => {
    const { result } = renderHook(() => useExerciseStore())

    const exercise = result.current.getExerciseById('1')
    expect(exercise).toBeDefined()
    expect(exercise?.name).toBe('Push-up')
    expect(exercise?.id).toBe('1')
  })

  it('should get category by id', () => {
    const { result } = renderHook(() => useExerciseStore())

    const category = result.current.getCategoryById('bodyweight')
    expect(category).toBeDefined()
    expect(category?.name).toBe('Bodyweight')
    expect(category?.id).toBe('bodyweight')
  })

  it('should get exercises by category', () => {
    const { result } = renderHook(() => useExerciseStore())

    const exercises = result.current.getExercisesByCategory('bodyweight')
    expect(exercises).toHaveLength(2)
    expect(exercises.map(e => e.name)).toEqual(['Push-up', 'Squat'])
  })

  it('should get exercises by difficulty', () => {
    const { result } = renderHook(() => useExerciseStore())

    const beginnerExercises = result.current.getExercisesByDifficulty('beginner')
    expect(beginnerExercises).toHaveLength(1)
    expect(beginnerExercises[0].name).toBe('Push-up')

    const intermediateExercises = result.current.getExercisesByDifficulty('intermediate')
    expect(intermediateExercises).toHaveLength(2)
    expect(intermediateExercises.map(e => e.name)).toEqual(['Squat', 'Bench Press'])
  })

  it('should clear filters', () => {
    const { result } = renderHook(() => useExerciseStore())

    // Set some filters
    act(() => {
      result.current.setFilters({ 
        difficulty: 'beginner', 
        muscleGroup: 'chest'
      })
    })

    // Verify filters are set
    expect(result.current.filters.difficulty).toBe('beginner')
    expect(result.current.filters.muscleGroup).toBe('chest')

    // Clear filters
    act(() => {
      result.current.clearFilters()
    })

    // Verify filters are cleared
    expect(result.current.filters.difficulty).toBeUndefined()
    expect(result.current.filters.muscleGroup).toBeUndefined()
    expect(result.current.filters.activeOnly).toBe(true) // Default value should remain
  })

  it('should update specific filters without affecting others', () => {
    const { result } = renderHook(() => useExerciseStore())

    // Set initial filters
    act(() => {
      result.current.setFilters({ 
        difficulty: 'beginner', 
        muscleGroup: 'chest' 
      })
    })

    // Update only one filter
    act(() => {
      result.current.setFilters({ difficulty: 'intermediate' })
    })

    // Verify only the specified filter changed
    expect(result.current.filters.difficulty).toBe('intermediate')
    expect(result.current.filters.muscleGroup).toBe('chest') // Should remain unchanged
    expect(result.current.filters.activeOnly).toBe(true) // Default should remain
  })

  it('should reset store', () => {
    const { result } = renderHook(() => useExerciseStore())

    // Set some filters first
    act(() => {
      result.current.setFilters({ 
        difficulty: 'advanced',
        muscleGroup: 'legs'
      })
    })

    // Verify filters are set
    expect(result.current.filters.difficulty).toBe('advanced')
    expect(result.current.filters.muscleGroup).toBe('legs')

    // Reset store
    act(() => {
      result.current.reset()
    })

    // Verify filters are cleared
    expect(result.current.filters.difficulty).toBeUndefined()
    expect(result.current.filters.muscleGroup).toBeUndefined()
    expect(result.current.filters.activeOnly).toBe(true)
  })
})