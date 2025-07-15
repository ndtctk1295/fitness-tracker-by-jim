import { NextRequest, NextResponse } from 'next/server';
import { usersRepo } from '@/lib/repositories';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate credentials using the repository
    const user = await usersRepo.validateCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Format and return the user data
    const formattedUser = usersRepo.formatUserResponse(user);
    
    return NextResponse.json({
      id: formattedUser.id,
      name: formattedUser.name,
      email: formattedUser.email,
      role: formattedUser.role,
      image: formattedUser.image,
    });

  } catch (error) {
    console.error('[API] Error validating credentials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// This route runs in Node.js runtime, not Edge Runtime, so it can use Mongoose
export const runtime = 'nodejs';
