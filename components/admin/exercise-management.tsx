'use client';

import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dumbbell, 
  Pencil, 
  Trash2,
  FolderClosed,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { exerciseService, Exercise } from '@/lib/services/exercise-service';
import { categoryService, Category } from '@/lib/services/category-service';

interface ExerciseFormData {
  name: string;
  categoryId: string;
  description?: string;
  imageUrl?: string;
}

export function ExerciseManagement() {
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [formData, setFormData] = useState<ExerciseFormData>({
    name: '',
    categoryId: '',
    description: '',
    imageUrl: '',
  });
  const [deletingExerciseId, setDeletingExerciseId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await exerciseService.getAll();
      setExercises(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load exercises',
        variant: 'destructive',
      });
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive',
      });
      console.error('Error loading categories:', error);
    }
  };

  useEffect(() => {
    loadExercises();
    loadCategories();
  }, []);

  const handleOpenCreateDialog = () => {
    setCurrentExercise(null);
    setFormData({
      name: '',
      categoryId: categories.length > 0 ? categories[0]._id : '',
      description: '',
      imageUrl: '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (exercise: Exercise) => {
    setCurrentExercise(exercise);
    setFormData({
      name: exercise.name,
      categoryId: exercise.categoryId,
      description: exercise.description || '',
      imageUrl: exercise.imageUrl || '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenDeleteDialog = (id: string) => {
    setDeletingExerciseId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      if (!formData.name || !formData.categoryId) {
        toast({
          title: 'Validation Error',
          description: 'Name and category are required fields',
          variant: 'destructive',
        });
        return;
      }
      
      if (currentExercise) {
        // Update existing exercise
        await exerciseService.update(currentExercise._id, formData);
        toast({
          title: 'Success',
          description: 'Exercise updated successfully',
        });
      } else {
        // Create new exercise
        await exerciseService.create(formData);
        toast({
          title: 'Success',
          description: 'Exercise created successfully',
        });
      }
      
      setIsDialogOpen(false);
      loadExercises();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Operation failed',
        variant: 'destructive',
      });
      console.error('Exercise operation error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingExerciseId) return;
    
    try {
      setSubmitting(true);
      await exerciseService.delete(deletingExerciseId);
      
      toast({
        title: 'Success',
        description: 'Exercise deleted successfully',
      });
      
      setIsDeleteDialogOpen(false);
      setDeletingExerciseId(null);
      loadExercises();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete exercise',
        variant: 'destructive',
      });
      console.error('Error deleting exercise:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.color : '#000000';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Exercise Management</h2>
        <Button onClick={handleOpenCreateDialog}>
          <Dumbbell className="h-4 w-4 mr-2" />
          Add Exercise
        </Button>
      </div>
      
      {loading ? (
        <Card>
          <CardContent className="flex justify-center items-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading exercises...</span>
          </CardContent>
        </Card>
      ) : exercises.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <Dumbbell className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No exercises found</p>
            <Button onClick={handleOpenCreateDialog} variant="outline" className="mt-4">
              Create your first exercise
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exercises.map((exercise) => (
              <TableRow key={exercise._id}>
                <TableCell className="font-medium">{exercise.name}</TableCell>
                <TableCell>
                  <Badge style={{ backgroundColor: getCategoryColor(exercise.categoryId) }}>
                    {getCategoryName(exercise.categoryId)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[400px] truncate">
                  {exercise.description || 'No description'}
                </TableCell>
                <TableCell className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEditDialog(exercise)}
                    title="Edit exercise"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDeleteDialog(exercise._id)}
                    title="Delete exercise"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      {/* Create/Edit Exercise Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentExercise ? 'Edit Exercise' : 'Create New Exercise'}
            </DialogTitle>
            <DialogDescription>
              {currentExercise
                ? 'Update the exercise details below'
                : 'Fill in the exercise details below'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Exercise name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <div className="col-span-3">
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => handleSelectChange('categoryId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          <div className="flex items-center">
                            <span
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: category.color }}
                            ></span>
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Exercise description (optional)"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  placeholder="Image URL (optional)"
                  value={formData.imageUrl || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {currentExercise ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{currentExercise ? 'Update' : 'Create'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this exercise? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
