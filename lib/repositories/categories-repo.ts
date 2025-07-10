import connectToMongoDB from '@/lib/mongodb';
import Category, { CategoryDocument } from '@/lib/models/category';
import mongoose from 'mongoose';
import { UserDocument } from '../models/user';

/**
 * Optimized Repository for Category entity operations
 */
class CategoriesRepository {
  /**
   * Get all categories with optional sorting - Optimized with lean queries
   */
  async findAll(sort: Record<string, 1 | -1> = { name: 1 }): Promise<CategoryDocument[]> {
    try {
      await connectToMongoDB();
      return await Category
        .find({})
        .select('_id name color description createdBy updatedBy createdAt updatedAt')
        .lean()
        .sort(sort)
        .exec();
    } catch (error) {
      console.error('Error in CategoriesRepository.findAll:', error);
      throw error;
    }
  }

  /**
   * Get categories by creator - Optimized for user-specific queries
   */
  async findByCreator(createdBy: string): Promise<CategoryDocument[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(createdBy)) {
        throw new Error('Invalid creator ID format');
      }
      
      await connectToMongoDB();
      return await Category
        .find({ createdBy: new mongoose.Types.ObjectId(createdBy) })
        .select('_id name color description createdAt')
        .lean()
        .sort({ name: 1 })
        .exec();
    } catch (error) {
      console.error(`Error in CategoriesRepository.findByCreator(${createdBy}):`, error);
      throw error;
    }
  }

  /**
   * Get a category by ID - Optimized
   */
  async findById(id: string): Promise<CategoryDocument | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid category ID format');
      }
      
      await connectToMongoDB();
      return await Category
        .findById(id)
        .select('_id name color description createdBy updatedBy createdAt updatedAt')
        .lean()
        .exec();
    } catch (error) {
      console.error(`Error in CategoriesRepository.findById(${id}):`, error);
      throw error;
    }
  }

  /**
   * Create a new category
   */
  async create(data: {
    name: string;
    color: string;
    description?: string;
    createdBy: UserDocument['_id'];
  }): Promise<CategoryDocument> {
    try {
      await connectToMongoDB();
      
      const category = new Category({
        ...data,
        updatedBy: data.createdBy // Initially the same as the creator
      });
      
      await category.save();
      return category;
    } catch (error) {
      console.error('Error in CategoriesRepository.create:', error);
      throw error;
    }
  }
  /**
   * Update an existing category - Optimized
   */
  async update(
    id: string, 
    data: {
      name?: string;
      color?: string;
      description?: string;
      updatedBy: UserDocument['_id'];
    }
  ): Promise<CategoryDocument | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid category ID format');
      }
      
      await connectToMongoDB();
      
      return await Category
        .findByIdAndUpdate(id, { ...data }, { 
          new: true, 
          runValidators: true,
          lean: true 
        })
        .select('_id name color description createdBy updatedBy createdAt updatedAt')
        .exec();
    } catch (error) {
      console.error(`Error in CategoriesRepository.update(${id}):`, error);
      throw error;
    }
  }

  /**
   * Delete a category by ID - Optimized
   */
  async delete(id: string): Promise<CategoryDocument | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid category ID format');
      }
      
      await connectToMongoDB();
      return await Category
        .findByIdAndDelete(id)
        .lean()
        .exec();
    } catch (error) {
      console.error(`Error in CategoriesRepository.delete(${id}):`, error);
      throw error;
    }
  }
}

// Export singleton instance
const categoriesRepo = new CategoriesRepository();
export default categoriesRepo;
