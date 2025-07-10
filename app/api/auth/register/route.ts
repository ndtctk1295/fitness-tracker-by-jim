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
    
    if (error.message === 'User with this email already exists') {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists',
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Registration failed',
      },
      { status: 500 }
    );
  }
}
