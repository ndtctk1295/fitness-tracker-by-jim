import { z } from 'zod';

// Category import validation schema
export const categoryImportSchema = z.object({
  name: z.string()
    .min(1, "Category name is required")
    .max(50, "Category name must be less than 50 characters")
    .trim(),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code (e.g., #FF0000)"),
  description: z.string()
    .max(200, "Description must be less than 200 characters")
    .trim()
    .optional()
});

// Exercise import validation schema
export const exerciseImportSchema = z.object({
  name: z.string()
    .min(1, "Exercise name is required")
    .max(100, "Exercise name must be less than 100 characters")
    .trim(),
  categoryName: z.string()
    .min(1, "Category name is required")
    .trim(),
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .trim()
    .optional(),
  imageUrl: z.string()
    .url("Invalid image URL")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean()
    .default(true),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: "Difficulty must be 'beginner', 'intermediate', or 'advanced'" })
  }),
  muscleGroups: z.array(z.string().trim())
    .min(1, "At least one muscle group is required")
    .max(10, "Maximum 10 muscle groups allowed"),
  equipment: z.array(z.string().trim())
    .max(10, "Maximum 10 equipment items allowed")
    .optional(),
  instructions: z.array(z.string().trim())
    .min(1, "At least one instruction is required")
    .max(20, "Maximum 20 instructions allowed"),
  tips: z.array(z.string().trim())
    .max(10, "Maximum 10 tips allowed")
    .optional()
});

// Main import data validation schema
export const importDataSchema = z.object({
  categories: z.array(categoryImportSchema)
    .min(1, "At least one category is required"),
  exercises: z.array(exerciseImportSchema)
    .min(1, "At least one exercise is required")
});

// Validation function with detailed error reporting
export function validateImportData(data: any): { 
  success: boolean; 
  data?: z.infer<typeof importDataSchema>; 
  errors?: string[] 
} {
  try {
    const validatedData = importDataSchema.parse(data);
    
    // Additional business logic validation
    const errors: string[] = [];
    
    // Check for duplicate category names
    const categoryNames = validatedData.categories.map(c => c.name.toLowerCase());
    const duplicateCategories = categoryNames.filter((name, index) => 
      categoryNames.indexOf(name) !== index
    );
    if (duplicateCategories.length > 0) {
      errors.push(`Duplicate category names found: ${duplicateCategories.join(', ')}`);
    }
    
    // Check for duplicate exercise names
    const exerciseNames = validatedData.exercises.map(e => e.name.toLowerCase());
    const duplicateExercises = exerciseNames.filter((name, index) => 
      exerciseNames.indexOf(name) !== index
    );
    if (duplicateExercises.length > 0) {
      errors.push(`Duplicate exercise names found: ${duplicateExercises.join(', ')}`);
    }
    
    // Check if all exercise categories exist in the categories array
    const availableCategories = validatedData.categories.map(c => c.name.toLowerCase());
    const missingCategories = validatedData.exercises
      .map(e => e.categoryName.toLowerCase())
      .filter(catName => !availableCategories.includes(catName));
    
    const uniqueMissingCategories = [...new Set(missingCategories)];
    if (uniqueMissingCategories.length > 0) {
      errors.push(`Exercises reference categories that don't exist: ${uniqueMissingCategories.join(', ')}`);
    }
    
    if (errors.length > 0) {
      return { success: false, errors };
    }
    
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      return { success: false, errors };
    }
    return { success: false, errors: ['Invalid JSON format'] };
  }
}
