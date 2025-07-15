import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';
import { authOptions } from '../../auth/[...nextauth]/route';
import { categoriesRepo, usersRepo } from '@/lib/repositories';
import mongoose from 'mongoose';

// GET endpoint - accessible to all authenticated users
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in' }, 
        { status: 401 }
      );
    }
    
    const { id } = await params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      );
    }
    
    // Use repository to find category by ID
    const category = await categoriesRepo.findById(id);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(category);  } catch (error) {
    const { id } = await params;
    console.error(`Error getting category ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to retrieve category' }, 
      { status: 500 }
    );
  }
}

// PUT endpoint - accessible only to admins
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in' }, 
        { status: 401 }
      );
    }
    
    const { id } = await params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      );
    }
      // Check if user is an admin using repository
    const user = await usersRepo.findByEmail(session.user.email);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' }, 
        { status: 403 }
      );
    }
    
    const data = await req.json();
    
    // Use repository to update category
    const category = await categoriesRepo.update(
      id,
      { 
        ...data, 
        updatedBy: user._id 
      }
    );
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(category);  } catch (error) {
    const { id } = await params;
    console.error(`Error updating category ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update category' }, 
      { status: 500 }
    );
  }
}

// DELETE endpoint - accessible only to admins
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in' }, 
        { status: 401 }      );
    }
    
    const { id } = await params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      );
    }
      // Check if user is an admin using repository
    const user = await usersRepo.findByEmail(session.user.email);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' }, 
        { status: 403 }
      );
    }
    
    // Use repository to delete category
    const category = await categoriesRepo.delete(id);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Category deleted successfully' });  } catch (error) {
    const { id } = await params;
    console.error(`Error deleting category ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete category' }, 
      { status: 500 }
    );
  }
}
