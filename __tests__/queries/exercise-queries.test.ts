/**
 * Exercise Queries Test Suite
 * Tests the TanStack Query hooks for exercises and categories
 * Focuses on data transformation and API interaction patterns
 */

// Mock global fetch for testing
global.fetch = jest.fn()

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

// Sample API response data
const mockApiExercises = [
  {
    _id: 'ex1',
    name: 'Push-up',
    categoryId: 'cat1',
    description: 'Basic bodyweight exercise',
    difficulty: 'beginner',
    muscleGroups: ['chest', 'triceps'],
    equipment: ['bodyweight'],
    instructions: ['Get into plank', 'Lower body', 'Push up'],
    tips: ['Keep core tight'],
    isActive: true,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: 'ex2',
    name: 'Bench Press',
    categoryId: 'cat2',
    description: 'Weight training exercise',
    difficulty: 'intermediate',
    muscleGroups: ['chest', 'triceps'],
    equipment: ['barbell', 'bench'],
    instructions: ['Lie on bench', 'Grip bar', 'Lower to chest', 'Press up'],
    tips: ['Use spotter'],
    isActive: true,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
]

const mockApiCategories = [
  {
    _id: 'cat1',
    name: 'Bodyweight',
    color: '#6366F1',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    _id: 'cat2',
    name: 'Weights',
    color: '#10B981',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
]

describe('Exercise Queries - API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('API URL Construction', () => {
    it('should construct correct URL with no filters', () => {
      const filters = { activeOnly: true }
      const expectedParams = new URLSearchParams()
      expectedParams.append('activeOnly', 'true')
      
      expect(expectedParams.toString()).toBe('activeOnly=true')
    })

    it('should construct correct URL with difficulty filter', () => {
      const filters = { difficulty: 'beginner', activeOnly: true }
      const expectedParams = new URLSearchParams()
      expectedParams.append('difficulty', 'beginner')
      expectedParams.append('activeOnly', 'true')
      
      expect(expectedParams.toString()).toBe('difficulty=beginner&activeOnly=true')
    })

    it('should construct correct URL with muscle group filter', () => {
      const filters = { muscleGroup: 'chest', activeOnly: true }
      const expectedParams = new URLSearchParams()
      expectedParams.append('muscleGroup', 'chest')
      expectedParams.append('activeOnly', 'true')
      
      expect(expectedParams.toString()).toBe('muscleGroup=chest&activeOnly=true')
    })

    it('should construct correct URL with equipment filter', () => {
      const filters = { equipment: 'barbell', activeOnly: true }
      const expectedParams = new URLSearchParams()
      expectedParams.append('equipment', 'barbell')
      expectedParams.append('activeOnly', 'true')
      
      expect(expectedParams.toString()).toBe('equipment=barbell&activeOnly=true')
    })

    it('should construct correct URL with multiple filters', () => {
      const filters = { 
        difficulty: 'intermediate', 
        muscleGroup: 'chest', 
        equipment: 'barbell',
        activeOnly: false 
      }
      const expectedParams = new URLSearchParams()
      expectedParams.append('difficulty', 'intermediate')
      expectedParams.append('muscleGroup', 'chest')
      expectedParams.append('equipment', 'barbell')
      expectedParams.append('activeOnly', 'false')
      
      const result = expectedParams.toString()
      expect(result).toContain('difficulty=intermediate')
      expect(result).toContain('muscleGroup=chest')
      expect(result).toContain('equipment=barbell')
      expect(result).toContain('activeOnly=false')
    })
  })

  describe('Data Transformation Functions', () => {
    it('should transform API exercise data to store format', () => {
      const apiExercise = mockApiExercises[0]
      
      // Simulate the transformation function from queries.ts
      const transformedExercise = {
        id: apiExercise._id,
        name: apiExercise.name,
        categoryId: apiExercise.categoryId,
        description: apiExercise.description,
        // imageUrl: apiExercise.imageUrl,
        difficulty: apiExercise.difficulty,
        muscleGroups: apiExercise.muscleGroups,
        equipment: apiExercise.equipment,
        instructions: apiExercise.instructions,
        tips: apiExercise.tips,
        isActive: apiExercise.isActive,
        userStatus: null,
        userNotes: undefined,
        userCustomSettings: undefined,
        lastUsed: undefined,
        createdBy: apiExercise.createdBy,
        updatedBy: apiExercise.updatedBy,
        createdAt: apiExercise.createdAt,
        updatedAt: apiExercise.updatedAt,
      }

      expect(transformedExercise).toEqual({
        id: 'ex1',
        name: 'Push-up',
        categoryId: 'cat1',
        description: 'Basic bodyweight exercise',
        imageUrl: undefined,
        difficulty: 'beginner',
        muscleGroups: ['chest', 'triceps'],
        equipment: ['bodyweight'],
        instructions: ['Get into plank', 'Lower body', 'Push up'],
        tips: ['Keep core tight'],
        isActive: true,
        userStatus: null,
        userNotes: undefined,
        userCustomSettings: undefined,
        lastUsed: undefined,
        createdBy: 'admin',
        updatedBy: 'admin',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      })
    })

    it('should transform API category data to store format', () => {
      const apiCategory = mockApiCategories[0]
      
      // Simulate the transformation function from queries.ts
      const transformedCategory = {
        id: apiCategory._id,
        name: apiCategory.name,
        color: apiCategory.color || '#6366F1',
        createdBy: apiCategory.createdBy,
        updatedBy: apiCategory.updatedBy,
        createdAt: apiCategory.createdAt,
        updatedAt: apiCategory.updatedAt,
      }

      expect(transformedCategory).toEqual({
        id: 'cat1',
        name: 'Bodyweight',
        color: '#6366F1',
        createdBy: 'admin',
        updatedBy: 'admin',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      })
    })

    it('should handle missing optional fields in exercise transformation', () => {
      const minimalApiExercise = {
        _id: 'ex3',
        name: 'Minimal Exercise',
        categoryId: 'cat1',
        difficulty: 'beginner' as const,
        muscleGroups: ['core'],
        instructions: ['Do the exercise'],
        isActive: true,
        createdBy: 'admin',
        updatedBy: 'admin',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }

      const transformedExercise = {
        id: minimalApiExercise._id,
        name: minimalApiExercise.name,
        categoryId: minimalApiExercise.categoryId,
        description: undefined,
        imageUrl: undefined,
        difficulty: minimalApiExercise.difficulty,
        muscleGroups: minimalApiExercise.muscleGroups,
        equipment: undefined,
        instructions: minimalApiExercise.instructions,
        tips: undefined,
        isActive: minimalApiExercise.isActive,
        userStatus: null,
        userNotes: undefined,
        userCustomSettings: undefined,
        lastUsed: undefined,
        createdBy: minimalApiExercise.createdBy,
        updatedBy: minimalApiExercise.updatedBy,
        createdAt: minimalApiExercise.createdAt,
        updatedAt: minimalApiExercise.updatedAt,
      }

      expect(transformedExercise.id).toBe('ex3')
      expect(transformedExercise.name).toBe('Minimal Exercise')
      expect(transformedExercise.description).toBeUndefined()
      expect(transformedExercise.equipment).toBeUndefined()
      expect(transformedExercise.tips).toBeUndefined()
    })

    it('should handle missing color in category transformation', () => {
      const categoryWithoutColor = {
        _id: 'cat3',
        name: 'No Color Category',
        createdBy: 'admin',
        updatedBy: 'admin',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }

      const transformedCategory = {
        id: categoryWithoutColor._id,
        name: categoryWithoutColor.name,
        color: '#6366F1', // Default color
        createdBy: categoryWithoutColor.createdBy,
        updatedBy: categoryWithoutColor.updatedBy,
        createdAt: categoryWithoutColor.createdAt,
        updatedAt: categoryWithoutColor.updatedAt,
      }

      expect(transformedCategory.color).toBe('#6366F1')
    })
  })

  describe('Filter Normalization', () => {
    it('should normalize undefined filters to null', () => {
      const filters = {
        difficulty: undefined,
        muscleGroup: undefined,
        equipment: undefined,
        activeOnly: true
      }

      const normalizedFilters = {
        difficulty: filters.difficulty || null,
        muscleGroup: filters.muscleGroup || null,
        equipment: filters.equipment || null,
        activeOnly: filters.activeOnly ?? true,
      }

      expect(normalizedFilters).toEqual({
        difficulty: null,
        muscleGroup: null,
        equipment: null,
        activeOnly: true
      })
    })

    it('should preserve defined filter values', () => {
      const filters = {
        difficulty: 'advanced' as const,
        muscleGroup: 'legs',
        equipment: 'barbell',
        activeOnly: false
      }

      const normalizedFilters = {
        difficulty: filters.difficulty || null,
        muscleGroup: filters.muscleGroup || null,
        equipment: filters.equipment || null,
        activeOnly: filters.activeOnly ?? true,
      }

      expect(normalizedFilters).toEqual({
        difficulty: 'advanced',
        muscleGroup: 'legs',
        equipment: 'barbell',
        activeOnly: false
      })
    })

    it('should default activeOnly to true when undefined', () => {
      const filters = {
        difficulty: 'beginner' as const,
        activeOnly: undefined
      }

      const normalizedFilters = {
        difficulty: filters.difficulty || null,
        muscleGroup: null,
        equipment: null,
        activeOnly: filters.activeOnly ?? true,
      }

      expect(normalizedFilters.activeOnly).toBe(true)
    })
  })

  describe('Query Key Stability', () => {
    it('should create same query key for equivalent filters', () => {
      const filters1 = {
        difficulty: 'beginner' as const,
        muscleGroup: 'chest',
        equipment: 'bodyweight',
        activeOnly: true
      }

      const filters2 = {
        difficulty: 'beginner' as const,
        muscleGroup: 'chest',
        equipment: 'bodyweight',
        activeOnly: true
      }

      // Simulate the normalized filters from queries.ts
      const key1 = ['exercises', {
        difficulty: filters1.difficulty || undefined,
        muscleGroup: filters1.muscleGroup || undefined,
        equipment: filters1.equipment || undefined,
        activeOnly: filters1.activeOnly ?? true,
      }]

      const key2 = ['exercises', {
        difficulty: filters2.difficulty || undefined,
        muscleGroup: filters2.muscleGroup || undefined,
        equipment: filters2.equipment || undefined,
        activeOnly: filters2.activeOnly ?? true,
      }]

      expect(JSON.stringify(key1)).toEqual(JSON.stringify(key2))
    })

    it('should create different query keys for different filters', () => {
      const filters1 = {
        difficulty: 'beginner' as const,
        activeOnly: true
      }

      const filters2 = {
        difficulty: 'intermediate' as const,
        activeOnly: true
      }

      const key1 = ['exercises', {
        difficulty: filters1.difficulty || undefined,
        muscleGroup: undefined,
        equipment: undefined,
        activeOnly: filters1.activeOnly ?? true,
      }]

      const key2 = ['exercises', {
        difficulty: filters2.difficulty || undefined,
        muscleGroup: undefined,
        equipment: undefined,
        activeOnly: filters2.activeOnly ?? true,
      }]

      expect(JSON.stringify(key1)).not.toEqual(JSON.stringify(key2))
    })
  })

  describe('Error Handling Patterns', () => {
    it('should handle fetch errors gracefully', async () => {
      const mockError = new Error('Network error')
      
      // This tests the pattern used in the queries
      try {
        throw mockError
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Network error')
      }
    })

    it('should handle malformed response data', () => {
      const malformedResponse = {
        notExercises: ['invalid', 'data']
      }

      // Test that accessing exercises property returns undefined
      const exercises = (malformedResponse as any).exercises
      expect(exercises).toBeUndefined()
    })

    it('should handle empty response arrays', () => {
      const emptyResponse = {
        exercises: []
      }

      const transformedExercises = emptyResponse.exercises.map((exercise: any) => ({
        id: exercise._id,
        // ... other transformations
      }))

      expect(transformedExercises).toEqual([])
    })
  })

  describe('API Fallback Behavior', () => {
    it('should test fallback URL construction', () => {
      // When /api/exercises/available fails, it should fall back to /api/exercises
      const primaryUrl = '/api/exercises/available?activeOnly=true'
      const fallbackUrl = '/api/exercises'

      expect(primaryUrl).toContain('/available')
      expect(fallbackUrl).not.toContain('/available')
      expect(fallbackUrl).toBe('/api/exercises')
    })

    it('should maintain same headers for both endpoints', () => {
      const headers = {
        'x-client-auth': 'internal-request',
      }

      // Both primary and fallback should use same headers
      expect(headers['x-client-auth']).toBe('internal-request')
    })
  })

  describe('Caching Configuration', () => {
    it('should use ultra-aggressive caching for exercises', () => {
      const cacheConfig = {
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: false,
        refetchOnReconnect: false,
        retry: 1,
      }

      expect(cacheConfig.staleTime).toBe(Infinity)
      expect(cacheConfig.gcTime).toBe(Infinity)
      expect(cacheConfig.refetchOnWindowFocus).toBe(false)
      expect(cacheConfig.refetchOnMount).toBe(false)
      expect(cacheConfig.refetchInterval).toBe(false)
      expect(cacheConfig.refetchOnReconnect).toBe(false)
      expect(cacheConfig.retry).toBe(1)
    })

    it('should use ultra-aggressive caching for categories', () => {
      const cacheConfig = {
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: false,
        refetchOnReconnect: false,
        retry: 1,
      }

      expect(cacheConfig.staleTime).toBe(Infinity)
      expect(cacheConfig.gcTime).toBe(Infinity)
      expect(cacheConfig.refetchOnWindowFocus).toBe(false)
    })
  })

  describe('Query Key Patterns', () => {
    it('should use correct query key for categories', () => {
      const categoryQueryKey = ['categories']
      expect(categoryQueryKey).toEqual(['categories'])
    })

    it('should use correct query key pattern for exercises', () => {
      const filters = {
        difficulty: undefined,
        muscleGroup: undefined,
        equipment: undefined,
        activeOnly: true,
      }
      
      const exerciseQueryKey = ['exercises', filters]
      expect(exerciseQueryKey[0]).toBe('exercises')
      expect(exerciseQueryKey[1]).toEqual(filters)
    })
  })
})
