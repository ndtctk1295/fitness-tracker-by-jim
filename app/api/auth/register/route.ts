import { NextRequest, NextResponse } from 'next/server';
import { usersRepo } from '@/lib/repositories';
import { z } from 'zod';

// Schema for request validation
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'admin']).optional()
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const validation = registerSchema.safeParse(body);
    // console.log('Validation result:', validation.data, validation.error, validation.success);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          errors: validation.error.errors 
        }, 
        { status: 400 }
      );
    }
    const { name, email, password, role = 'user' } = validation.data;
    
    console.log('Registering user:', { name, email, role });
    // Create the user using repository
    const user = await usersRepo.create({ name, email, password, role });    // Return the created user without the password
    return NextResponse.json(
      {
        success: true,
        data: usersRepo.formatUserResponse(user),
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle specific database errors
    if (error.message === 'User with this email already exists') {
      return NextResponse.json(
        {
          success: false,
          error: 'A user with this email address already exists. Please use a different email or try signing in.',
          code: 'EMAIL_EXISTS'
        },
        { status: 409 }
      );
    }
    
    // Handle MongoDB duplicate key error (alternative check)
    if (error.code === 11000 || error.message.includes('duplicate key')) {
      return NextResponse.json(
        {
          success: false,
          error: 'A user with this email address already exists. Please use a different email or try signing in.',
          code: 'EMAIL_EXISTS'
        },
        { status: 409 }
      );
    }
    
    // Handle other database connection errors
    if (error.message.includes('ECONNREFUSED') || error.message.includes('connection')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection error. Please try again later.',
          code: 'DATABASE_ERROR'
        },
        { status: 500 }
      );
    }
    
    // Generic error fallback
    return NextResponse.json(
      {
        success: false,
        error: 'Registration failed due to an unexpected error. Please try again.',
        code: 'REGISTRATION_ERROR'
      },
      { status: 500 }
    );
  }
}
