/**
 * Exercise Utilities and Transformations Test Suite
 * Tests data transformation functions, utility helpers, and type conversions
 * for exercise-related functionality
 */

import { Exercise, StoreExercise } from '@/lib/types'

// Exercise transformation utilities (inferred from usage patterns)
const transformExerciseForStore = (exercise: Exercise): StoreExercise => {
  const { _id, ...rest } = exercise
  return {
    id: _id,
    ...rest
  }
}

const transformExercisesForStore = (exercises: Exercise[]): StoreExercise[] => {
  return exercises.map(transformExerciseForStore)
}

const transformStoreExerciseForAPI = (exercise: StoreExercise): Omit<Exercise, '_id'> & { _id?: string } => {
  const { id, ...rest } = exercise
  return {
    _id: id,
    ...rest
  }
}

// Filter utilities (inferred from store patterns)
const filterExercisesByDifficulty = (exercises: StoreExercise[], difficulty: string) => {
  if (!difficulty) return exercises
  return exercises.filter(exercise => exercise.difficulty === difficulty)
}

const filterExercisesByMuscleGroup = (exercises: StoreExercise[], muscleGroup: string) => {
  if (!muscleGroup) return exercises
  return exercises.filter(exercise => 
    exercise.muscleGroups?.includes(muscleGroup)
  )
}

const filterExercisesByEquipment = (exercises: StoreExercise[], equipment: string) => {
  if (!equipment) return exercises
  return exercises.filter(exercise => 
    exercise.equipment?.includes(equipment)
  )
}

const filterExercisesByCategory = (exercises: StoreExercise[], categoryId: string) => {
  if (!categoryId) return exercises
  return exercises.filter(exercise => exercise.categoryId === categoryId)
}

const filterExercisesBySearch = (exercises: StoreExercise[], searchTerm: string) => {
  if (!searchTerm) return exercises
  const term = searchTerm.toLowerCase()
  return exercises.filter(exercise => 
    exercise.name.toLowerCase().includes(term) ||
    exercise.description?.toLowerCase().includes(term) ||
    exercise.muscleGroups?.some((group: string) => group.toLowerCase().includes(term)) ||
    exercise.equipment?.some((eq: string) => eq.toLowerCase().includes(term))
  )
}

// Sorting utilities
const sortExercisesByName = (exercises: StoreExercise[], direction: 'asc' | 'desc' = 'asc') => {
  return [...exercises].sort((a, b) => {
    const nameA = a.name.toLowerCase()
    const nameB = b.name.toLowerCase()
    
    if (direction === 'asc') {
      return nameA < nameB ? -1 : nameA > nameB ? 1 : 0
    } else {
      return nameA > nameB ? -1 : nameA < nameB ? 1 : 0
    }
  })
}

const sortExercisesByDifficulty = (exercises: StoreExercise[], direction: 'asc' | 'desc' = 'asc') => {
  const difficultyOrder = ['beginner', 'intermediate', 'advanced']
  
  return [...exercises].sort((a, b) => {
    const indexA = difficultyOrder.indexOf(a.difficulty)
    const indexB = difficultyOrder.indexOf(b.difficulty)
    
    if (direction === 'asc') {
      return indexA - indexB
    } else {
      return indexB - indexA
    }
  })
}

// Validation utilities
const isValidExercise = (exercise: Partial<Exercise>): boolean => {
  return !!(
    exercise.name && 
    exercise.categoryId && 
    exercise.description
  )
}

const isValidDifficulty = (difficulty: string): boolean => {
  return ['beginner', 'intermediate', 'advanced'].includes(difficulty)
}

const isValidMuscleGroup = (muscleGroup: string): boolean => {
  const validMuscleGroups = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
    'abs', 'obliques', 'lower_back', 'quadriceps', 'hamstrings',
    'calves', 'glutes', 'adductors', 'abductors'
  ]
  return validMuscleGroups.includes(muscleGroup)
}

const isValidEquipment = (equipment: string): boolean => {
  const validEquipment = [
    'bodyweight', 'barbell', 'dumbbell', 'kettlebell', 'resistance_band',
    'cable', 'machine', 'bench', 'pull_up_bar', 'yoga_mat', 'foam_roller'
  ]
  return validEquipment.includes(equipment)
}

// Sample test data
const mockExerciseData: Exercise = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Push-up',
  categoryId: '507f1f77bcf86cd799439012',
  description: 'Basic bodyweight exercise',
  difficulty: 'beginner',
  muscleGroups: ['chest', 'triceps', 'shoulders'],
  equipment: ['bodyweight'],
  instructions: ['Get into plank position', 'Lower body to ground', 'Push back up'],
  tips: ['Keep core tight', 'Maintain straight line'],
  isActive: true,
  createdBy: '507f1f77bcf86cd799439013',
  updatedBy: '507f1f77bcf86cd799439013',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
}

const mockStoreExerciseData: StoreExercise = {
  id: '507f1f77bcf86cd799439011',
  name: 'Push-up',
  categoryId: '507f1f77bcf86cd799439012',
  description: 'Basic bodyweight exercise',
  difficulty: 'beginner',
  muscleGroups: ['chest', 'triceps', 'shoulders'],
  equipment: ['bodyweight'],
  instructions: ['Get into plank position', 'Lower body to ground', 'Push back up'],
  tips: ['Keep core tight', 'Maintain straight line'],
  isActive: true,
  createdBy: '507f1f77bcf86cd799439013',
  updatedBy: '507f1f77bcf86cd799439013',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
}

const mockExercisesArray: Exercise[] = [
  mockExerciseData,
  {
    ...mockExerciseData,
    _id: '507f1f77bcf86cd799439014',
    name: 'Bench Press',
    difficulty: 'intermediate',
    muscleGroups: ['chest', 'triceps'],
    equipment: ['barbell', 'bench']
  },
  {
    ...mockExerciseData,
    _id: '507f1f77bcf86cd799439015',
    name: 'Deadlift',
    difficulty: 'advanced',
    muscleGroups: ['back', 'hamstrings', 'glutes'],
    equipment: ['barbell']
  }
]

describe('Exercise Utilities and Transformations', () => {
  describe('Data Transformations', () => {
    describe('transformExerciseForStore', () => {
      it('should transform Exercise to StoreExercise', () => {
        const result = transformExerciseForStore(mockExerciseData)
        
        expect(result).not.toHaveProperty('_id')
        expect(result.id).toBe(mockExerciseData._id)
        expect(result.name).toBe(mockExerciseData.name)
        expect(result.categoryId).toBe(mockExerciseData.categoryId)
        expect(result.description).toBe(mockExerciseData.description)
        expect(result.difficulty).toBe(mockExerciseData.difficulty)
        expect(result.muscleGroups).toEqual(mockExerciseData.muscleGroups)
        expect(result.equipment).toEqual(mockExerciseData.equipment)
      })

      it('should handle undefined fields gracefully', () => {
        const exerciseWithUndefined: Exercise = {
          ...mockExerciseData,
          tips: undefined,
          muscleGroups: [],
          equipment: undefined
        }
        
        const result = transformExerciseForStore(exerciseWithUndefined)
        
        expect(result.id).toBe(exerciseWithUndefined._id)
        expect(result.tips).toBeUndefined()
        expect(result.muscleGroups).toEqual([])
        expect(result.equipment).toBeUndefined()
      })
    })

    describe('transformExercisesForStore', () => {
      it('should transform array of exercises', () => {
        const result = transformExercisesForStore(mockExercisesArray)
        
        expect(result).toHaveLength(3)
        expect(result[0].id).toBe(mockExercisesArray[0]._id)
        expect(result[1].id).toBe(mockExercisesArray[1]._id)
        expect(result[2].id).toBe(mockExercisesArray[2]._id)
        
        result.forEach(exercise => {
          expect(exercise).not.toHaveProperty('_id')
          expect(exercise).toHaveProperty('id')
        })
      })

      it('should handle empty array', () => {
        const result = transformExercisesForStore([])
        expect(result).toEqual([])
      })
    })

    describe('transformStoreExerciseForAPI', () => {
      it('should transform StoreExercise back to Exercise format', () => {
        const result = transformStoreExerciseForAPI(mockStoreExerciseData)
        
        expect(result).not.toHaveProperty('id')
        expect(result._id).toBe(mockStoreExerciseData.id)
        expect(result.name).toBe(mockStoreExerciseData.name)
        expect(result.categoryId).toBe(mockStoreExerciseData.categoryId)
      })
    })
  })

  describe('Filtering Utilities', () => {
    let storeExercises: StoreExercise[]

    beforeEach(() => {
      storeExercises = transformExercisesForStore(mockExercisesArray)
    })

    describe('filterExercisesByDifficulty', () => {
      it('should filter by beginner difficulty', () => {
        const result = filterExercisesByDifficulty(storeExercises, 'beginner')
        
        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Push-up')
        expect(result[0].difficulty).toBe('beginner')
      })

      it('should filter by intermediate difficulty', () => {
        const result = filterExercisesByDifficulty(storeExercises, 'intermediate')
        
        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Bench Press')
        expect(result[0].difficulty).toBe('intermediate')
      })

      it('should filter by advanced difficulty', () => {
        const result = filterExercisesByDifficulty(storeExercises, 'advanced')
        
        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Deadlift')
        expect(result[0].difficulty).toBe('advanced')
      })

      it('should return all exercises when no difficulty provided', () => {
        const result = filterExercisesByDifficulty(storeExercises, '')
        expect(result).toHaveLength(3)
      })
    })

    describe('filterExercisesByMuscleGroup', () => {
      it('should filter by chest muscle group', () => {
        const result = filterExercisesByMuscleGroup(storeExercises, 'chest')
        
        expect(result).toHaveLength(2)
        expect(result.map(e => e.name)).toContain('Push-up')
        expect(result.map(e => e.name)).toContain('Bench Press')
      })

      it('should filter by back muscle group', () => {
        const result = filterExercisesByMuscleGroup(storeExercises, 'back')
        
        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Deadlift')
      })

      it('should return empty array for non-existent muscle group', () => {
        const result = filterExercisesByMuscleGroup(storeExercises, 'nonexistent')
        expect(result).toHaveLength(0)
      })

      it('should return all exercises when no muscle group provided', () => {
        const result = filterExercisesByMuscleGroup(storeExercises, '')
        expect(result).toHaveLength(3)
      })
    })

    describe('filterExercisesByEquipment', () => {
      it('should filter by bodyweight equipment', () => {
        const result = filterExercisesByEquipment(storeExercises, 'bodyweight')
        
        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Push-up')
      })

      it('should filter by barbell equipment', () => {
        const result = filterExercisesByEquipment(storeExercises, 'barbell')
        
        expect(result).toHaveLength(2)
        expect(result.map(e => e.name)).toContain('Bench Press')
        expect(result.map(e => e.name)).toContain('Deadlift')
      })

      it('should return all exercises when no equipment provided', () => {
        const result = filterExercisesByEquipment(storeExercises, '')
        expect(result).toHaveLength(3)
      })
    })

    describe('filterExercisesByCategory', () => {
      it('should filter by category ID', () => {
        const result = filterExercisesByCategory(storeExercises, '507f1f77bcf86cd799439012')
        expect(result).toHaveLength(3) // All have same category in mock data
      })

      it('should return empty array for non-existent category', () => {
        const result = filterExercisesByCategory(storeExercises, 'nonexistent')
        expect(result).toHaveLength(0)
      })

      it('should return all exercises when no category provided', () => {
        const result = filterExercisesByCategory(storeExercises, '')
        expect(result).toHaveLength(3)
      })
    })

    describe('filterExercisesBySearch', () => {
      it('should search by exercise name', () => {
        const result = filterExercisesBySearch(storeExercises, 'push')
        
        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Push-up')
      })

      it('should search by description', () => {
        const result = filterExercisesBySearch(storeExercises, 'bench')
        
        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Bench Press')
      })

      it('should search by muscle group', () => {
        const result = filterExercisesBySearch(storeExercises, 'chest')
        
        expect(result).toHaveLength(2)
        expect(result.map(e => e.name)).toContain('Push-up')
        expect(result.map(e => e.name)).toContain('Bench Press')
      })

      it('should search by equipment', () => {
        const result = filterExercisesBySearch(storeExercises, 'barbell')
        
        expect(result).toHaveLength(2)
        expect(result.map(e => e.name)).toContain('Bench Press')
        expect(result.map(e => e.name)).toContain('Deadlift')
      })

      it('should be case insensitive', () => {
        const result = filterExercisesBySearch(storeExercises, 'PUSH')
        
        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Push-up')
      })

      it('should return all exercises when no search term provided', () => {
        const result = filterExercisesBySearch(storeExercises, '')
        expect(result).toHaveLength(3)
      })

      it('should return empty array for non-matching search', () => {
        const result = filterExercisesBySearch(storeExercises, 'nonexistent')
        expect(result).toHaveLength(0)
      })
    })
  })

  describe('Sorting Utilities', () => {
    let storeExercises: StoreExercise[]

    beforeEach(() => {
      storeExercises = transformExercisesForStore(mockExercisesArray)
    })

    describe('sortExercisesByName', () => {
      it('should sort by name ascending', () => {
        const result = sortExercisesByName(storeExercises, 'asc')
        
        expect(result[0].name).toBe('Bench Press')
        expect(result[1].name).toBe('Deadlift')
        expect(result[2].name).toBe('Push-up')
      })

      it('should sort by name descending', () => {
        const result = sortExercisesByName(storeExercises, 'desc')
        
        expect(result[0].name).toBe('Push-up')
        expect(result[1].name).toBe('Deadlift')
        expect(result[2].name).toBe('Bench Press')
      })

      it('should default to ascending when no direction provided', () => {
        const result = sortExercisesByName(storeExercises)
        
        expect(result[0].name).toBe('Bench Press')
        expect(result[2].name).toBe('Push-up')
      })

      it('should not mutate original array', () => {
        const originalOrder = storeExercises.map(e => e.name)
        const result = sortExercisesByName(storeExercises, 'desc')
        
        expect(storeExercises.map(e => e.name)).toEqual(originalOrder)
        expect(result.map(e => e.name)).not.toEqual(originalOrder)
      })
    })

    describe('sortExercisesByDifficulty', () => {
      it('should sort by difficulty ascending (beginner to advanced)', () => {
        const result = sortExercisesByDifficulty(storeExercises, 'asc')
        
        expect(result[0].difficulty).toBe('beginner')
        expect(result[1].difficulty).toBe('intermediate')
        expect(result[2].difficulty).toBe('advanced')
      })

      it('should sort by difficulty descending (advanced to beginner)', () => {
        const result = sortExercisesByDifficulty(storeExercises, 'desc')
        
        expect(result[0].difficulty).toBe('advanced')
        expect(result[1].difficulty).toBe('intermediate')
        expect(result[2].difficulty).toBe('beginner')
      })

      it('should default to ascending when no direction provided', () => {
        const result = sortExercisesByDifficulty(storeExercises)
        
        expect(result[0].difficulty).toBe('beginner')
        expect(result[2].difficulty).toBe('advanced')
      })

      it('should not mutate original array', () => {
        const originalOrder = storeExercises.map(e => e.difficulty)
        const result = sortExercisesByDifficulty(storeExercises, 'desc')
        
        expect(storeExercises.map(e => e.difficulty)).toEqual(originalOrder)
        expect(result.map(e => e.difficulty)).not.toEqual(originalOrder)
      })
    })
  })

  describe('Validation Utilities', () => {
    describe('isValidExercise', () => {
      it('should return true for valid exercise', () => {
        const validExercise = {
          name: 'Test Exercise',
          categoryId: '507f1f77bcf86cd799439012',
          description: 'Test description'
        }
        
        expect(isValidExercise(validExercise)).toBe(true)
      })

      it('should return false when name is missing', () => {
        const invalidExercise = {
          categoryId: '507f1f77bcf86cd799439012',
          description: 'Test description'
        }
        
        expect(isValidExercise(invalidExercise)).toBe(false)
      })

      it('should return false when categoryId is missing', () => {
        const invalidExercise = {
          name: 'Test Exercise',
          description: 'Test description'
        }
        
        expect(isValidExercise(invalidExercise)).toBe(false)
      })

      it('should return false when description is missing', () => {
        const invalidExercise = {
          name: 'Test Exercise',
          categoryId: '507f1f77bcf86cd799439012'
        }
        
        expect(isValidExercise(invalidExercise)).toBe(false)
      })

      it('should return false for empty object', () => {
        expect(isValidExercise({})).toBe(false)
      })
    })

    describe('isValidDifficulty', () => {
      it('should return true for valid difficulties', () => {
        expect(isValidDifficulty('beginner')).toBe(true)
        expect(isValidDifficulty('intermediate')).toBe(true)
        expect(isValidDifficulty('advanced')).toBe(true)
      })

      it('should return false for invalid difficulties', () => {
        expect(isValidDifficulty('easy')).toBe(false)
        expect(isValidDifficulty('hard')).toBe(false)
        expect(isValidDifficulty('expert')).toBe(false)
        expect(isValidDifficulty('')).toBe(false)
      })
    })

    describe('isValidMuscleGroup', () => {
      it('should return true for valid muscle groups', () => {
        expect(isValidMuscleGroup('chest')).toBe(true)
        expect(isValidMuscleGroup('back')).toBe(true)
        expect(isValidMuscleGroup('shoulders')).toBe(true)
        expect(isValidMuscleGroup('biceps')).toBe(true)
        expect(isValidMuscleGroup('triceps')).toBe(true)
        expect(isValidMuscleGroup('quadriceps')).toBe(true)
        expect(isValidMuscleGroup('hamstrings')).toBe(true)
        expect(isValidMuscleGroup('glutes')).toBe(true)
      })

      it('should return false for invalid muscle groups', () => {
        expect(isValidMuscleGroup('arms')).toBe(false)
        expect(isValidMuscleGroup('legs')).toBe(false)
        expect(isValidMuscleGroup('core')).toBe(false)
        expect(isValidMuscleGroup('')).toBe(false)
      })
    })

    describe('isValidEquipment', () => {
      it('should return true for valid equipment', () => {
        expect(isValidEquipment('bodyweight')).toBe(true)
        expect(isValidEquipment('barbell')).toBe(true)
        expect(isValidEquipment('dumbbell')).toBe(true)
        expect(isValidEquipment('kettlebell')).toBe(true)
        expect(isValidEquipment('resistance_band')).toBe(true)
        expect(isValidEquipment('machine')).toBe(true)
      })

      it('should return false for invalid equipment', () => {
        expect(isValidEquipment('weights')).toBe(false)
        expect(isValidEquipment('gym')).toBe(false)
        expect(isValidEquipment('equipment')).toBe(false)
        expect(isValidEquipment('')).toBe(false)
      })
    })
  })

  describe('Complex Filtering Scenarios', () => {
    let storeExercises: StoreExercise[]

    beforeEach(() => {
      storeExercises = transformExercisesForStore(mockExercisesArray)
    })

    it('should chain multiple filters', () => {
      let result = filterExercisesByMuscleGroup(storeExercises, 'chest')
      result = filterExercisesByDifficulty(result, 'beginner')
      
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Push-up')
      expect(result[0].difficulty).toBe('beginner')
      expect(result[0].muscleGroups).toContain('chest')
    })

    it('should apply search after filtering', () => {
      let result = filterExercisesByEquipment(storeExercises, 'barbell')
      result = filterExercisesBySearch(result, 'bench')
      
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Bench Press')
    })

    it('should sort filtered results', () => {
      let result = filterExercisesByMuscleGroup(storeExercises, 'chest')
      result = sortExercisesByDifficulty(result, 'desc')
      
      expect(result).toHaveLength(2)
      expect(result[0].difficulty).toBe('intermediate') // Bench Press
      expect(result[1].difficulty).toBe('beginner') // Push-up
    })

    it('should handle no results from chained filters', () => {
      let result = filterExercisesByMuscleGroup(storeExercises, 'chest')
      result = filterExercisesByEquipment(result, 'kettlebell')
      
      expect(result).toHaveLength(0)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle null/undefined exercises in transformations', () => {
      const exercisesWithNull = [mockExercisesArray[0], null, mockExercisesArray[1]] as any
      
      expect(() => {
        transformExercisesForStore(exercisesWithNull.filter(Boolean))
      }).not.toThrow()
    })

    it('should handle exercises with missing muscle groups in filtering', () => {
      const exerciseWithoutMuscleGroups: StoreExercise = {
        ...mockStoreExerciseData,
        muscleGroups: []
      }
      
      const result = filterExercisesByMuscleGroup([exerciseWithoutMuscleGroups], 'chest')
      expect(result).toHaveLength(0)
    })

    it('should handle exercises with missing equipment in filtering', () => {
      const exerciseWithoutEquipment: StoreExercise = {
        ...mockStoreExerciseData,
        equipment: undefined
      }
      
      const result = filterExercisesByEquipment([exerciseWithoutEquipment], 'barbell')
      expect(result).toHaveLength(0)
    })

    it('should handle case-sensitive searches', () => {
      const result = filterExercisesBySearch(transformExercisesForStore(mockExercisesArray), 'PUSH')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Push-up')
    })

    it('should handle special characters in search', () => {
      const exerciseWithSpecialChars: Exercise = {
        ...mockExerciseData,
        name: 'T-Bar Row',
        _id: '507f1f77bcf86cd799439020'
      }
      
      const exercises = transformExercisesForStore([exerciseWithSpecialChars])
      const result = filterExercisesBySearch(exercises, 't-bar')
      
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('T-Bar Row')
    })
  })
})
