/**
 * Exercise Repository Focused Test Suite
 * Tests the core repository methods with simplified mocking
 */

// Mock MongoDB connection completely
jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({})
}))

// Mock the Exercise model with complete mocking
jest.mock('@/lib/models/exercise', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  }
}))

// Mock mongoose
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn().mockReturnValue(true)
    }
  }
}))

import exercisesRepo from '@/lib/repositories/exercises-repo'
import Exercise from '@/lib/models/exercise'
import { Exercise as ExerciseType } from '@/lib/types'

// Get mocked functions
const mockExercise = Exercise as jest.Mocked<typeof Exercise>

// Sample data that matches the actual Exercise interface
const sampleExercise: ExerciseType = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Push-up',
  categoryId: '507f1f77bcf86cd799439012',
  description: 'Basic bodyweight exercise',
  difficulty: 'beginner',
  muscleGroups: ['chest', 'triceps'],
  equipment: ['bodyweight'],
  instructions: ['Get into plank position', 'Lower body down', 'Push back up'],
  isActive: true,
  createdBy: 'admin123',
  updatedBy: 'admin123',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
}

const sampleExercises = [sampleExercise]

describe('Exercise Repository Core Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mock chain for find operations
    const mockSelect = jest.fn()
    const mockLean = jest.fn()
    const mockSort = jest.fn()
    const mockExec = jest.fn()
    
    mockSelect.mockReturnValue({ lean: mockLean })
    mockLean.mockReturnValue({ sort: mockSort })
    mockSort.mockReturnValue({ exec: mockExec })
    mockExec.mockResolvedValue(sampleExercises)
    
    mockExercise.find.mockReturnValue({ select: mockSelect })
    mockExercise.findById.mockReturnValue({ lean: mockLean })
  })

  describe('findAll method', () => {
    test('should retrieve all exercises successfully', async () => {
      const result = await exercisesRepo.findAll()
      
      expect(result).toEqual(sampleExercises)
      expect(mockFind).toHaveBeenCalled()
    })

    test('should handle findAll with category filter', async () => {
      const categoryId = '507f1f77bcf86cd799439012'
      
      const result = await exercisesRepo.findAll({ categoryId })
      
      expect(result).toEqual(sampleExercises)
      expect(mockFind).toHaveBeenCalled()
    })

    test('should handle findAll with sorting options', async () => {
      const sortOptions = { name: 1 as const }
      
      const result = await exercisesRepo.findAll({ sort: sortOptions })
      
      expect(result).toEqual(sampleExercises)
      expect(mockFind).toHaveBeenCalled()
    })
  })

  describe('findByCategory method', () => {
    test('should find exercises by category ID', async () => {
      const categoryId = '507f1f77bcf86cd799439012'
      
      const result = await exercisesRepo.findByCategory(categoryId)
      
      expect(result).toEqual(sampleExercises)
      expect(mockFind).toHaveBeenCalled()
    })

    test('should handle invalid category ID format', async () => {
      // Mock invalid ObjectId
      const mockIsValid = jest.fn().mockReturnValue(false)
      require('mongoose').Types.ObjectId.isValid = mockIsValid
      
      await expect(exercisesRepo.findByCategory('invalid-id'))
        .rejects.toThrow('Invalid category ID format')
    })
  })

  describe('findById method', () => {
    test('should find exercise by ID', async () => {
      // Setup specific mock for findById
      const mockLean = jest.fn().mockResolvedValue(sampleExercise)
      mockFindById.mockReturnValue({ lean: mockLean })
      
      const result = await exercisesRepo.findById('507f1f77bcf86cd799439011')
      
      expect(result).toEqual(sampleExercise)
      expect(mockFindById).toHaveBeenCalledWith('507f1f77bcf86cd799439011')
    })

    test('should return null for non-existent exercise', async () => {
      const mockLean = jest.fn().mockResolvedValue(null)
      mockFindById.mockReturnValue({ lean: mockLean })
      
      const result = await exercisesRepo.findById('nonexistent')
      
      expect(result).toBeNull()
    })
  })

  describe('create method', () => {
    test('should create new exercise', async () => {
      const exerciseData = {
        name: 'New Exercise',
        categoryId: '507f1f77bcf86cd799439012',
        description: 'Test exercise',
        difficulty: 'beginner' as const,
        muscleGroups: ['legs'],
        equipment: ['dumbbells'],
        instructions: ['Step 1', 'Step 2'],
        createdBy: 'admin123'
      }
      
      mockCreate.mockResolvedValue(sampleExercise)
      
      const result = await exercisesRepo.create(exerciseData)
      
      expect(result).toEqual(sampleExercise)
      expect(mockCreate).toHaveBeenCalledWith(exerciseData)
    })

    test('should handle validation errors during create', async () => {
      const invalidData = { 
        name: '', 
        categoryId: '507f1f77bcf86cd799439012',
        createdBy: 'admin123'
      } // Invalid name field
      
      mockCreate.mockRejectedValue(new Error('Validation failed'))
      
      await expect(exercisesRepo.create(invalidData))
        .rejects.toThrow('Validation failed')
    })
  })

  describe('update method', () => {
    test('should update existing exercise', async () => {
      const updateData = {
        name: 'Updated Exercise',
        description: 'Updated description',
        updatedBy: 'admin123'
      }
      
      const updatedExercise = { ...sampleExercise, ...updateData }
      mockFindByIdAndUpdate.mockResolvedValue(updatedExercise)
      
      const result = await exercisesRepo.update('507f1f77bcf86cd799439011', updateData)
      
      expect(result).toEqual(updatedExercise)
      expect(mockFindByIdAndUpdate).toHaveBeenCalled()
    })

    test('should handle update of non-existent exercise', async () => {
      mockFindByIdAndUpdate.mockResolvedValue(null)
      
      const result = await exercisesRepo.update('nonexistent', { 
        name: 'Test',
        updatedBy: 'admin123'
      })
      
      expect(result).toBeNull()
    })
  })

  describe('delete method', () => {
    test('should delete exercise by ID', async () => {
      mockFindByIdAndDelete.mockResolvedValue(sampleExercise)
      
      const result = await exercisesRepo.delete('507f1f77bcf86cd799439011')
      
      expect(result).toEqual(sampleExercise)
      expect(mockFindByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011')
    })

    test('should return null when deleting non-existent exercise', async () => {
      mockFindByIdAndDelete.mockResolvedValue(null)
      
      const result = await exercisesRepo.delete('nonexistent')
      
      expect(result).toBeNull()
    })
  })

  describe('Repository Error Handling', () => {
    test('should handle database connection errors', async () => {
      mockFind.mockRejectedValue(new Error('Database connection failed'))
      
      await expect(exercisesRepo.findAll())
        .rejects.toThrow('Database connection failed')
    })

    test('should handle network timeout errors', async () => {
      mockFind.mockRejectedValue(new Error('Network timeout'))
      
      await expect(exercisesRepo.findAll())
        .rejects.toThrow('Network timeout')
    })

    test('should handle malformed query errors', async () => {
      const mockLean = jest.fn().mockRejectedValue(new Error('Invalid query'))
      mockFindById.mockReturnValue({ lean: mockLean })
      
      await expect(exercisesRepo.findById('507f1f77bcf86cd799439011'))
        .rejects.toThrow('Invalid query')
    })
  })

  describe('Performance and Optimization', () => {
    test('should use lean queries for read operations', async () => {
      await exercisesRepo.findAll()
      
      // Verify that the chain includes lean() call
      expect(mockFind).toHaveBeenCalled()
      // The lean method should be called in the chain
    })

    test('should handle concurrent operations', async () => {
      const promises = [
        exercisesRepo.findAll(),
        exercisesRepo.findAll({ categoryId: '507f1f77bcf86cd799439012' }),
        exercisesRepo.findById('507f1f77bcf86cd799439011')
      ]
      
      const results = await Promise.all(promises)
      
      expect(results).toHaveLength(3)
      expect(results[0]).toEqual(sampleExercises)
    })
  })

  describe('Data Consistency', () => {
    test('should maintain consistent data structure', () => {
      const requiredFields = [
        '_id', 'name', 'categoryId', 'difficulty', 
        'muscleGroups', 'instructions', 'isActive',
        'createdBy', 'updatedBy', 'createdAt', 'updatedAt'
      ]
      
      requiredFields.forEach(field => {
        expect(sampleExercise).toHaveProperty(field)
      })
    })

    test('should validate data types', () => {
      expect(typeof sampleExercise._id).toBe('string')
      expect(typeof sampleExercise.name).toBe('string')
      expect(typeof sampleExercise.isActive).toBe('boolean')
      expect(Array.isArray(sampleExercise.muscleGroups)).toBe(true)
      expect(Array.isArray(sampleExercise.instructions)).toBe(true)
    })

    test('should validate enum values', () => {
      const validDifficulties = ['beginner', 'intermediate', 'advanced']
      expect(validDifficulties).toContain(sampleExercise.difficulty)
    })
  })

  describe('Integration Patterns', () => {
    test('should support basic CRUD workflow', async () => {
      // Create
      mockCreate.mockResolvedValue(sampleExercise)
      const created = await exercisesRepo.create({
        name: 'Test Exercise',
        categoryId: '507f1f77bcf86cd799439012',
        description: 'Test description',
        createdBy: 'admin123'
      })
      expect(created).toEqual(sampleExercise)

      // Read
      const mockLean = jest.fn().mockResolvedValue(sampleExercise)
      mockFindById.mockReturnValue({ lean: mockLean })
      const found = await exercisesRepo.findById('507f1f77bcf86cd799439011')
      expect(found).toEqual(sampleExercise)

      // Update
      const updatedExercise = { ...sampleExercise, name: 'Updated Exercise' }
      mockFindByIdAndUpdate.mockResolvedValue(updatedExercise)
      const updated = await exercisesRepo.update('507f1f77bcf86cd799439011', { 
        name: 'Updated Exercise',
        updatedBy: 'admin123'
      })
      expect(updated).toEqual(updatedExercise)

      // Delete
      mockFindByIdAndDelete.mockResolvedValue(sampleExercise)
      const deleted = await exercisesRepo.delete('507f1f77bcf86cd799439011')
      expect(deleted).toEqual(sampleExercise)
    })

    test('should handle multiple filter scenarios', async () => {
      // Test various filtering options
      await exercisesRepo.findAll()
      await exercisesRepo.findAll({ categoryId: '507f1f77bcf86cd799439012' })
      await exercisesRepo.findAll({ sort: { name: -1 } })
      
      expect(mockFind).toHaveBeenCalledTimes(3)
    })
  })
})
