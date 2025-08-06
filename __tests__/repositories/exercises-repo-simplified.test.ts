/**
 * Exercise Repository Test Suite (Simplified)
 * Tests the exercises repository methods with proper mocking
 */

// Mock MongoDB connection first
jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({})
}))

// Mock the Exercise model completely
jest.mock('@/lib/models/exercise', () => ({
  default: {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  }
}))

// Mock mongoose
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn()
    }
  }
}))

import exercisesRepo from '@/lib/repositories/exercises-repo'
import Exercise from '@/lib/models/exercise'
import mongoose from 'mongoose'

const mockExercise = Exercise as any
const mockMongoose = mongoose as jest.Mocked<typeof mongoose>

// Sample test data with correct types
const sampleExercise = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Push-up',
  categoryId: '507f1f77bcf86cd799439012',
  description: 'Basic bodyweight exercise',
  difficulty: 'beginner',
  muscleGroups: ['chest', 'triceps'],
  equipment: ['bodyweight'],
  instructions: ['Get into plank', 'Lower body', 'Push up'],
  tips: ['Keep core tight'],
  isActive: true,
  createdBy: '507f1f77bcf86cd799439013',
  updatedBy: '507f1f77bcf86cd799439013',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
}

const sampleExercises = [
  sampleExercise,
  {
    ...sampleExercise,
    _id: '507f1f77bcf86cd799439014',
    name: 'Bench Press',
    difficulty: 'intermediate',
    equipment: ['barbell', 'bench']
  }
]

describe('Exercise Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true)
  })

  describe('findAll', () => {
    it('should return all exercises with lean queries', async () => {
      const mockLean = jest.fn().mockResolvedValue(sampleExercises)
      mockExercise.find.mockReturnValue({ lean: mockLean })

      const result = await exercisesRepo.findAll()

      expect(mockExercise.find).toHaveBeenCalledWith()
      expect(mockLean).toHaveBeenCalled()
      expect(result).toEqual(sampleExercises)
    })

    it('should handle database errors gracefully', async () => {
      const mockLean = jest.fn().mockRejectedValue(new Error('Database error'))
      mockExercise.find.mockReturnValue({ lean: mockLean })

      await expect(exercisesRepo.findAll()).rejects.toThrow('Database error')
    })
  })

  describe('findById', () => {
    it('should find exercise by ID', async () => {
      const mockLean = jest.fn().mockResolvedValue(sampleExercise)
      mockExercise.findById.mockReturnValue({ lean: mockLean })

      const result = await exercisesRepo.findById('507f1f77bcf86cd799439011')

      expect(mockExercise.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011')
      expect(result).toEqual(sampleExercise)
    })

    it('should return null for non-existent exercise', async () => {
      const mockLean = jest.fn().mockResolvedValue(null)
      mockExercise.findById.mockReturnValue({ lean: mockLean })

      const result = await exercisesRepo.findById('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('findByCategory', () => {
    it('should filter exercises by category', async () => {
      const categoryId = '507f1f77bcf86cd799439012'
      const mockLean = jest.fn().mockResolvedValue(sampleExercises)
      mockExercise.find.mockReturnValue({ lean: mockLean })

      const result = await exercisesRepo.findByCategory(categoryId)

      expect(mockExercise.find).toHaveBeenCalledWith({ categoryId })
      expect(result).toEqual(sampleExercises)
    })
  })

  describe('findByDifficulty', () => {
    it('should filter exercises by difficulty', async () => {
      const mockLean = jest.fn().mockResolvedValue([sampleExercise])
      mockExercise.find.mockReturnValue({ lean: mockLean })

      const result = await exercisesRepo.findByDifficulty('beginner')

      expect(mockExercise.find).toHaveBeenCalledWith({ difficulty: 'beginner' })
      expect(result).toEqual([sampleExercise])
    })
  })

  describe('findByMuscleGroups', () => {
    it('should filter exercises by muscle groups', async () => {
      const muscleGroups = ['chest', 'triceps']
      const mockLean = jest.fn().mockResolvedValue(sampleExercises)
      mockExercise.find.mockReturnValue({ lean: mockLean })

      const result = await exercisesRepo.findByMuscleGroups(muscleGroups)

      expect(mockExercise.find).toHaveBeenCalledWith({
        muscleGroups: { $in: muscleGroups }
      })
      expect(result).toEqual(sampleExercises)
    })
  })

  describe('findActive', () => {
    it('should find only active exercises', async () => {
      const mockLean = jest.fn().mockResolvedValue(sampleExercises)
      mockExercise.find.mockReturnValue({ lean: mockLean })

      const result = await exercisesRepo.findActive()

      expect(mockExercise.find).toHaveBeenCalledWith({ isActive: true })
      expect(result).toEqual(sampleExercises)
    })
  })

  describe('create', () => {
    it('should create new exercise', async () => {
      const exerciseData = {
        name: 'New Exercise',
        categoryId: '507f1f77bcf86cd799439012',
        description: 'A new exercise',
        createdBy: '507f1f77bcf86cd799439013'
      }

      mockExercise.create.mockResolvedValue(sampleExercise)

      const result = await exercisesRepo.create(exerciseData)

      expect(mockExercise.create).toHaveBeenCalledWith(exerciseData)
      expect(result).toEqual(sampleExercise)
    })

    it('should handle validation errors', async () => {
      const invalidData = { 
        name: '', 
        categoryId: '507f1f77bcf86cd799439012',
        createdBy: '507f1f77bcf86cd799439013'
      }
      mockExercise.create.mockRejectedValue(new Error('Validation failed'))

      await expect(exercisesRepo.create(invalidData)).rejects.toThrow('Validation failed')
    })
  })

  describe('update', () => {
    it('should update exercise', async () => {
      const updateData = {
        name: 'Updated Exercise',
        updatedBy: '507f1f77bcf86cd799439013'
      }

      const updatedExercise = { ...sampleExercise, ...updateData }
      mockExercise.findByIdAndUpdate.mockResolvedValue(updatedExercise)

      const result = await exercisesRepo.update('507f1f77bcf86cd799439011', updateData)

      expect(mockExercise.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateData,
        { new: true }
      )
      expect(result).toEqual(updatedExercise)
    })

    it('should return null for non-existent exercise', async () => {
      mockExercise.findByIdAndUpdate.mockResolvedValue(null)

      const result = await exercisesRepo.update('nonexistent', { 
        name: 'Test',
        updatedBy: '507f1f77bcf86cd799439013'
      })
      expect(result).toBeNull()
    })
  })

  describe('delete', () => {
    it('should delete exercise by ID', async () => {
      mockExercise.findByIdAndDelete.mockResolvedValue(sampleExercise)

      const result = await exercisesRepo.delete('507f1f77bcf86cd799439011')

      expect(mockExercise.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011')
      expect(result).toEqual(sampleExercise)
    })

    it('should return null for non-existent exercise', async () => {
      mockExercise.findByIdAndDelete.mockResolvedValue(null)

      const result = await exercisesRepo.delete('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('toggleActiveStatus', () => {
    it('should toggle active status', async () => {
      const inactiveExercise = { ...sampleExercise, isActive: false }
      mockExercise.findByIdAndUpdate.mockResolvedValue(inactiveExercise)

      const result = await exercisesRepo.toggleActiveStatus('507f1f77bcf86cd799439011', false, '507f1f77bcf86cd799439013')

      expect(mockExercise.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { isActive: false },
        { new: true }
      )
      expect(result).toEqual(inactiveExercise)
    })
  })

  describe('Performance Tests', () => {
    it('should use lean queries for read operations', async () => {
      const mockLean = jest.fn().mockResolvedValue(sampleExercises)
      mockExercise.find.mockReturnValue({ lean: mockLean })

      await exercisesRepo.findAll()
      await exercisesRepo.findActive()
      await exercisesRepo.findByCategory('test')

      expect(mockLean).toHaveBeenCalledTimes(3)
    })

    it('should handle concurrent requests', async () => {
      const mockLean = jest.fn().mockResolvedValue(sampleExercises)
      mockExercise.find.mockReturnValue({ lean: mockLean })

      const promises = [
        exercisesRepo.findAll(),
        exercisesRepo.findActive(),
        exercisesRepo.findByDifficulty('beginner')
      ]

      const results = await Promise.all(promises)
      
      expect(results).toHaveLength(3)
      expect(mockExercise.find).toHaveBeenCalledTimes(3)
    })
  })

  describe('Error Handling', () => {
    it('should handle connection timeout', async () => {
      const mockLean = jest.fn().mockRejectedValue(new Error('Connection timeout'))
      mockExercise.find.mockReturnValue({ lean: mockLean })

      await expect(exercisesRepo.findAll()).rejects.toThrow('Connection timeout')
    })

    it('should handle invalid ObjectId gracefully', async () => {
      mockMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false)
      const mockLean = jest.fn().mockRejectedValue(new Error('Invalid ObjectId'))
      mockExercise.findById.mockReturnValue({ lean: mockLean })

      await expect(exercisesRepo.findById('invalid-id')).rejects.toThrow('Invalid ObjectId')
    })
  })

  describe('Integration Scenarios', () => {
    it('should support complete CRUD workflow', async () => {
      // Create
      mockExercise.create.mockResolvedValue(sampleExercise)
      const created = await exercisesRepo.create({
        name: 'Test Exercise',
        categoryId: '507f1f77bcf86cd799439012',
        description: 'Test description',
        createdBy: '507f1f77bcf86cd799439013'
      })
      expect(created).toEqual(sampleExercise)

      // Read
      const mockLean = jest.fn().mockResolvedValue(sampleExercise)
      mockExercise.findById.mockReturnValue({ lean: mockLean })
      const found = await exercisesRepo.findById('507f1f77bcf86cd799439011')
      expect(found).toEqual(sampleExercise)

      // Update
      const updated = { ...sampleExercise, name: 'Updated Exercise' }
      mockExercise.findByIdAndUpdate.mockResolvedValue(updated)
      const result = await exercisesRepo.update('507f1f77bcf86cd799439011', { 
        name: 'Updated Exercise',
        updatedBy: '507f1f77bcf86cd799439013'
      })
      expect(result).toEqual(updated)

      // Delete
      mockExercise.findByIdAndDelete.mockResolvedValue(sampleExercise)
      const deleted = await exercisesRepo.delete('507f1f77bcf86cd799439011')
      expect(deleted).toEqual(sampleExercise)
    })

    it('should handle complex filtering combinations', async () => {
      const mockLean = jest.fn().mockResolvedValue([sampleExercise])
      mockExercise.find.mockReturnValue({ lean: mockLean })

      // Test multiple filter methods
      await exercisesRepo.findByDifficulty('beginner')
      await exercisesRepo.findByMuscleGroups(['chest'])
      await exercisesRepo.findActive()

      expect(mockExercise.find).toHaveBeenCalledTimes(3)
      expect(mockExercise.find).toHaveBeenCalledWith({ difficulty: 'beginner' })
      expect(mockExercise.find).toHaveBeenCalledWith({ muscleGroups: { $in: ['chest'] } })
      expect(mockExercise.find).toHaveBeenCalledWith({ isActive: true })
    })
  })
})
