// Central type definitions for the fitness tracker application
// This file consolidates all client-side interfaces to avoid duplication

// =============================================================================
// CORE ENTITY INTERFACES
// =============================================================================

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  color: string;
  description?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  _id: string;
  name: string;
  categoryId: string;
  description?: string;
  imageUrl?: string;
  // Admin-controlled fields
  isActive: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  muscleGroups: string[];
  equipment?: string[];
  instructions: string[];
  tips?: string[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;  // User preference data (populated from user-exercise-preference when needed)
  userStatus?: 'favorite' | null;
  userNotes?: string;
  userCustomSettings?: {
    sets?: number;
    reps?: number;
    weight?: number;
    restTime?: number;
    duration?: number;
  };
  lastUsed?: string;
}

export interface ScheduledExerciseSet {
  exerciseId: string;
  reps: number;
  weight: number;
  duration?: number;
  restTime?: number;
}

export interface ScheduledExercise {
  _id: string;
  userId: string;
  exerciseId: string;
  categoryId: string;
  workoutPlanId?: string; // Optional reference to workout plan
  date: string;
  sets: number;
  reps: number;
  weight: number;
  weightPlates?: Record<string, number>;
  isHidden?: boolean; // Flag to hide exercise (used for template overrides)
  orderIndex?: number;
  notes?: string;
  completed?: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimerStrategy {
  _id: string;
  userId: string;
  name: string;
  color: string;
  restDuration: number;
  activeDuration: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeightPlate {
  _id: string;
  userId: string;
  value: number;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseOrder {
  _id: string;
  userId: string;
  date: string;
  orderedExerciseIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseTemplate {
  exerciseId: string;
  categoryId: string;
  sets: number;
  reps: number;
  weight: number;
  weightPlates?: Record<string, number>;
  notes?: string;
}

// =============================================================================
// STORE-SPECIFIC INTERFACES (Frontend uses 'id', API uses '_id')
// =============================================================================

export interface StoreUser extends Omit<User, '_id'> {
  id: string;
}

export interface StoreCategory extends Omit<Category, '_id'> {
  id: string;
}

export interface StoreExercise extends Omit<Exercise, '_id' | 'categoryId'> {
  id: string;
  categoryId: string;
}

export interface StoreScheduledExercise extends Omit<ScheduledExercise, '_id' | 'exerciseId' | 'userId'> {
  id: string;
  exerciseId: string;
  userId?: string;
}

export interface StoreTimerStrategy extends Omit<TimerStrategy, '_id' | 'userId' | 'createdAt' | 'updatedAt'> {
  id: string;
  cycles?: number;
  breakDuration?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StoreWeightPlate extends Omit<WeightPlate, '_id' | 'userId' | 'createdAt' | 'updatedAt'> {
  id: string;
  unit?: 'kg' | 'lbs';
  quantity?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StoreExerciseOrder extends Omit<ExerciseOrder, '_id'> {
  id: string;
}

// =============================================================================
// API REQUEST/RESPONSE INTERFACES
// =============================================================================

// User related
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
  image?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'user' | 'admin';
  image?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiUserResponse {
  success: boolean;
  data?: User;
  message?: string;
}

// Category related
export interface CreateCategoryData {
  name: string;
  color: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  color?: string;
  description?: string;
}

// Exercise related
export interface CreateExerciseData {
  name: string;
  categoryId: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateExerciseData {
  name?: string;
  categoryId?: string;
  description?: string;
  imageUrl?: string;
}

// Scheduled Exercise related
export interface CreateScheduledExerciseData {
  userId: string;
  exerciseId: string;
  categoryId: string;
  date: string;
  sets: ScheduledExerciseSet[];
  notes?: string;
  completed?: boolean;
}

export interface UpdateScheduledExerciseData {
  sets?: ScheduledExerciseSet[];
  notes?: string;
  completed?: boolean;
}

// Timer Strategy related
export interface CreateTimerStrategyData {
  name: string;
  workDuration: number;
  restDuration: number;
  cycles: number;
  breakDuration: number;
}

export interface UpdateTimerStrategyData {
  name?: string;
  workDuration?: number;
  restDuration?: number;
  cycles?: number;
  breakDuration?: number;
}

// Weight Plate related
export interface CreateWeightPlateData {
  weight: number;
  unit: 'kg' | 'lbs';
  quantity: number;
}

export interface UpdateWeightPlateData {
  weight?: number;
  unit?: 'kg' | 'lbs';
  quantity?: number;
}

// Exercise Order related
export interface CreateExerciseOrderData {
  exerciseIds: string[];
}

export interface UpdateExerciseOrderData {
  exerciseIds: string[];
}

// =============================================================================
// STORE STATE INTERFACES
// =============================================================================

export interface CategoryState {
  categories: Category[];
  selectedCategory: Category | null;
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  selectCategory: (id: string) => void;
  addCategory: (category: CreateCategoryData) => Promise<void>;
  updateCategory: (id: string, data: UpdateCategoryData) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export interface ExerciseStoreState {
  exercises: Exercise[];
  categories: Category[];
  scheduledExercises: ScheduledExercise[];
  selectedDate: Date;
  isLoading: boolean;
  error: string | null;
  fetchExercises: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchScheduledExercises: (date: string) => Promise<void>;
  addScheduledExercise: (exercise: ScheduledExercise) => Promise<void>;
  updateScheduledExercise: (id: string, updates: Partial<ScheduledExercise>) => Promise<void>;
  deleteScheduledExercise: (id: string) => Promise<void>;
  setSelectedDate: (date: Date) => void;
}

export interface ExerciseOrderState {
  // State
  orderedExerciseIds: string[];
  
  // Actions
  setOrderedExerciseIds: (ids: string[]) => void;
  updateOrderOnDrag: (activeId: string, overId: string) => void;
  syncOrderedIdsWithScheduledExercises: (
    scheduledExercises: StoreScheduledExercise[],
    selectedDate: string,
    activeTimerScheduledDate: string | null
  ) => void;
  ensureOrderedExercises: (
    scheduledExercises: StoreScheduledExercise[],
    selectedDate: string,
    activeTimerScheduledDate: string | null
  ) => void;
  getOrderedExercises: (
    scheduledExercises: StoreScheduledExercise[],
    selectedDate: string,
    activeTimerScheduledDate: string | null
  ) => StoreScheduledExercise[];
}

// =============================================================================
// COMPONENT PROP INTERFACES
// =============================================================================

export interface ExerciseCardProps {
  exercise: Exercise;
  category: Category;
  onAddToWorkout?: (exercise: Exercise) => void;
}

export interface ExerciseListProps {
  exercises: Exercise[];
  categories: Category[];
  onExerciseSelect?: (exercise: Exercise) => void;
}

export interface ExerciseTemplateListProps {
  selectedDate?: Date;
  onTemplateApplied?: () => void;
}
