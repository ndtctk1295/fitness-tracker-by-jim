/**
 * Exercise Repository Test Suite
 * Tests the exercises-repo.ts functionality including CRUD operations,
 * filtering, and database interactions
 */

import exercisesRepo from '@/lib/repositories/exercises-repo'
import Exercise from '@/lib/models/exercise'
import mongoose from 'mongoose'

// Mock the Exercise model and mongoose connection
jest.mock('@/lib/models/exercise')
jest.mock('@/lib/mongodb')
jest.mock('mongoose')

const mockExercise = Exercise as jest.Mocked<typeof Exercise>
const mockMongoose = mongoose as jest.Mocked<typeof mongoose>

// Sample test data
const mockExerciseData = {
  _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
  name: 'Push-up',
  categoryId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
  description: 'Basic bodyweight exercise',
  imageUrl: 'push-up.jpg',
  isActive: true,
  difficulty: 'beginner' as const,
  muscleGroups: ['chest', 'triceps', 'shoulders'],
  equipment: ['bodyweight'],
  instructions: ['Get into plank position', 'Lower your body', 'Push back up'],
  tips: ['Keep core tight', 'Control the movement'],
  createdBy: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
  updatedBy: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

const mockExerciseList = [
  mockExerciseData,
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439014'),
    name: 'Bench Press',
    categoryId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439015'),
    description: 'Weight training exercise',
    difficulty: 'intermediate' as const,
    muscleGroups: ['chest', 'triceps'],
    equipment: ['barbell', 'bench'],
    instructions: ['Lie on bench', 'Grip barbell', 'Lower to chest', 'Press up'],
    tips: ['Use spotter for safety'],
    isActive: true,
    createdBy: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
    updatedBy: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

describe('Exercises Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock mongoose ObjectId validation
    mockMongoose.Types.ObjectId.isValid.mockReturnValue(true)
    
    // Mock the query chain methods
    const mockQueryChain = {
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(),
      populate: jest.fn().mockReturnThis(),
    }

    mockExercise.find = jest.fn().mockReturnValue(mockQueryChain)
    mockExercise.findById = jest.fn().mockReturnValue(mockQueryChain)
    mockExercise.findByIdAndUpdate = jest.fn().mockReturnValue(mockQueryChain)
    mockExercise.findByIdAndDelete = jest.fn().mockReturnValue(mockQueryChain)
    mockExercise.prototype.save = jest.fn()
  })

  describe('findAll', () => {
    it('should retrieve all exercises with default sorting', async () => {
      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockExerciseList),
      }

      mockExercise.find.mockReturnValue(mockQueryChain as any)

      const result = await exercisesRepo.findAll()

      expect(mockExercise.find).toHaveBeenCalledWith({})
      expect(mockQueryChain.select).toHaveBeenCalledWith('_id name categoryId description imageUrl createdBy createdAt updatedAt')
      expect(mockQueryChain.sort).toHaveBeenCalledWith({ name: 1 })
      expect(mockQueryChain.lean).toHaveBeenCalled()
      expect(result).toEqual(mockExerciseList)
    })

    it('should retrieve exercises by category', async () => {
      const categoryId = '507f1f77bcf86cd799439012'
      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockExerciseData]),
      }

      mockExercise.find.mockReturnValue(mockQueryChain as any)

      const result = await exercisesRepo.findAll({ categoryId })

      expect(mockExercise.find).toHaveBeenCalledWith({
        categoryId: new mongoose.Types.ObjectId(categoryId)
      })
      expect(result).toHaveLength(1)
    })

    it('should apply custom sorting', async () => {
      const customSort = { createdAt: -1 }
      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockExerciseList),
      }

      mockExercise.find.mockReturnValue(mockQueryChain as any)

      await exercisesRepo.findAll({ sort: customSort })

      expect(mockQueryChain.sort).toHaveBeenCalledWith(customSort)
    })

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed')
      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(error),
      }

      mockExercise.find.mockReturnValue(mockQueryChain as any)

      await expect(exercisesRepo.findAll()).rejects.toThrow('Database connection failed')
    })
  })

  describe('findByCategory', () => {
    it('should retrieve exercises by category ID', async () => {
      const categoryId = '507f1f77bcf86cd799439012'
      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockExerciseData]),
      }

      mockExercise.find.mockReturnValue(mockQueryChain as any)

      const result = await exercisesRepo.findByCategory(categoryId)

      expect(mockExercise.find).toHaveBeenCalledWith({
        categoryId: new mongoose.Types.ObjectId(categoryId)
      })
      expect(mockQueryChain.select).toHaveBeenCalledWith('_id name description imageUrl createdAt')
      expect(mockQueryChain.sort).toHaveBeenCalledWith({ name: 1 })
      expect(result).toEqual([mockExerciseData])
    })

    it('should throw error for invalid category ID', async () => {
      mockMongoose.Types.ObjectId.isValid.mockReturnValue(false)

      await expect(exercisesRepo.findByCategory('invalid-id'))
        .rejects.toThrow('Invalid category ID format')
    })

    it('should handle empty results', async () => {
      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }

      mockExercise.find.mockReturnValue(mockQueryChain as any)

      const result = await exercisesRepo.findByCategory('507f1f77bcf86cd799439012')
      expect(result).toEqual([])
    })
  })

  describe('findByCreator', () => {
    it('should retrieve exercises by creator ID', async () => {
      const creatorId = '507f1f77bcf86cd799439013'
      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockExerciseList),
      }

      mockExercise.find.mockReturnValue(mockQueryChain as any)

      const result = await exercisesRepo.findByCreator(creatorId)

      expect(mockExercise.find).toHaveBeenCalledWith({
        createdBy: new mongoose.Types.ObjectId(creatorId)
      })
      expect(result).toEqual(mockExerciseList)
    })

    it('should throw error for invalid creator ID', async () => {
      mockMongoose.Types.ObjectId.isValid.mockReturnValue(false)

      await expect(exercisesRepo.findByCreator('invalid-id'))
        .rejects.toThrow('Invalid creator ID format')
    })
  })

  describe('findById', () => {
    it('should retrieve exercise by ID', async () => {
      const exerciseId = '507f1f77bcf86cd799439011'
      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockExerciseData),
      }

      mockExercise.findById.mockReturnValue(mockQueryChain as any)

      const result = await exercisesRepo.findById(exerciseId)

      expect(mockExercise.findById).toHaveBeenCalledWith(exerciseId)
      expect(mockQueryChain.select).toHaveBeenCalledWith('_id name categoryId description imageUrl createdBy updatedBy createdAt updatedAt')
      expect(result).toEqual(mockExerciseData)
    })

    it('should return null for non-existent exercise', async () => {
      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      }

      mockExercise.findById.mockReturnValue(mockQueryChain as any)

      const result = await exercisesRepo.findById('507f1f77bcf86cd799439011')
      expect(result).toBeNull()
    })

    it('should throw error for invalid exercise ID', async () => {
      mockMongoose.Types.ObjectId.isValid.mockReturnValue(false)

      await expect(exercisesRepo.findById('invalid-id'))
        .rejects.toThrow('Invalid exercise ID format')
    })
  })

  describe('create', () => {
    it('should create a new exercise', async () => {
      const exerciseData = {
        name: 'New Exercise',
        categoryId: '507f1f77bcf86cd799439012',
        description: 'A new exercise',
        createdBy: '507f1f77bcf86cd799439013'
      }

      const mockSave = jest.fn().mockResolvedValue(mockExerciseData)
      mockExercise.mockImplementation(() => ({
        save: mockSave
      } as any))

      const result = await exercisesRepo.create(exerciseData)

      expect(mockExercise).toHaveBeenCalledWith({
        ...exerciseData,
        updatedBy: exerciseData.createdBy
      })
      expect(mockSave).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('should handle validation errors', async () => {
      const exerciseData = {
        name: '',
        categoryId: '507f1f77bcf86cd799439012',
        createdBy: '507f1f77bcf86cd799439013'
      }

      const mockSave = jest.fn().mockRejectedValue(new Error('Validation failed'))
      mockExercise.mockImplementation(() => ({
        save: mockSave
      } as any))

      await expect(exercisesRepo.create(exerciseData))
        .rejects.toThrow('Validation failed')
    })
  })

  describe('update', () => {
    it('should update an existing exercise', async () => {
      const exerciseId = '507f1f77bcf86cd799439011'
      const updateData = {
        name: 'Updated Exercise',
        description: 'Updated description',
        updatedBy: '507f1f77bcf86cd799439013'
      }

      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ ...mockExerciseData, ...updateData }),
      }

      mockExercise.findByIdAndUpdate.mockReturnValue(mockQueryChain as any)

      const result = await exercisesRepo.update(exerciseId, updateData)

      expect(mockExercise.findByIdAndUpdate).toHaveBeenCalledWith(
        exerciseId,
        expect.objectContaining({
          name: 'Updated Exercise',
          description: 'Updated description',
          updatedBy: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013')
        }),
        { new: true, runValidators: true, lean: true }
      )
      expect(result).toBeDefined()
    })

    it('should handle ObjectId conversion for categoryId', async () => {
      const exerciseId = '507f1f77bcf86cd799439011'
      const updateData = {
        categoryId: '507f1f77bcf86cd799439015',
        updatedBy: '507f1f77bcf86cd799439013'
      }

      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockExerciseData),
      }

      mockExercise.findByIdAndUpdate.mockReturnValue(mockQueryChain as any)

      await exercisesRepo.update(exerciseId, updateData)

      expect(mockExercise.findByIdAndUpdate).toHaveBeenCalledWith(
        exerciseId,
        expect.objectContaining({
          categoryId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439015')
        }),
        expect.any(Object)
      )
    })

    it('should return null for non-existent exercise', async () => {
      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      }

      mockExercise.findByIdAndUpdate.mockReturnValue(mockQueryChain as any)

      const result = await exercisesRepo.update('507f1f77bcf86cd799439011', {
        name: 'Updated',
        updatedBy: '507f1f77bcf86cd799439013'
      })

      expect(result).toBeNull()
    })

    it('should throw error for invalid exercise ID', async () => {
      mockMongoose.Types.ObjectId.isValid.mockReturnValue(false)

      await expect(exercisesRepo.update('invalid-id', {
        name: 'Updated',
        updatedBy: '507f1f77bcf86cd799439013'
      })).rejects.toThrow('Invalid exercise ID format')
    })
  })

  describe('delete', () => {
    it('should delete an exercise by ID', async () => {
      const exerciseId = '507f1f77bcf86cd799439011'
      const mockQueryChain = {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockExerciseData),
      }

      mockExercise.findByIdAndDelete.mockReturnValue(mockQueryChain as any)

      const result = await exercisesRepo.delete(exerciseId)

      expect(mockExercise.findByIdAndDelete).toHaveBeenCalledWith(exerciseId)
      expect(result).toEqual(mockExerciseData)
    })

    it('should return null for non-existent exercise', async () => {
      const mockQueryChain = {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      }

      mockExercise.findByIdAndDelete.mockReturnValue(mockQueryChain as any)

      const result = await exercisesRepo.delete('507f1f77bcf86cd799439011')
      expect(result).toBeNull()
    })

    it('should throw error for invalid exercise ID', async () => {
      mockMongoose.Types.ObjectId.isValid.mockReturnValue(false)

      await expect(exercisesRepo.delete('invalid-id'))
        .rejects.toThrow('Invalid exercise ID format')
    })
  })

  describe('findActive', () => {
    it('should retrieve only active exercises', async () => {
      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockExerciseList),
      }

      mockExercise.find.mockReturnValue(mockQueryChain as any)

      const result = await exercisesRepo.findActive()

      expect(mockExercise.find).toHaveBeenCalledWith({ isActive: true })
      expect(mockQueryChain.select).toHaveBeenCalledWith('_id name categoryId description imageUrl difficulty muscleGroups equipment instructions tips isActive createdAt updatedAt')
      expect(result).toEqual(mockExerciseList)
    })

    it('should filter by difficulty', async () => {
      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockExerciseData]),
      }

      mockExercise.find.mockReturnValue(mockQueryChain as any)

      await exercisesRepo.findActive({ difficulty: 'beginner' })

      expect(mockExercise.find).toHaveBeenCalledWith({
        isActive: true,
        difficulty: 'beginner'
      })
    })

    it('should filter by category and muscle groups', async () => {
      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockExerciseData]),
      }

      mockExercise.find.mockReturnValue(mockQueryChain as any)

      await exercisesRepo.findActive({
        categoryId: '507f1f77bcf86cd799439012',
        muscleGroups: ['chest', 'triceps']
      })

      expect(mockExercise.find).toHaveBeenCalledWith({
        isActive: true,
        categoryId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
        muscleGroups: { $in: ['chest', 'triceps'] }
      })
    })
  })

  describe('findByDifficulty', () => {
    it('should retrieve exercises by difficulty level', async () => {
      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockExerciseData]),
      }

      mockExercise.find.mockReturnValue(mockQueryChain as any)

      const result = await exercisesRepo.findByDifficulty('beginner')

      expect(mockExercise.find).toHaveBeenCalledWith({
        isActive: true,
        difficulty: 'beginner'
      })
      expect(result).toEqual([mockExerciseData])
    })

    it('should handle all difficulty levels', async () => {
      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }

      mockExercise.find.mockReturnValue(mockQueryChain as any)

      await exercisesRepo.findByDifficulty('intermediate')
      expect(mockExercise.find).toHaveBeenCalledWith({ isActive: true, difficulty: 'intermediate' })

      await exercisesRepo.findByDifficulty('advanced')
      expect(mockExercise.find).toHaveBeenCalledWith({ isActive: true, difficulty: 'advanced' })
    })
  })

  describe('findByMuscleGroups', () => {
    it('should retrieve exercises by muscle groups', async () => {
      const muscleGroups = ['chest', 'triceps']
      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockExerciseList),
      }

      mockExercise.find.mockReturnValue(mockQueryChain as any)

      const result = await exercisesRepo.findByMuscleGroups(muscleGroups)

      expect(mockExercise.find).toHaveBeenCalledWith({
        isActive: true,
        muscleGroups: { $in: muscleGroups }
      })
      expect(result).toEqual(mockExerciseList)
    })

    it('should handle single muscle group', async () => {
      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockExerciseData]),
      }

      mockExercise.find.mockReturnValue(mockQueryChain as any)

      await exercisesRepo.findByMuscleGroups(['chest'])

      expect(mockExercise.find).toHaveBeenCalledWith({
        isActive: true,
        muscleGroups: { $in: ['chest'] }
      })
    })
  })

  describe('toggleActiveStatus', () => {
    it('should toggle exercise active status', async () => {
      const exerciseId = '507f1f77bcf86cd799439011'
      const updatedBy = '507f1f77bcf86cd799439013'
      const mockQueryChain = {
        exec: jest.fn().mockResolvedValue({ ...mockExerciseData, isActive: false }),
      }

      mockExercise.findByIdAndUpdate.mockReturnValue(mockQueryChain as any)

      const result = await exercisesRepo.toggleActiveStatus(exerciseId, false, updatedBy)

      expect(mockExercise.findByIdAndUpdate).toHaveBeenCalledWith(
        exerciseId,
        {
          isActive: false,
          updatedBy: new mongoose.Types.ObjectId(updatedBy)
        },
        { new: true, runValidators: true, lean: true }
      )
      expect(result).toBeDefined()
    })

    it('should throw error for invalid IDs', async () => {
      mockMongoose.Types.ObjectId.isValid.mockReturnValue(false)

      await expect(exercisesRepo.toggleActiveStatus('invalid-id', true, 'invalid-user'))
        .rejects.toThrow('Invalid exercise ID format')
    })
  })

  describe('findAllForAdmin', () => {
    it('should retrieve all exercises with populated fields for admin', async () => {
      const mockQueryChain = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockExerciseList),
      }

      mockExercise.find.mockReturnValue(mockQueryChain as any)

      const result = await exercisesRepo.findAllForAdmin()

      expect(mockExercise.find).toHaveBeenCalledWith({})
      expect(mockQueryChain.populate).toHaveBeenCalledWith('categoryId', 'name')
      expect(mockQueryChain.populate).toHaveBeenCalledWith('createdBy', 'name email')
      expect(mockQueryChain.populate).toHaveBeenCalledWith('updatedBy', 'name email')
      expect(mockQueryChain.sort).toHaveBeenCalledWith({ createdAt: -1 })
      expect(result).toEqual(mockExerciseList)
    })

    it('should filter by category for admin', async () => {
      const categoryId = '507f1f77bcf86cd799439012'
      const mockQueryChain = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockExerciseData]),
      }

      mockExercise.find.mockReturnValue(mockQueryChain as any)

      await exercisesRepo.findAllForAdmin({ categoryId })

      expect(mockExercise.find).toHaveBeenCalledWith({
        categoryId: new mongoose.Types.ObjectId(categoryId)
      })
    })

    it('should filter by active status for admin', async () => {
      const mockQueryChain = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockExerciseList),
      }

      mockExercise.find.mockReturnValue(mockQueryChain as any)

      await exercisesRepo.findAllForAdmin({ isActive: false })

      expect(mockExercise.find).toHaveBeenCalledWith({ isActive: false })
    })
  })

  describe('Error Handling', () => {
    it('should handle connection errors gracefully', async () => {
      const connectionError = new Error('MongoDB connection failed')
      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(connectionError),
      }

      mockExercise.find.mockReturnValue(mockQueryChain as any)

      await expect(exercisesRepo.findAll()).rejects.toThrow('MongoDB connection failed')
    })

    it('should handle validation errors during creation', async () => {
      const validationError = new Error('Exercise name is required')
      const mockSave = jest.fn().mockRejectedValue(validationError)
      
      mockExercise.mockImplementation(() => ({
        save: mockSave
      } as any))

      await expect(exercisesRepo.create({
        name: '',
        categoryId: '507f1f77bcf86cd799439012',
        createdBy: '507f1f77bcf86cd799439013'
      })).rejects.toThrow('Exercise name is required')
    })

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Operation timed out')
      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(timeoutError),
      }

      mockExercise.findById.mockReturnValue(mockQueryChain as any)

      await expect(exercisesRepo.findById('507f1f77bcf86cd799439011'))
        .rejects.toThrow('Operation timed out')
    })
  })

  describe('Performance and Optimization', () => {
    it('should use lean queries for performance', async () => {
      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }

      mockExercise.find.mockReturnValue(mockQueryChain as any)

      await exercisesRepo.findAll()

      expect(mockQueryChain.lean).toHaveBeenCalled()
    })

    it('should use appropriate field selection', async () => {
      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }

      mockExercise.find.mockReturnValue(mockQueryChain as any)

      await exercisesRepo.findByCategory('507f1f77bcf86cd799439012')

      expect(mockQueryChain.select).toHaveBeenCalledWith('_id name description imageUrl createdAt')
    })

    it('should use compound indexes effectively', async () => {
      const mockQueryChain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }

      mockExercise.find.mockReturnValue(mockQueryChain as any)

      // Test query that should use compound index { createdBy: 1, categoryId: 1 }
      await exercisesRepo.findByCreator('507f1f77bcf86cd799439013')

      expect(mockExercise.find).toHaveBeenCalledWith({
        createdBy: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013')
      })
    })
  })
})
