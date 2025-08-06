/**
 * Exercise API Routes Test Suite
 * Tests all API endpoints: /api/exercises, /api/exercises/available, /api/exercises/[id]
 * Covers authentication, authorization, validation, and error handling
 */

// Mock Next.js modules first
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200
    }))
  }
}))

// Mock dependencies
jest.mock('next-auth')
jest.mock('@/app/api/auth/[...nextauth]/route')
jest.mock('@/lib/repositories/exercises-repo')
jest.mock('@/middleware/isAdmin')
jest.mock('mongoose')

// Setup test environment
Object.defineProperty(global, 'Request', {
  value: jest.fn().mockImplementation((url, options) => ({
    url,
    method: options?.method || 'GET',
    json: options?.body ? async () => options.body : undefined
  })),
  writable: true
})

Object.defineProperty(global, 'Response', {
  value: jest.fn().mockImplementation((body, options) => ({
    json: async () => JSON.parse(body),
    status: options?.status || 200
  })),
  writable: true
})

// Import API handlers after mocking
import { NextRequest } from 'next/server'
import { GET as exercisesGET, POST as exercisesPOST } from '@/app/api/exercises/route'
import { GET as availableGET } from '@/app/api/exercises/available/route'
import { 
  GET as exerciseByIdGET, 
  PUT as exerciseByIdPUT, 
  DELETE as exerciseByIdDELETE 
} from '@/app/api/exercises/[id]/route'

import { getServerSession } from 'next-auth'
import exercisesRepo from '@/lib/repositories/exercises-repo'
import isAdmin from '@/middleware/isAdmin'
import mongoose from 'mongoose'

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockExercisesRepo = exercisesRepo as jest.Mocked<typeof exercisesRepo>
const mockIsAdmin = isAdmin as jest.MockedFunction<typeof isAdmin>
const mockMongoose = mongoose as jest.Mocked<typeof mongoose>

// Sample test data
const mockExercises = [
  {
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
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    _id: '507f1f77bcf86cd799439014',
    name: 'Bench Press',
    categoryId: '507f1f77bcf86cd799439015',
    description: 'Weight training exercise',
    difficulty: 'intermediate',
    muscleGroups: ['chest', 'triceps'],
    equipment: ['barbell', 'bench'],
    instructions: ['Lie on bench', 'Grip bar', 'Lower to chest', 'Press up'],
    tips: ['Use spotter'],
    isActive: true,
    createdBy: '507f1f77bcf86cd799439013',
    updatedBy: '507f1f77bcf86cd799439013',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

const mockUser = {
  id: '507f1f77bcf86cd799439013',
  name: 'Test User',
  email: 'test@example.com'
}

const mockAdminUser = {
  id: '507f1f77bcf86cd799439016',
  name: 'Admin User',
  email: 'admin@example.com'
}

const createMockRequest = (url: string, options: {
  method?: string
  body?: any
  searchParams?: Record<string, string>
} = {}) => {
  const searchParams = new URLSearchParams(options.searchParams)
  const fullUrl = `http://localhost:3000${url}${searchParams.toString() ? '?' + searchParams.toString() : ''}`
  
  return {
    url: fullUrl,
    method: options.method || 'GET',
    json: options.body ? async () => options.body : undefined
  } as NextRequest
}

describe('Exercise API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true)
  })

  describe('/api/exercises - GET', () => {
    it('should return all exercises', async () => {
      mockExercisesRepo.findAll.mockResolvedValue(mockExercises as any)
      
      const request = createMockRequest('/api/exercises')
      const response = await exercisesGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockExercises)
      expect(mockExercisesRepo.findAll).toHaveBeenCalledWith()
    })

    it('should filter exercises by category', async () => {
      const categoryId = '507f1f77bcf86cd799439012'
      mockExercisesRepo.findByCategory.mockResolvedValue([mockExercises[0]] as any)
      
      const request = createMockRequest('/api/exercises', {
        searchParams: { categoryId }
      })
      const response = await exercisesGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual([mockExercises[0]])
      expect(mockExercisesRepo.findByCategory).toHaveBeenCalledWith(categoryId)
    })

    it('should handle repository errors', async () => {
      mockExercisesRepo.findAll.mockRejectedValue(new Error('Database error'))
      
      const request = createMockRequest('/api/exercises')
      const response = await exercisesGET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch exercises')
    })
  })

  describe('/api/exercises - POST', () => {
    it('should create exercise with admin authorization', async () => {
      mockGetServerSession.mockResolvedValue({ user: mockAdminUser } as any)
      mockIsAdmin.mockResolvedValue(true)
      mockExercisesRepo.create.mockResolvedValue(mockExercises[0] as any)
      
      const exerciseData = {
        name: 'New Exercise',
        categoryId: '507f1f77bcf86cd799439012',
        description: 'A new exercise'
      }
      
      const request = createMockRequest('/api/exercises', {
        method: 'POST',
        body: exerciseData
      })
      const response = await exercisesPOST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(mockExercises[0])
      expect(mockExercisesRepo.create).toHaveBeenCalledWith({
        ...exerciseData,
        createdBy: mockAdminUser.id
      })
    })

    it('should reject unauthorized users', async () => {
      mockGetServerSession.mockResolvedValue(null)
      
      const request = createMockRequest('/api/exercises', {
        method: 'POST',
        body: { name: 'Test' }
      })
      const response = await exercisesPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should reject non-admin users', async () => {
      mockGetServerSession.mockResolvedValue({ user: mockUser } as any)
      mockIsAdmin.mockResolvedValue(false)
      
      const request = createMockRequest('/api/exercises', {
        method: 'POST',
        body: { name: 'Test' }
      })
      const response = await exercisesPOST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden - Admin access required')
    })

    it('should validate required fields', async () => {
      mockGetServerSession.mockResolvedValue({ user: mockAdminUser } as any)
      mockIsAdmin.mockResolvedValue(true)
      
      const request = createMockRequest('/api/exercises', {
        method: 'POST',
        body: { description: 'Missing name and category' }
      })
      const response = await exercisesPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Name and category are required')
    })

    it('should handle creation errors', async () => {
      mockGetServerSession.mockResolvedValue({ user: mockAdminUser } as any)
      mockIsAdmin.mockResolvedValue(true)
      mockExercisesRepo.create.mockRejectedValue(new Error('Creation failed'))
      
      const request = createMockRequest('/api/exercises', {
        method: 'POST',
        body: { name: 'Test', categoryId: '123' }
      })
      const response = await exercisesPOST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create exercise')
    })
  })

  describe('/api/exercises/available - GET', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({ user: mockUser } as any)
    })

    it('should return available exercises with authentication', async () => {
      mockExercisesRepo.findActive.mockResolvedValue(mockExercises as any)
      
      const request = createMockRequest('/api/exercises/available')
      const response = await availableGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.exercises).toEqual(mockExercises)
      expect(data.total).toBe(2)
      expect(data.filters.activeOnly).toBe(true)
    })

    it('should filter by difficulty', async () => {
      mockExercisesRepo.findByDifficulty.mockResolvedValue([mockExercises[0]] as any)
      
      const request = createMockRequest('/api/exercises/available', {
        searchParams: { difficulty: 'beginner' }
      })
      const response = await availableGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.exercises).toHaveLength(1)
      expect(mockExercisesRepo.findByDifficulty).toHaveBeenCalledWith('beginner')
    })

    it('should filter by muscle group', async () => {
      mockExercisesRepo.findByMuscleGroups.mockResolvedValue(mockExercises as any)
      
      const request = createMockRequest('/api/exercises/available', {
        searchParams: { muscleGroup: 'chest' }
      })
      const response = await availableGET(request)

      expect(mockExercisesRepo.findByMuscleGroups).toHaveBeenCalledWith(['chest'])
    })

    it('should apply equipment filter client-side', async () => {
      const exercisesWithEquipment = [
        { ...mockExercises[0], equipment: ['bodyweight'] },
        { ...mockExercises[1], equipment: ['barbell', 'bench'] }
      ]
      mockExercisesRepo.findActive.mockResolvedValue(exercisesWithEquipment as any)
      
      const request = createMockRequest('/api/exercises/available', {
        searchParams: { equipment: 'bodyweight' }
      })
      const response = await availableGET(request)
      const data = await response.json()

      expect(data.exercises).toHaveLength(1)
      expect(data.exercises[0].equipment).toContain('bodyweight')
    })

    it('should apply pagination', async () => {
      mockExercisesRepo.findActive.mockResolvedValue(mockExercises as any)
      
      const request = createMockRequest('/api/exercises/available', {
        searchParams: { page: '1', limit: '1' }
      })
      const response = await availableGET(request)
      const data = await response.json()

      expect(data.exercises).toHaveLength(1)
    })

    it('should reject unauthorized users', async () => {
      mockGetServerSession.mockResolvedValue(null)
      
      const request = createMockRequest('/api/exercises/available')
      const response = await availableGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should handle repository errors', async () => {
      mockExercisesRepo.findActive.mockRejectedValue(new Error('Database error'))
      
      const request = createMockRequest('/api/exercises/available')
      const response = await availableGET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch exercises from database')
    })

    it('should handle activeOnly=false', async () => {
      mockExercisesRepo.findAll.mockResolvedValue(mockExercises as any)
      
      const request = createMockRequest('/api/exercises/available', {
        searchParams: { activeOnly: 'false' }
      })
      const response = await availableGET(request)

      expect(mockExercisesRepo.findAll).toHaveBeenCalled()
    })
  })

  describe('/api/exercises/[id] - GET', () => {
    it('should return specific exercise by ID', async () => {
      const exerciseId = '507f1f77bcf86cd799439011'
      mockExercisesRepo.findById.mockResolvedValue(mockExercises[0] as any)
      
      const request = createMockRequest(`/api/exercises/${exerciseId}`)
      const response = await exerciseByIdGET(request, { params: { id: exerciseId } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockExercises[0])
      expect(mockExercisesRepo.findById).toHaveBeenCalledWith(exerciseId)
    })

    it('should validate ObjectId format', async () => {
      mockMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false)
      
      const request = createMockRequest('/api/exercises/invalid-id')
      const response = await exerciseByIdGET(request, { params: { id: 'invalid-id' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid exercise ID format')
    })

    it('should return 404 for non-existent exercise', async () => {
      mockExercisesRepo.findById.mockResolvedValue(null)
      
      const exerciseId = '507f1f77bcf86cd799439011'
      const request = createMockRequest(`/api/exercises/${exerciseId}`)
      const response = await exerciseByIdGET(request, { params: { id: exerciseId } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Exercise not found')
    })

    it('should handle repository errors', async () => {
      mockExercisesRepo.findById.mockRejectedValue(new Error('Database error'))
      
      const exerciseId = '507f1f77bcf86cd799439011'
      const request = createMockRequest(`/api/exercises/${exerciseId}`)
      const response = await exerciseByIdGET(request, { params: { id: exerciseId } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch exercise')
    })
  })

  describe('/api/exercises/[id] - PUT', () => {
    it('should update exercise with admin authorization', async () => {
      const exerciseId = '507f1f77bcf86cd799439011'
      const updateData = { name: 'Updated Exercise', description: 'Updated description' }
      
      mockGetServerSession.mockResolvedValue({ user: mockAdminUser } as any)
      mockIsAdmin.mockResolvedValue(true)
      mockExercisesRepo.findById.mockResolvedValue(mockExercises[0] as any)
      mockExercisesRepo.update.mockResolvedValue({ ...mockExercises[0], ...updateData } as any)
      
      const request = createMockRequest(`/api/exercises/${exerciseId}`, {
        method: 'PUT',
        body: updateData
      })
      const response = await exerciseByIdPUT(request, { params: { id: exerciseId } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockExercisesRepo.update).toHaveBeenCalledWith(exerciseId, {
        ...updateData,
        updatedBy: mockAdminUser.id
      })
    })

    it('should reject unauthorized users', async () => {
      mockGetServerSession.mockResolvedValue(null)
      
      const exerciseId = '507f1f77bcf86cd799439011'
      const request = createMockRequest(`/api/exercises/${exerciseId}`, {
        method: 'PUT',
        body: { name: 'Test' }
      })
      const response = await exerciseByIdPUT(request, { params: { id: exerciseId } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should reject non-admin users', async () => {
      mockGetServerSession.mockResolvedValue({ user: mockUser } as any)
      mockIsAdmin.mockResolvedValue(false)
      
      const exerciseId = '507f1f77bcf86cd799439011'
      const request = createMockRequest(`/api/exercises/${exerciseId}`, {
        method: 'PUT',
        body: { name: 'Test' }
      })
      const response = await exerciseByIdPUT(request, { params: { id: exerciseId } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden - Admin access required')
    })

    it('should validate ObjectId format', async () => {
      mockMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false)
      mockGetServerSession.mockResolvedValue({ user: mockAdminUser } as any)
      mockIsAdmin.mockResolvedValue(true)
      
      const request = createMockRequest('/api/exercises/invalid-id', {
        method: 'PUT',
        body: { name: 'Test' }
      })
      const response = await exerciseByIdPUT(request, { params: { id: 'invalid-id' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid exercise ID format')
    })

    it('should return 404 for non-existent exercise', async () => {
      mockGetServerSession.mockResolvedValue({ user: mockAdminUser } as any)
      mockIsAdmin.mockResolvedValue(true)
      mockExercisesRepo.findById.mockResolvedValue(null)
      
      const exerciseId = '507f1f77bcf86cd799439011'
      const request = createMockRequest(`/api/exercises/${exerciseId}`, {
        method: 'PUT',
        body: { name: 'Test' }
      })
      const response = await exerciseByIdPUT(request, { params: { id: exerciseId } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Exercise not found')
    })
  })

  describe('/api/exercises/[id] - DELETE', () => {
    it('should delete exercise with admin authorization', async () => {
      const exerciseId = '507f1f77bcf86cd799439011'
      
      mockGetServerSession.mockResolvedValue({ user: mockAdminUser } as any)
      mockIsAdmin.mockResolvedValue(true)
      mockExercisesRepo.delete.mockResolvedValue(mockExercises[0] as any)
      
      const request = createMockRequest(`/api/exercises/${exerciseId}`, {
        method: 'DELETE'
      })
      const response = await exerciseByIdDELETE(request, { params: { id: exerciseId } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Exercise deleted successfully')
      expect(mockExercisesRepo.delete).toHaveBeenCalledWith(exerciseId)
    })

    it('should reject unauthorized users', async () => {
      mockGetServerSession.mockResolvedValue(null)
      
      const exerciseId = '507f1f77bcf86cd799439011'
      const request = createMockRequest(`/api/exercises/${exerciseId}`, {
        method: 'DELETE'
      })
      const response = await exerciseByIdDELETE(request, { params: { id: exerciseId } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should reject non-admin users', async () => {
      mockGetServerSession.mockResolvedValue({ user: mockUser } as any)
      mockIsAdmin.mockResolvedValue(false)
      
      const exerciseId = '507f1f77bcf86cd799439011'
      const request = createMockRequest(`/api/exercises/${exerciseId}`, {
        method: 'DELETE'
      })
      const response = await exerciseByIdDELETE(request, { params: { id: exerciseId } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden - Admin access required')
    })

    it('should validate ObjectId format', async () => {
      mockMongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false)
      mockGetServerSession.mockResolvedValue({ user: mockAdminUser } as any)
      mockIsAdmin.mockResolvedValue(true)
      
      const request = createMockRequest('/api/exercises/invalid-id', {
        method: 'DELETE'
      })
      const response = await exerciseByIdDELETE(request, { params: { id: 'invalid-id' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid exercise ID format')
    })

    it('should return 404 for non-existent exercise', async () => {
      mockGetServerSession.mockResolvedValue({ user: mockAdminUser } as any)
      mockIsAdmin.mockResolvedValue(true)
      mockExercisesRepo.delete.mockResolvedValue(null)
      
      const exerciseId = '507f1f77bcf86cd799439011'
      const request = createMockRequest(`/api/exercises/${exerciseId}`, {
        method: 'DELETE'
      })
      const response = await exerciseByIdDELETE(request, { params: { id: exerciseId } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Exercise not found')
    })

    it('should handle deletion errors', async () => {
      mockGetServerSession.mockResolvedValue({ user: mockAdminUser } as any)
      mockIsAdmin.mockResolvedValue(true)
      mockExercisesRepo.delete.mockRejectedValue(new Error('Deletion failed'))
      
      const exerciseId = '507f1f77bcf86cd799439011'
      const request = createMockRequest(`/api/exercises/${exerciseId}`, {
        method: 'DELETE'
      })
      const response = await exerciseByIdDELETE(request, { params: { id: exerciseId } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to delete exercise')
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete CRUD workflow', async () => {
      // Setup admin session for all operations
      mockGetServerSession.mockResolvedValue({ user: mockAdminUser } as any)
      mockIsAdmin.mockResolvedValue(true)

      // 1. Create exercise
      const createData = {
        name: 'Test Exercise',
        categoryId: '507f1f77bcf86cd799439012',
        description: 'Test description'
      }
      
      mockExercisesRepo.create.mockResolvedValue(mockExercises[0] as any)
      
      const createRequest = createMockRequest('/api/exercises', {
        method: 'POST',
        body: createData
      })
      const createResponse = await exercisesPOST(createRequest)
      expect(createResponse.status).toBe(201)

      // 2. Read exercise
      mockExercisesRepo.findById.mockResolvedValue(mockExercises[0] as any)
      
      const readRequest = createMockRequest('/api/exercises/507f1f77bcf86cd799439011')
      const readResponse = await exerciseByIdGET(readRequest, { 
        params: { id: '507f1f77bcf86cd799439011' } 
      })
      expect(readResponse.status).toBe(200)

      // 3. Update exercise
      const updateData = { name: 'Updated Exercise' }
      mockExercisesRepo.findById.mockResolvedValue(mockExercises[0] as any)
      mockExercisesRepo.update.mockResolvedValue({ ...mockExercises[0], ...updateData } as any)
      
      const updateRequest = createMockRequest('/api/exercises/507f1f77bcf86cd799439011', {
        method: 'PUT',
        body: updateData
      })
      const updateResponse = await exerciseByIdPUT(updateRequest, { 
        params: { id: '507f1f77bcf86cd799439011' } 
      })
      expect(updateResponse.status).toBe(200)

      // 4. Delete exercise
      mockExercisesRepo.delete.mockResolvedValue(mockExercises[0] as any)
      
      const deleteRequest = createMockRequest('/api/exercises/507f1f77bcf86cd799439011', {
        method: 'DELETE'
      })
      const deleteResponse = await exerciseByIdDELETE(deleteRequest, { 
        params: { id: '507f1f77bcf86cd799439011' } 
      })
      expect(deleteResponse.status).toBe(200)
    })

    it('should enforce consistent authorization across all endpoints', async () => {
      const endpoints = [
        { handler: exercisesPOST, method: 'POST', requiresAuth: true, requiresAdmin: true },
        { handler: exerciseByIdPUT, method: 'PUT', requiresAuth: true, requiresAdmin: true },
        { handler: exerciseByIdDELETE, method: 'DELETE', requiresAuth: true, requiresAdmin: true },
        { handler: availableGET, method: 'GET', requiresAuth: true, requiresAdmin: false }
      ]

      for (const endpoint of endpoints) {
        // Test no authentication
        mockGetServerSession.mockResolvedValue(null)
        
        let request: NextRequest
        let response: Response
        
        if (endpoint.method === 'GET') {
          request = createMockRequest('/api/exercises/available')
          response = await availableGET(request)
        } else {
          request = createMockRequest('/api/exercises', {
            method: endpoint.method,
            body: { name: 'Test' }
          })
          
          if (endpoint.method === 'POST') {
            response = await exercisesPOST(request)
          } else {
            const params = { params: { id: '507f1f77bcf86cd799439011' } }
            if (endpoint.method === 'PUT') {
              response = await exerciseByIdPUT(request, params)
            } else {
              response = await exerciseByIdDELETE(request, params)
            }
          }
        }
        
        expect(response.status).toBe(401)
        
        // Test admin requirement if applicable
        if (endpoint.requiresAdmin) {
          mockGetServerSession.mockResolvedValue({ user: mockUser } as any)
          mockIsAdmin.mockResolvedValue(false)
          
          if (endpoint.method === 'POST') {
            response = await exercisesPOST(request)
          } else {
            const params = { params: { id: '507f1f77bcf86cd799439011' } }
            if (endpoint.method === 'PUT') {
              response = await exerciseByIdPUT(request, params)
            } else {
              response = await exerciseByIdDELETE(request, params)
            }
          }
          
          expect(response.status).toBe(403)
        }
      }
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed JSON in request body', async () => {
      mockGetServerSession.mockResolvedValue({ user: mockAdminUser } as any)
      mockIsAdmin.mockResolvedValue(true)
      
      const request = {
        url: 'http://localhost:3000/api/exercises',
        method: 'POST',
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      } as any
      
      const response = await exercisesPOST(request)
      const data = await response.json()
      
      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create exercise')
    })

    it('should handle concurrent requests gracefully', async () => {
      mockGetServerSession.mockResolvedValue({ user: mockUser } as any)
      mockExercisesRepo.findActive.mockResolvedValue(mockExercises as any)
      
      const requests = Array(5).fill(null).map(() => 
        createMockRequest('/api/exercises/available')
      )
      
      const responses = await Promise.all(
        requests.map(request => availableGET(request))
      )
      
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })
      
      expect(mockExercisesRepo.findActive).toHaveBeenCalledTimes(5)
    })

    it('should handle repository timeout errors', async () => {
      mockExercisesRepo.findAll.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      )
      
      const request = createMockRequest('/api/exercises')
      const response = await exercisesGET(request)
      const data = await response.json()
      
      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch exercises')
    })
  })
})
